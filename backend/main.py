from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys

# Force unbuffered output
sys.stdout.reconfigure(encoding='utf-8')
from app.core.database import db
from app.routers import auth, upload, documents, chat
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.APP_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Events
@app.on_event("startup")
async def startup_db_client():
    await db.connect_to_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.close_database_connection()

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.get("/health")
def health_check():
    return {"status": "OK", "backend": "FastAPI + Python"}

from fastapi import Request
@app.get("/debug/headers")
def debug_headers(request: Request):
    return {"headers": dict(request.headers)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
