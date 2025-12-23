# KBC System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React Frontend - Port 3000)                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP/REST API
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS BACKEND                            │
│                      (Node.js - Port 5000)                      │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Auth       │  │   Upload     │  │    Chat      │         │
│  │   Routes     │  │   Routes     │  │   Routes     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Embedding   │  │   Vector     │  │    LLM       │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    MongoDB      │  │   Vector DB     │  │   OpenAI API    │
│                 │  │ (Pinecone/      │  │                 │
│  • Users        │  │  Qdrant)        │  │  • Embeddings   │
│  • Documents    │  │                 │  │  • Chat         │
│  • Chunks       │  │  • Embeddings   │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 📊 Data Flow

### 1. Document Upload Flow

```
User Uploads File
      │
      ▼
Frontend (FileUploadZone)
      │
      ▼
Backend (/api/upload/local)
      │
      ├─► Validate File (type, size)
      │
      ├─► Calculate Checksum
      │
      ├─► Save to MongoDB (Document)
      │
      ├─► Parse Document (PDF/DOCX)
      │
      ├─► Split into Chunks
      │
      ├─► Generate Embeddings (OpenAI)
      │
      ├─► Store in Vector DB (Pinecone)
      │
      └─► Update Status → "ready"
```

### 2. Chat Query Flow

```
User Asks Question
      │
      ▼
Frontend (ChatInterface)
      │
      ▼
Backend (/api/chat/query)
      │
      ├─► Generate Query Embedding
      │
      ├─► Search Vector DB
      │   (filter by user_id + selected doc_ids)
      │
      ├─► Retrieve Top-K Chunks
      │
      ├─► Build Context
      │
      ├─► Send to LLM (OpenAI)
      │
      └─► Return Answer + Sources
            │
            ▼
      Frontend Displays Response
```

## 🎨 Frontend Component Hierarchy

```
App
 │
 ├─ AuthProvider
 │   ├─ DocumentProvider
 │   │   └─ ChatProvider
 │   │       │
 │   │       ├─ Login Page
 │   │       │   ├─ Input (email)
 │   │       │   ├─ Input (password)
 │   │       │   └─ Button (submit)
 │   │       │
 │   │       └─ Dashboard Page
 │   │           │
 │   │           ├─ Sidebar
 │   │           │   ├─ FolderSelector
 │   │           │   │   └─ Folder Items
 │   │           │   └─ Button (upload)
 │   │           │
 │   │           ├─ ChatInterface (view)
 │   │           │   ├─ ChatMessage (list)
 │   │           │   │   ├─ Message Bubble
 │   │           │   │   └─ Sources
 │   │           │   ├─ Input (query)
 │   │           │   └─ Button (send)
 │   │           │
 │   │           ├─ DocumentList (view)
 │   │           │   └─ DocumentCard (grid)
 │   │           │       ├─ Checkbox
 │   │           │       ├─ Badge (status)
 │   │           │       └─ Button (delete)
 │   │           │
 │   │           └─ UploadModal
 │   │               ├─ Input (folder)
 │   │               ├─ FileUploadZone
 │   │               └─ Button (upload)
```

## 🗄️ Database Schema Relationships

```
┌─────────────┐
│    User     │
│             │
│  user_id ◄──┼────────┐
│  email      │        │
│  password   │        │
└─────────────┘        │
                       │ (1:N)
                       │
                ┌──────▼──────┐
                │  Document   │
                │             │
                │  doc_id  ◄──┼────────┐
                │  user_id    │        │
                │  file_name  │        │
                │  folder     │        │
                │  status     │        │
                └─────────────┘        │ (1:N)
                                       │
                                ┌──────▼──────┐
                                │    Chunk    │
                                │             │
                                │  chunk_id   │
                                │  doc_id     │
                                │  page       │
                                │  text       │
                                └─────────────┘
```

## 🔄 State Management (Context API)

```
┌──────────────────────────────────────────────────────────┐
│                     AuthContext                          │
│                                                          │
│  State:                                                  │
│    • user                                                │
│    • loading                                             │
│    • error                                               │
│                                                          │
│  Actions:                                                │
│    • login(email, password)                              │
│    • register(email, password)                           │
│    • logout()                                            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   DocumentContext                        │
│                                                          │
│  State:                                                  │
│    • documents                                           │
│    • folders                                             │
│    • selectedDocIds                                      │
│    • selectedFolder                                      │
│                                                          │
│  Actions:                                                │
│    • fetchDocuments()                                    │
│    • deleteDocument(id)                                  │
│    • toggleDocumentSelection(id)                         │
│    • filterByFolder(folder)                              │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                     ChatContext                          │
│                                                          │
│  State:                                                  │
│    • messages                                            │
│    • loading                                             │
│    • error                                               │
│                                                          │
│  Actions:                                                │
│    • sendMessage(query)                                  │
│    • clearChat()                                         │
│    • deleteMessage(id)                                   │
└──────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /api/auth/login
       │    { email, password }
       ▼
┌─────────────────┐
│   Backend       │
│                 │
│ 2. Verify       │
│    Password     │
│                 │
│ 3. Generate     │
│    JWT Token    │
└──────┬──────────┘
       │
       │ 4. Return { token, user }
       ▼
┌─────────────┐
│   Client    │
│             │
│ 5. Store    │
│    Token in │
│    localStorage
│             │
│ 6. Add to   │
│    Headers  │
│    for all  │
│    requests │
└─────────────┘
```

## 📦 File Processing Pipeline

```
PDF/DOCX File
      │
      ▼
┌─────────────────┐
│  File Parser    │
│  (pdf-parse/    │
│   mammoth)      │
└────────┬────────┘
         │
         │ Raw Text
         ▼
┌─────────────────┐
│  Text Chunker   │
│  (split by      │
│   paragraphs/   │
│   pages)        │
└────────┬────────┘
         │
         │ Chunks[]
         ▼
┌─────────────────┐
│  Embedding      │
│  Generator      │
│  (OpenAI)       │
└────────┬────────┘
         │
         │ Embeddings[]
         ▼
┌─────────────────┐
│  Vector DB      │
│  (Pinecone)     │
│                 │
│  Store with     │
│  metadata       │
└─────────────────┘
```

## 🎯 Vector Search with Filtering

```
User Query: "What is the leave policy?"
Selected Docs: [doc1, doc2]

      │
      ▼
Generate Query Embedding
      │
      ▼
Search Vector DB with Filter:
{
  "user_id": "user123",
  "doc_id": { "$in": ["doc1", "doc2"] }
}
      │
      ▼
Top-K Similar Chunks:
[
  { text: "...", file: "HR_Policy.pdf", page: 3 },
  { text: "...", file: "Employee_Handbook.pdf", page: 12 },
  ...
]
      │
      ▼
Build Context + Send to LLM
      │
      ▼
Return Answer with Sources
```

### 3. Chat Sessions & Messages (DB)

We store chat sessions and messages in MongoDB so users can resume chats and keep multiple sessions.

Collections:

- `chat_sessions`
      - session_id (uuid, PK)
      - user_id (uuid, FK)
      - title (string)
      - active_doc_ids (array)
      - created_at (timestamp)
      - updated_at (timestamp)

- `chat_messages`
      - message_id (uuid, PK)
      - session_id (uuid, FK)
      - role (user|assistant|system)
      - content (text)
      - created_at (timestamp)

Notes:
- Messages are immutable.
- Do not embed conversations into the Vector DB; only documents are embedded.


## 🌐 API Request Flow

```
Frontend Component
      │
      ▼
Custom Hook (useDocuments)
      │
      ▼
Service (documentService.js)
      │
      ▼
Axios Instance (api.js)
      │
      ├─► Add JWT Token (interceptor)
      │
      └─► HTTP Request
            │
            ▼
      Backend Route
            │
            ├─► Auth Middleware (verify JWT)
            │
            ├─► Route Handler
            │
            ├─► Service Layer
            │
            ├─► Database Query
            │
            └─► Response
                  │
                  ▼
            Frontend Updates State
```

---

This architecture provides:
- ✅ **Scalability**: Separate concerns, easy to scale
- ✅ **Security**: JWT auth, input validation
- ✅ **Performance**: Vector search, efficient queries
- ✅ **Maintainability**: Atomic design, clean separation
- ✅ **Flexibility**: Easy to swap Vector DB or LLM
