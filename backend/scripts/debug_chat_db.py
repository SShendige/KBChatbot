import asyncio
from app.core.database import db

async def main():
    await db.connect_to_database()
    database = db.db
    print("Connected DB name:", getattr(database, 'name', 'unknown'))

    # Insert test session
    test_session = {
        "session_id": "debug-session-1",
        "user_id": "debug-user-1",
        "title": "Debug Session",
        "active_doc_ids": [],
    }

    res = await database.chat_sessions.insert_one(test_session)
    print("Inserted session id:", res.inserted_id)

    # Read it back
    sessions = await database.chat_sessions.find({"user_id": "debug-user-1"}).to_list(length=10)
    print("Sessions:", sessions)

    # Insert test message
    test_message = {
        "message_id": "debug-message-1",
        "session_id": "debug-session-1",
        "role": "user",
        "content": "Hello debug",
    }
    res2 = await database.chat_messages.insert_one(test_message)
    print("Inserted message id:", res2.inserted_id)

    messages = await database.chat_messages.find({"session_id": "debug-session-1"}).to_list(length=10)
    print("Messages:", messages)

    await db.close_database_connection()

if __name__ == '__main__':
    asyncio.run(main())
