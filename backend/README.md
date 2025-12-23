# Backend Quick Start Guide

## Setup Instructions

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Start MongoDB**:
   - Local: `mongod`
   - Or use MongoDB Atlas (cloud)

4. **Set up Vector DB**:
   - **Pinecone**: Create index at https://www.pinecone.io/
   - **Qdrant**: Run locally with Docker or use cloud

5. **Get API Keys**:
   - OpenAI: https://platform.openai.com/api-keys
   - Google Drive: https://console.cloud.google.com/

6. **Start server**:
   ```bash
   npm run dev
   ```

## Implementation Checklist

### Phase 1: Core Setup ✅
- [x] Express server
- [x] MongoDB connection
- [x] User model
- [x] Document model
- [x] Chunk model

### Phase 2: Authentication
- [ ] JWT middleware
- [ ] Register endpoint
- [ ] Login endpoint
- [ ] Password hashing

### Phase 3: File Upload
- [ ] Multer configuration
- [ ] Local upload endpoint
- [ ] File validation
- [ ] Checksum calculation

### Phase 4: Document Processing
- [ ] PDF parser
- [ ] DOCX parser
- [ ] Text chunking
- [ ] Embedding generation

### Phase 5: Vector DB
- [ ] Pinecone/Qdrant setup
- [ ] Upsert embeddings
- [ ] Query with filters
- [ ] Delete vectors

### Phase 6: Chat
- [ ] Query endpoint
- [ ] Vector search
- [ ] LLM integration
- [ ] Response streaming

### Phase 7: Google Drive
- [ ] OAuth flow
- [ ] File picker
- [ ] Download files
- [ ] Process Drive files

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js ✅
│   │   ├── vectordb.js
│   │   └── googleDrive.js
│   ├── models/
│   │   ├── User.js ✅
│   │   ├── Document.js ✅
│   │   └── Chunk.js ✅
│   ├── services/
│   │   ├── uploadService.js
│   │   ├── embeddingService.js
│   │   ├── vectorService.js
│   │   ├── chatService.js
│   │   └── driveService.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── documents.js
│   │   ├── upload.js
│   │   └── chat.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   └── server.js ✅
├── package.json ✅
└── .env.example ✅
```

## Next Steps

1. Implement authentication routes
2. Set up file upload with Multer
3. Create document processing pipeline
4. Integrate vector database
5. Build chat endpoint with LLM

See the main project README and `.agent/workflows/project-plan.md` for detailed implementation guidance.
