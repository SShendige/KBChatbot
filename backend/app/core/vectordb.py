import os
from app.core.config import get_settings

settings = get_settings()

# lancedb is optional for RAG; fail gracefully if not installed so app can still run
try:
    import lancedb  # type: ignore
except Exception as e:
    lancedb = None
    print(f"⚠️ lancedb not available: {e}")


def get_vector_db():
    # If lancedb not installed, return (None, None) so callers can handle it
    if lancedb is None:
        return None, None

    # Ensure directory exists
    os.makedirs(settings.VECTOR_DB_PATH, exist_ok=True)

    # Connect
    db = lancedb.connect(settings.VECTOR_DB_PATH)

    # Open or Create 'documents' table
    try:
        table = db.open_table("documents")
    except Exception:
        # If table doesn't exist, we'll create it on first write
        table = None

    return db, table
