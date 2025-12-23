from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Optional
from datetime import datetime
import ollama
import re

from app.models.schemas import (
    ChatQuery, ChatResponse, Source, 
    ChatSessionCreate, ChatSessionResponse, 
    ChatMessageCreate, ChatMessageResponse,
    LoadSessionResponse
)
from app.core.database import get_database
from app.services import chat as chat_service
from app.routers.auth import get_current_user
from app.core.vectordb import get_vector_db

router = APIRouter()

@router.post("/query", response_model=ChatResponse)
async def query_knowledge_base(
    body: ChatQuery,
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    query = body.query
    selected_ids = body.selected_doc_ids
    
    # 1. Get Vector DB
    db_vec, table = get_vector_db()
    if table is None:
        return ChatResponse(answer="No documents uploaded yet.", sources=[])
        
    # 2. Build Search Query
    # Restrict to user's documents and specific doc_ids if provided
    where_clause = f"user_id = '{current_user['user_id']}'"
    if selected_ids:
        doc_ids_str = " OR ".join([f"doc_id = '{did}'" for did in selected_ids])
        where_clause += f" AND ({doc_ids_str})"
    
    # Generate embedding for query
    embed_res = ollama.embeddings(model="nomic-embed-text", prompt=query)
    query_vector = embed_res["embedding"]
    
    # Search top 5 results
    results = table.search(query_vector).where(where_clause).limit(5).to_list()
    
    if not results:
         return ChatResponse(answer="I couldn't find relevant info in your active documents.", sources=[])
         
    # 3. Context & RAG
    context_parts = []
    for r in results:
        context_parts.append(f"Document: {r['file_name']}\nContent: {r['text']}")
    
    context_text = "\n\n---\n\n".join(context_parts)
    
    system_prompt = f"""You are a precise knowledge assistant. You have access to the following documents.\n\nContext:\n{context_text}\n\nINSTRUCTIONS:\n1. Answer the user's question based ONLY on the provided Context.\n2. DO NOT mention source filenames, documents, or "Source:" labels in your response. I will display the source attribution in the UI separately.
3. Only use inline citations (e.g., [FileName]) if there is a direct conflict or contradiction between multiple documents that needs clarification."""
    
    try:
        chat_res = ollama.chat(model="mistral", messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ])
        
        answer = chat_res["message"]["content"]
        
        # Post-processing: Strip trailing "Source: ..." or "Sources: ..."
        answer = re.sub(r'(?i)\n*source[s]?:\s*.*$', '', answer).strip()
        
        # Deduplicate sources
        seen_files = set()
        sources = []
        for r in results:
            if r["file_name"] not in seen_files:
                sources.append(Source(file_name=r["file_name"], page=None))
                seen_files.add(r["file_name"])
                
        return ChatResponse(answer=answer, sources=sources)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama chat error: {str(e)}")


@router.post("/session")
async def create_chat_session(
    body: ChatSessionCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_database),
):
    session = await chat_service.create_session(
        db, 
        user_id=current_user["user_id"], 
        title=body.title,
        active_doc_ids=body.active_doc_ids
    )
    return ChatSessionResponse(
        session_id=session["session_id"],
        user_id=session["user_id"],
        title=session["title"],
        active_doc_ids=session["active_doc_ids"],
        created_at=session["created_at"],
        updated_at=session["updated_at"]
    )

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(
    current_user = Depends(get_current_user),
    db = Depends(get_database),
):
    sessions = await chat_service.list_sessions(db, user_id=current_user["user_id"])
    return [
        ChatSessionResponse(
            session_id=s["session_id"],
            user_id=s["user_id"],
            title=s["title"],
            active_doc_ids=s["active_doc_ids"],
            created_at=s["created_at"],
            updated_at=s["updated_at"]
        ) for s in sessions
    ]

@router.get("/session/{session_id}")
async def load_chat_session(
    session_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_database),
):
    session = await chat_service.get_session(db, session_id=session_id, user_id=current_user["user_id"])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await chat_service.get_messages(db, session_id=session_id)
    
    session_resp = ChatSessionResponse(
        session_id=session["session_id"],
        user_id=session["user_id"],
        title=session["title"],
        active_doc_ids=session["active_doc_ids"],
        created_at=session["created_at"],
        updated_at=session["updated_at"]
    )

    msgs = [
        ChatMessageResponse(
            message_id=m["message_id"],
            session_id=m["session_id"],
            role=m["role"],
            content=m["content"],
            sources=m.get("sources"),
            created_at=m["created_at"]
        ) for m in messages
    ]

    return LoadSessionResponse(session=session_resp, messages=msgs)


@router.patch("/session/{session_id}")
async def update_chat_session(
    session_id: str, 
    body: dict = Body(...), 
    current_user = Depends(get_current_user), 
    db = Depends(get_database)
):
    session = await chat_service.get_session(db, session_id=session_id, user_id=current_user["user_id"])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Only update fields that are actually in the request body
    title = body.get("title")
    active_doc_ids = body.get("active_doc_ids")

    await chat_service.update_session(
        db, 
        session_id=session_id, 
        user_id=current_user["user_id"], 
        title=title, 
        active_doc_ids=active_doc_ids
    )
    return {"ok": True}


@router.delete("/session/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_database),
):
    # Verify session belongs to user
    session = await chat_service.get_session(db, session_id=session_id, user_id=current_user["user_id"])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Delete all messages in the session
    await db.chat_messages.delete_many({"session_id": session_id})
    # Delete the session itself
    await db.chat_sessions.delete_one({"session_id": session_id})
    
    return {"ok": True}


@router.post("/message")
async def send_message(
    body: ChatMessageCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_database),
):
    # Validate session belongs to user
    session = await chat_service.get_session(db, session_id=body.session_id, user_id=current_user["user_id"])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 1. Store user's message (immutable)
    user_msg = await chat_service.add_message(db, session_id=body.session_id, role="user", content=body.message)

    # Check if we should generate a title (if still "New Chat" and early in the conversation)
    message_count = await db.chat_messages.count_documents({"session_id": body.session_id})
    should_generate_title = session.get("title") == "New Chat" and message_count <= 2

    # 2. Build RAG context using session.active_doc_ids or global filters
    db_vec, table = get_vector_db()
    if table is None:
        # No documents uploaded
        assistant_content = "No documents uploaded yet."
        assistant_msg = await chat_service.add_message(db, session_id=body.session_id, role="assistant", content=assistant_content)
        
        # Generate title if needed
        title = None
        if should_generate_title:
            try:
                title = await generate_session_title(body.message)
                await chat_service.update_session(db, session_id=body.session_id, user_id=current_user["user_id"], title=title)
            except Exception: pass
        
        return {"assistant": assistant_content, "title": title}

    # Build where clause to restrict to user's documents and to active_doc_ids
    where_clause = f"user_id = '{current_user['user_id']}'"
    active_ids = session.get("active_doc_ids", [])
    if active_ids:
        doc_ids_str = " OR ".join([f"doc_id = '{did}'" for did in active_ids])
        where_clause += f" AND ({doc_ids_str})"

    results = table.search(ollama.embeddings(model="nomic-embed-text", prompt=body.message)["embedding"]).where(where_clause).limit(5).to_list()

    # If no results, reply accordingly
    if not results:
        assistant_content = "I couldn't find relevant info in your active documents."
        assistant_msg = await chat_service.add_message(db, session_id=body.session_id, role="assistant", content=assistant_content)
        
        # Generate title if needed
        title = None
        if should_generate_title:
            try:
                title = await generate_session_title(body.message)
                await chat_service.update_session(db, session_id=body.session_id, user_id=current_user["user_id"], title=title)
            except Exception: pass
        
        return {"assistant": assistant_content, "title": title}

    # 3. Build context
    context_parts = [f"Document: {r['file_name']}\nContent: {r['text']}" for r in results]
    context_text = "\n\n---\n\n".join(context_parts)

    system_prompt = f"""You are a precise knowledge assistant. You have access to the following documents.\n\nContext:\n{context_text}\n\nINSTRUCTIONS:\n1. Answer the user's question based ONLY on the provided Context.\n2. DO NOT mention source filenames, documents, or "Source:" labels in your response. I will display the source attribution in the UI separately.
3. Only use inline citations (e.g., [FileName]) if there is a direct conflict or contradiction between multiple documents that needs clarification."""

    try:
        chat_res = ollama.chat(model="mistral", messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": body.message}
        ])

        assistant_content = chat_res["message"]["content"]
        
        # Post-processing: Strip trailing "Source: ..." or "Sources: ..." if the model ignored the system prompt
        assistant_content = re.sub(r'(?i)\n*source[s]?:\s*.*$', '', assistant_content).strip()
        
        # Extract sources from results
        seen_files = set()
        sources = []
        for r in results:
            if r["file_name"] not in seen_files:
                sources.append({"file_name": r["file_name"], "page": None})
                seen_files.add(r["file_name"])
        
        assistant_msg = await chat_service.add_message(
            db, 
            session_id=body.session_id, 
            role="assistant", 
            content=assistant_content,
            sources=sources
        )

        # 4. Generate title if needed (if still "New Chat" and early in the conversation)
        title = None
        if should_generate_title:
            try:
                title = await generate_session_title(body.message)
                await chat_service.update_session(db, session_id=body.session_id, user_id=current_user["user_id"], title=title)
                print(f"DEBUG: Generated and saved title: {title}")
            except Exception as e:
                print(f"DEBUG: Failed to generate title: {e}")

        return {"assistant": assistant_content, "sources": sources, "title": title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama chat error: {str(e)}")


async def generate_session_title(user_message: str) -> str:
    """
    Generate a meaningful chat session title from the user's first message.
    Returns a short title describing what the chat is about.
    """
    try:
        prompt = f"""Given this user message, generate a SHORT chat title (2-5 words max) that describes what the chat is ABOUT, not what was literally said.

User message: "{user_message}"

Examples:
- User: "Tell me about cloud computing" → Title: "Cloud Computing Basics"
- User: "How do I make coffee?" → Title: "Coffee Making Guide"
- User: "What's the weather like?" → Title: "Weather Information"

Generate ONLY the title, nothing else:"""
        
        response = ollama.generate(model="mistral", prompt=prompt, stream=False)
        title = response.get("response", "").strip()
        
        # Clean up the title
        title = title.replace("\n", "").replace('"', "").strip()
        if not title or len(title) == 0:
            title = "New Chat"
        # Limit to reasonable length
        if len(title) > 50:
            title = title[:50].rsplit(" ", 1)[0]
        
        return title
    except Exception as e:
        print(f"Failed to generate title: {e}")
        return "New Chat"
