from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    APP_NAME: str = "KBC Backend"
    MONGODB_URI: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    OLLAMA_HOST: str = "http://localhost:11434"
    UPLOAD_DIR: str = "uploads"
    VECTOR_DB_PATH: str = "data/vectordb"
    PORT: int = 5000

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "../../.env")
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()

