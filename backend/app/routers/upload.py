from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import List, Optional
import os
import uuid
import shutil
import hashlib
from datetime import datetime, timezone, timedelta
from app.core.database import get_database
from app.core.config import get_settings
from app.models.schemas import DocumentResponse
from app.services.auth import get_current_user
from app.services.document_processor import process_and_embed

router = APIRouter()
settings = get_settings()

# IST timezone (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

def get_ist_now():
    """Get current time in IST"""
    return datetime.now(IST)

@router.post("/local", response_model=dict)
async def upload_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    folder: str = Form("Root"),
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    uploaded_docs = []

    for file in files:
        # Generate unique filename/path
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Calculate checksum (reload file to read content)
        with open(file_path, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
            
        doc_id = str(uuid.uuid4())
        
        # Create DB record
        doc_record = {
            "doc_id": doc_id,
            "user_id": current_user["user_id"],
            "file_name": file.filename,
            "source": "local",
            "folder": folder,
            "checksum": file_hash,
            "file_size": os.path.getsize(file_path),
            "mime_type": file.content_type,
            "uploaded_at": get_ist_now(),
            "status": "processing",
            "local_path": file_path
        }
        
        await db.documents.insert_one(doc_record)

        # Convert _id to string for serialization
        doc_record["_id"] = str(doc_record["_id"])
        
        # Add processing task to background
        background_tasks.add_task(
            process_document_task, 
            doc_id, 
            current_user["user_id"],
            file_path, 
            file.content_type, 
            {"file_name": file.filename, "folder": folder},
            db
        )
        
        uploaded_docs.append(doc_record)
        
    return {
        "message": f"{len(uploaded_docs)} files uploaded successfully",
        "documents": uploaded_docs
    }

async def process_document_task(doc_id, user_id, file_path, mime_type, metadata, db):
    try:
        await process_and_embed(doc_id, user_id, file_path, mime_type, metadata)
        await db.documents.update_one(
            {"doc_id": doc_id}, 
            {"$set": {"status": "ready"}}
        )
        print(f"✅ Processed {metadata['file_name']}")
    except Exception as e:
        print(f"❌ Error processing {metadata['file_name']}: {e}")
        await db.documents.update_one(
            {"doc_id": doc_id}, 
            {"$set": {"status": "failed"}}
        )

@router.get("/status/{doc_id}")
async def get_upload_status(doc_id: str, current_user = Depends(get_current_user), db = Depends(get_database)):
    doc = await db.documents.find_one({"doc_id": doc_id, "user_id": current_user["user_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": doc["status"]}
