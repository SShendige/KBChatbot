import os
import pypdf
import docx
import ollama
from app.core.vectordb import get_vector_db

async def parse_file(file_path: str, mime_type: str) -> str:
    text = ""
    try:
        if mime_type == "application/pdf":
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        elif "word" in mime_type:
            doc = docx.Document(file_path)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        else: # txt, md
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
    except Exception as e:
        print(f"Error parsing file: {e}")
        raise e
        
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200):
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunks.append(text[start:end])
        start += chunk_size - overlap
        
    return chunks

async def process_and_embed(doc_id: str, user_id: str, file_path: str, mime_type: str, metadata: dict):
    # 1. Parse
    text = await parse_file(file_path, mime_type)
    
    # 2. Chunk
    chunks = chunk_text(text)
    
    # 3. Embed & Store
    db, table = get_vector_db()
    
    vectors = []
    for i, chunk in enumerate(chunks):
        # Generate embedding using Ollama
        response = ollama.embeddings(model="nomic-embed-text", prompt=chunk)
        embedding = response["embedding"]
        
        vectors.append({
            "id": f"{doc_id}_{i}",
            "vector": embedding,
            "text": chunk,
            "doc_id": doc_id,
            "user_id": user_id,
            "file_name": metadata.get("file_name"),
            "folder": metadata.get("folder"),
            "chunk_index": i
        })
        
    # Store in LanceDB
    if table is None:
        # Create table if it doesn't exist
        db.create_table("documents", data=vectors)
    else:
        table.add(vectors)
        
    return len(chunks)
