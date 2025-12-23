# 🚀 Quick Start Guide - KBC Project (Python Edition)

## What You Have Now
✅ **Frontend**: React + Atomic Design (Port 3000)
✅ **Backend**: Python FastAPI + LangChain/Ollama (Port 5000)
✅ **Database**: MongoDB (Metadata) + LanceDB (Vectors)
✅ **AI**: Ollama (Mistral 7B + Nomic Embednings)

## 🛠️ Prerequisites
1. **Python 3.10+** installed
2. **Node.js** installed (for frontend)
3. **MongoDB** running (`mongod`)
4. **Ollama** installed & running (`ollama serve`)

## ⚡ Start the App

### 1. Setup Backend (Python)
```bash
cd backend
# python -m venv venv
# Windows:
venv\Scripts\Activate.ps1
# .\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Run Server
python main.py
```
*API Docs available at http://localhost:5000/docs*

### 2. Setup Frontend (React)
```bash
# New terminal, root folder
npm start
```

## 🧠 AI Setup (Ollama)
Ensure you have the models:
```bash
ollama pull mistral
ollama pull nomic-embed-text
```

## 📂 Project Structure
```
backend/
├── app/
│   ├── core/           # Config, DB, Security
│   ├── models/         # Pydantic Schemas
│   ├── routers/        # API Endpoints (Auth, Chat, etc.)
│   ├── services/       # Business Logic (Embeddings, RAG)
│   └── utils/
├── main.py             # Entry Point
├── requirements.txt
└── .env
```

## 💬 Chat Sessions & Messages (New)

We store user chat sessions and immutable messages in MongoDB. This lets users resume past chats and create multiple sessions.

API Endpoints (prefix: `/api/chat`)

- **Create New Chat**
	- POST `/session`
	- Body: `{ "title": "Optional title", "active_doc_ids": ["docA"] }`
	- Response: `{ "session_id": "<uuid>", "title": "New Chat" }`

- **List User's Chats (Sidebar)**
	- GET `/sessions`
	- Response: `[{ "session_id": "1", "title": "Resume Analysis" }, ...]`

- **Load a Chat Session**
	- GET `/session/{session_id}`
	- Response: `{ "session": {...}, "messages": [...] }`

- **Update Session (title, active docs)**
	- PATCH `/session/{session_id}`
	- Body: `{ "title": "New title", "active_doc_ids": ["docA"] }`
	- Response: `{ "ok": true }`

- **Send Message (Continue Chat)**
	- POST `/message`
	- Body: `{ "session_id": "<uuid>", "message": "Your question" }`
	- The backend stores the user's message, performs RAG on the user's active documents (DO NOT embed conversations), calls the LLM and stores the assistant response as an immutable message.

Notes:
- Conversations are stored in MongoDB `chat_sessions` and `chat_messages` collections.
- We do NOT embed chat content into the vector DB; documents stay separate from chat transcripts.

