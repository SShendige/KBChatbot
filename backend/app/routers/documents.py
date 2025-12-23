from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.core.database import get_database
from app.models.schemas import DocumentResponse
from app.services.auth import get_current_user

router = APIRouter()

@router.get("", response_model=dict)
async def get_documents(
    folder: Optional[str] = None,
    current_user = Depends(get_current_user), 
    db = Depends(get_database)
):
    query = {"user_id": current_user["user_id"]}
    if folder:
        query["folder"] = folder
        
    cursor = db.documents.find(query).sort("uploaded_at", -1)
    documents = await cursor.to_list(length=100)
    
    # Convert _id to string for serialization
    for doc in documents:
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
            
    return {"documents": documents}

@router.get("/folders", response_model=dict)
async def get_folders(current_user = Depends(get_current_user), db = Depends(get_database)):
    folders = await db.documents.distinct("folder", {"user_id": current_user["user_id"]})
    return {"folders": [f for f in folders if f]}

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, current_user = Depends(get_current_user), db = Depends(get_database)):
    result = await db.documents.delete_one({"doc_id": doc_id, "user_id": current_user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # TODO: Clean up vector DB records if needed (LanceDB doesn't support fine-grained delete easily yet in some versions,
    # usually you rebuild index or filter out by ID in application logic)
    
    return {"message": "Document deleted"}
