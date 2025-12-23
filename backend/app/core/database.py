from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

    async def connect_to_database(self):
        settings = get_settings()
        self.client = AsyncIOMotorClient(settings.MONGODB_URI)
        try:
            self.db = self.client.get_default_database()
        except:
            self.db = self.client["kbc"]
        print("✅ MongoDB Connected")
        await self.init_collections()

    async def init_collections(self):
        """Initialize MongoDB collections and indexes"""
        try:
            # Ensure collections exist by creating them with validation
            collections = await self.db.list_collection_names()

            # Create chat_sessions collection if it doesn't exist
            if "chat_sessions" not in collections:
                await self.db.create_collection("chat_sessions")
                print("✅ Created collection: chat_sessions")
                # Create indexes
                await self.db.chat_sessions.create_index([("user_id", 1)])
                await self.db.chat_sessions.create_index([("session_id", 1)], unique=True)
                await self.db.chat_sessions.create_index([("updated_at", -1)])
                print("✅ Created indexes for chat_sessions")
            
            # Create chat_messages collection if it doesn't exist
            if "chat_messages" not in collections:
                await self.db.create_collection("chat_messages")
                print("✅ Created collection: chat_messages")
                # Create indexes
                await self.db.chat_messages.create_index([("session_id", 1)])
                await self.db.chat_messages.create_index([("message_id", 1)], unique=True)
                await self.db.chat_messages.create_index([("created_at", 1)])
                print("✅ Created indexes for chat_messages")
            else:
                print("✓ Collection chat_messages already exists")

            # Ensure users collection exists
            if "users" not in collections:
                await self.db.create_collection("users")
                print("✅ Created collection: users")
                await self.db.users.create_index([("email", 1)], unique=True)
                await self.db.users.create_index([("user_id", 1)], unique=True)
                print("✅ Created indexes for users")
            else:
                print("✓ Collection users already exists")

        except Exception as e:
            print(f"⚠️ Error initializing collections: {e}")

    async def close_database_connection(self):
        if self.client:
            self.client.close()
            print("❌ MongoDB Connection Closed")

db = Database()

async def get_database():
    return db.db
