from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None

class DocumentBase(BaseModel):
    file_name: str
    folder: str = "Root"

class DocumentResponse(DocumentBase):
    doc_id: str
    user_id: str
    source: str
    file_size: int
    mime_type: str
    uploaded_at: datetime
    status: str

    class Config:
        from_attributes = True

class ChatQuery(BaseModel):
    query: str
    selected_doc_ids: List[str] = []
    folder: Optional[str] = None


class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"
    active_doc_ids: List[str] = []


class ChatSessionResponse(BaseModel):
    session_id: str
    user_id: str
    title: str
    active_doc_ids: List[str]
    created_at: datetime
    updated_at: datetime


class ChatMessageCreate(BaseModel):
    session_id: str
    message: str


class ChatMessageResponse(BaseModel):
    message_id: str
    session_id: str
    role: str
    content: str
    sources: Optional[List[dict]] = None
    created_at: datetime


class LoadSessionResponse(BaseModel):
    session: ChatSessionResponse
    messages: List[ChatMessageResponse]

class Source(BaseModel):
    file_name: str
    page: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source]
