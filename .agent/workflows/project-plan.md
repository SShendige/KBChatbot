---
description: KBC Project Implementation Plan
---

# Knowledge-Based Chat (KBC) - Implementation Plan

## Phase 1: Backend Setup

### 1.1 Initialize Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── vectordb.js          # Vector DB config (Pinecone/Qdrant)
│   │   └── googleDrive.js       # Google Drive API setup
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Document.js          # Document schema
│   │   └── Chunk.js             # Chunk schema (optional)
│   ├── services/
│   │   ├── uploadService.js     # Handle file uploads
│   │   ├── embeddingService.js  # Generate embeddings
│   │   ├── vectorService.js     # Vector DB operations
│   │   ├── chatService.js       # LLM chat logic
│   │   └── driveService.js      # Google Drive integration
│   ├── routes/
│   │   ├── auth.js              # User authentication
│   │   ├── documents.js         # Document CRUD
│   │   ├── upload.js            # Upload endpoints
│   │   └── chat.js              # Chat endpoints
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── upload.js            # Multer config
│   └── server.js                # Express app
├── package.json
└── .env
```

### 1.2 Install Backend Dependencies
```bash
cd backend
npm init -y
npm install express mongoose dotenv cors
npm install multer pdf-parse mammoth  # Document parsing
npm install @pinecone-database/pinecone  # or qdrant-client
npm install openai  # or @google/generative-ai
npm install googleapis  # Google Drive
npm install jsonwebtoken bcryptjs
```

### 1.3 Environment Variables (.env)
```
MONGODB_URI=mongodb://localhost:27017/kbc
PINECONE_API_KEY=your_key
PINECONE_ENVIRONMENT=your_env
PINECONE_INDEX=kbc-index
OPENAI_API_KEY=your_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Phase 2: Frontend Setup (Atomic Structure)

### 2.1 Install Frontend Dependencies
```bash
npm install axios react-router-dom
npm install @mui/material @emotion/react @emotion/styled  # UI components
npm install react-dropzone  # File upload
npm install react-google-drive-picker  # Google Drive picker
npm install react-markdown  # Chat message rendering
```

### 2.2 Atomic File Structure
```
src/
├── components/
│   ├── atoms/                    # Basic building blocks
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── Button.css
│   │   ├── Input/
│   │   │   ├── Input.jsx
│   │   │   └── Input.css
│   │   ├── Checkbox/
│   │   │   ├── Checkbox.jsx
│   │   │   └── Checkbox.css
│   │   ├── Badge/
│   │   │   ├── Badge.jsx
│   │   │   └── Badge.css
│   │   └── Spinner/
│   │       ├── Spinner.jsx
│   │       └── Spinner.css
│   ├── molecules/                # Combinations of atoms
│   │   ├── FileUploadZone/
│   │   │   ├── FileUploadZone.jsx
│   │   │   └── FileUploadZone.css
│   │   ├── DocumentCard/
│   │   │   ├── DocumentCard.jsx
│   │   │   └── DocumentCard.css
│   │   ├── FolderSelector/
│   │   │   ├── FolderSelector.jsx
│   │   │   └── FolderSelector.css
│   │   ├── ChatMessage/
│   │   │   ├── ChatMessage.jsx
│   │   │   └── ChatMessage.css
│   │   └── SearchBar/
│   │       ├── SearchBar.jsx
│   │       └── SearchBar.css
│   ├── organisms/                # Complex components
│   │   ├── DocumentList/
│   │   │   ├── DocumentList.jsx
│   │   │   └── DocumentList.css
│   │   ├── ChatInterface/
│   │   │   ├── ChatInterface.jsx
│   │   │   └── ChatInterface.css
│   │   ├── UploadModal/
│   │   │   ├── UploadModal.jsx
│   │   │   └── UploadModal.css
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Sidebar.css
│   │   └── Header/
│   │       ├── Header.jsx
│   │       └── Header.css
│   └── templates/                # Page layouts
│       ├── MainLayout/
│       │   ├── MainLayout.jsx
│       │   └── MainLayout.css
│       └── AuthLayout/
│           ├── AuthLayout.jsx
│           └── AuthLayout.css
├── pages/
│   ├── Login/
│   │   ├── Login.jsx
│   │   └── Login.css
│   ├── Dashboard/
│   │   ├── Dashboard.jsx
│   │   └── Dashboard.css
│   ├── Documents/
│   │   ├── Documents.jsx
│   │   └── Documents.css
│   └── Chat/
│       ├── Chat.jsx
│       └── Chat.css
├── context/
│   ├── AuthContext.jsx
│   ├── DocumentContext.jsx
│   └── ChatContext.jsx
├── services/
│   ├── api.js                    # Axios instance
│   ├── authService.js
│   ├── documentService.js
│   └── chatService.js
├── utils/
│   ├── fileHelpers.js
│   └── constants.js
├── hooks/
│   ├── useAuth.js
│   ├── useDocuments.js
│   └── useChat.js
├── App.js
├── index.js
└── index.css
```

## Phase 3: Database Schemas

### 3.1 MongoDB Models

**User Model:**
```javascript
{
  user_id: UUID (auto),
  email: String (unique),
  password: String (hashed),
  created_at: Date,
  updated_at: Date
}
```

**Document Model:**
```javascript
{
  doc_id: UUID (auto),
  user_id: UUID (ref: User),
  file_name: String,
  source: Enum ['local', 'gdrive'],
  folder: String,
  checksum: String (SHA-256),
  file_size: Number,
  mime_type: String,
  uploaded_at: Date,
  status: Enum ['processing', 'ready', 'failed']
}
```

**Chunk Model (Optional):**
```javascript
{
  chunk_id: UUID (auto),
  doc_id: UUID (ref: Document),
  page: Number,
  chunk_index: Number,
  text_content: String,
  created_at: Date
}
```

### 3.2 Vector DB Schema (Pinecone/Qdrant)

```javascript
{
  id: "chunk_uuid",
  values: [embedding_vector],  // 1536 dims for OpenAI
  metadata: {
    user_id: "uuid",
    doc_id: "uuid",
    file_name: "policy.pdf",
    folder: "HR/Policies",
    page: 3,
    chunk_index: 12,
    text: "chunk text content"
  }
}
```

## Phase 4: Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - List user's documents
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/folders` - Get unique folders

### Upload
- `POST /api/upload/local` - Upload local files
- `POST /api/upload/gdrive` - Upload from Google Drive
- `GET /api/upload/status/:doc_id` - Check processing status

### Chat
- `POST /api/chat/query` - Send chat query
  ```json
  {
    "query": "What is the leave policy?",
    "selected_doc_ids": ["uuid1", "uuid2"],
    "folder": "HR/Policies" (optional)
  }
  ```
- `GET /api/chat/history/:session_id` - Get chat history

## Phase 5: Implementation Flow

### Document Upload Flow:
1. User uploads file (local or GDrive)
2. Calculate checksum, check for duplicates
3. Save metadata to MongoDB
4. Parse document (PDF/DOCX/TXT)
5. Split into chunks (with overlap)
6. Generate embeddings for each chunk
7. Store embeddings in Vector DB with metadata
8. Update document status to 'ready'

### Chat Query Flow:
1. User selects documents/folders
2. User sends query
3. Generate query embedding
4. Search Vector DB with filters:
   ```javascript
   filter = {
     user_id: user_id,
     doc_id: { $in: selected_doc_ids }
   }
   ```
5. Retrieve top-k relevant chunks
6. Build context from chunks
7. Send to LLM with prompt:
   ```
   Context: [chunks]
   Question: [user_query]
   Answer based only on the context provided.
   ```
8. Stream response to frontend

## Phase 6: Next Steps

1. **Backend Development** (Week 1-2)
   - Set up Express server
   - Configure MongoDB & Vector DB
   - Implement upload & embedding services
   - Create API endpoints

2. **Frontend Development** (Week 2-3)
   - Build atomic components
   - Implement pages & routing
   - Connect to backend APIs
   - Add Google Drive integration

3. **Testing & Optimization** (Week 3-4)
   - Test upload flows
   - Optimize vector search
   - Add error handling
   - Performance tuning

4. **Deployment**
   - Deploy backend (Railway/Render)
   - Deploy frontend (Vercel/Netlify)
   - Set up production databases
