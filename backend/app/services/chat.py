from datetime import datetime, timezone, timedelta
import uuid
from typing import List, Optional

# IST timezone (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

def get_ist_now():
    """Get current time in IST"""
    return datetime.now(IST)


async def create_session(db, user_id: str, title: Optional[str] = "New Chat", active_doc_ids: Optional[List[str]] = None):
    if active_doc_ids is None:
        active_doc_ids = []

    session = {
        "session_id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title or "New Chat",
        "active_doc_ids": active_doc_ids,
        "created_at": get_ist_now(),
        "updated_at": get_ist_now(),
    }

    await db.chat_sessions.insert_one(session)
    # Debug log
    try:
        inserted = await db.chat_sessions.find_one({"session_id": session["session_id"]})
        print(f"DEBUG: Created chat session {session['session_id']} for user {user_id}")
    except Exception as e:
        print(f"DEBUG: Could not verify session insert: {e}")
    return session


async def list_sessions(db, user_id: str):
    cursor = db.chat_sessions.find({"user_id": user_id}).sort("updated_at", -1)
    sessions = await cursor.to_list(length=100)
    return sessions


async def get_session(db, session_id: str, user_id: str):
    session = await db.chat_sessions.find_one({"session_id": session_id, "user_id": user_id})
    return session


async def update_session_active_docs(db, session_id: str, user_id: str, active_doc_ids: List[str]):
    res = await db.chat_sessions.update_one(
        {"session_id": session_id, "user_id": user_id},
        {"$set": {"active_doc_ids": active_doc_ids, "updated_at": get_ist_now()}}
    )
    return res


async def update_session(db, session_id: str, user_id: str, title: Optional[str] = None, active_doc_ids: Optional[List[str]] = None):
    set_fields = {}
    if title is not None:
        set_fields["title"] = title
    if active_doc_ids is not None:
        set_fields["active_doc_ids"] = active_doc_ids
    if set_fields:
        set_fields["updated_at"] = get_ist_now()
        res = await db.chat_sessions.update_one({"session_id": session_id, "user_id": user_id}, {"$set": set_fields})
        return res
    return None


async def add_message(db, session_id: str, role: str, content: str, sources: Optional[List[dict]] = None):
    message = {
        "message_id": str(uuid.uuid4()),
        "session_id": session_id,
        "role": role,
        "content": content,
        "sources": sources or [],
        "created_at": get_ist_now(),
    }
    res = await db.chat_messages.insert_one(message)
    # Debug log
    try:
        print(f"DEBUG: Inserted message {message['message_id']} (db id: {res.inserted_id}) into session {session_id}")
    except Exception:
        pass

    # Also update session updated_at
    await db.chat_sessions.update_one({"session_id": session_id}, {"$set": {"updated_at": get_ist_now()}})
    return message


async def get_messages(db, session_id: str, limit: Optional[int] = None):
    cursor = db.chat_messages.find({"session_id": session_id}).sort("created_at", 1)
    if limit:
        messages = await cursor.to_list(length=limit)
    else:
        messages = await cursor.to_list(length=1000)
    return messages
