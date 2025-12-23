#!/usr/bin/env python3
"""
Test MongoDB connection and verify collections exist
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings

async def test_connection():
    settings = get_settings()
    print(f"MongoDB URI: {settings.MONGODB_URI}")
    
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Get database
        try:
            db = client.get_default_database()
            db_name = db.name
        except:
            db = client["kbc"]
            db_name = "kbc"
        
        print(f"✅ Using database: {db_name}")
        
        # List collections
        collections = await db.list_collection_names()
        print(f"✅ Collections in DB: {collections}")
        
        # Check chat_sessions collection
        if "chat_sessions" in collections:
            count = await db.chat_sessions.count_documents({})
            print(f"✅ chat_sessions collection has {count} documents")
            
            # Show sample documents
            if count > 0:
                sample = await db.chat_sessions.find_one()
                print(f"   Sample session: {sample}")
        else:
            print("❌ chat_sessions collection does not exist")
        
        # Check chat_messages collection
        if "chat_messages" in collections:
            count = await db.chat_messages.count_documents({})
            print(f"✅ chat_messages collection has {count} documents")
            
            # Show sample documents
            if count > 0:
                sample = await db.chat_messages.find_one()
                print(f"   Sample message: {sample}")
        else:
            print("❌ chat_messages collection does not exist")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
