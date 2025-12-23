import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def verify_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["kbc"]
    
    print("=" * 60)
    print("VERIFYING MONGODB DATA")
    print("=" * 60)
    
    # Check chat_sessions
    sessions = await db.chat_sessions.find({}).to_list(length=10)
    print(f"\n✅ Chat Sessions ({len(sessions)} found):")
    for s in sessions:
        print(f"  - Session ID: {s.get('session_id')}")
        print(f"    Title: {s.get('title')}")
        print(f"    User ID: {s.get('user_id')}")
        print(f"    Active Docs: {s.get('active_doc_ids')}")
        print()
    
    # Check chat_messages
    messages = await db.chat_messages.find({}).to_list(length=20)
    print(f"✅ Chat Messages ({len(messages)} found):")
    for m in messages:
        print(f"  - Message ID: {m.get('message_id')}")
        print(f"    Session ID: {m.get('session_id')}")
        print(f"    Role: {m.get('role')}")
        print(f"    Content: {m.get('content')[:80]}...")
        print()
    
    print("=" * 60)
    print("✅ Data persistence verification complete!")
    print("=" * 60)
    
    await client.close()

asyncio.run(verify_db())
