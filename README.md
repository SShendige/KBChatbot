# Knowledge-Based Chat (KBC) System

A full-stack application for uploading documents and chatting with your knowledge base using AI. Built with React (frontend) and Node.js/Express (backend), with MongoDB for metadata and Vector DB for embeddings.

## 🎯 Features

- ✅ **Document Upload**: Upload from local device or Google Drive
- ✅ **Folder Organization**: Organize documents in folders
- ✅ **Vector Search**: Semantic search using embeddings
- ✅ **File-Level Filtering**: Select specific documents for queries
- ✅ **AI Chat**: Ask questions and get answers based on your documents
- ✅ **Source Citations**: See which documents were used for answers
- ✅ **Atomic Design**: Clean, maintainable component structure

## 🏗️ Architecture

### Frontend (React)
- **Atomic Design Structure**: Atoms → Molecules → Organisms → Pages
- **State Management**: Context API (Auth, Documents, Chat)
- **Routing**: React Router with protected routes
- **Styling**: Modern CSS with gradients and animations

### Backend (Node.js/Express)
- **MongoDB**: User, Document, and Chunk metadata
- **Vector DB**: Pinecone/Qdrant for embeddings
- **LLM Integration**: OpenAI/Gemini for embeddings and chat
- **File Processing**: PDF, DOCX, TXT, MD support

## 📁 Project Structure

```
kbcbot/
├── src/
│   ├── components/
│   │   ├── atoms/              # Basic UI elements
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Checkbox/
│   │   │   ├── Badge/
│   │   │   └── Spinner/
│   │   ├── molecules/          # Composite components
│   │   │   ├── FileUploadZone/
│   │   │   ├── DocumentCard/
│   │   │   ├── ChatMessage/
│   │   │   ├── SearchBar/
│   │   │   └── FolderSelector/
│   │   └── organisms/          # Complex components
│   │       ├── ChatInterface/
│   │       ├── DocumentList/
│   │       ├── UploadModal/
│   │       └── Sidebar/
│   ├── pages/
│   │   ├── Login/
│   │   └── Dashboard/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── DocumentContext.jsx
│   │   └── ChatContext.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── documentService.js
│   │   └── chatService.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useDocuments.js
│   │   └── useChat.js
│   └── utils/
│       ├── constants.js
│       └── fileHelpers.js
└── .agent/workflows/
    └── project-plan.md        # Detailed implementation plan
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Vector DB account (Pinecone/Qdrant)
- OpenAI API key (or Gemini)

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` file**:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

### Backend Setup

1. **Create backend directory**:
   ```bash
   mkdir backend
   cd backend
   npm init -y
   ```

2. **Install dependencies**:
   ```bash
   npm install express mongoose dotenv cors
   npm install multer pdf-parse mammoth
   npm install @pinecone-database/pinecone
   npm install openai
   npm install googleapis
   npm install jsonwebtoken bcryptjs
   npm install nodemon --save-dev
   ```

3. **Create `.env` file in backend/**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/kbc
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_ENVIRONMENT=your_environment
   PINECONE_INDEX=kbc-index
   OPENAI_API_KEY=your_openai_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. **Create backend structure** (see `.agent/workflows/project-plan.md` for details)

5. **Start backend server**:
   ```bash
   npm run dev
   ```

## 📊 Database Schemas

### MongoDB Collections

**Users**:
```javascript
{
  user_id: UUID,
  email: String (unique),
  password: String (hashed),
  created_at: Date
}
```

**Documents**:
```javascript
{
  doc_id: UUID,
  user_id: UUID (ref: User),
  file_name: String,
  source: 'local' | 'gdrive',
  folder: String,
  checksum: String (SHA-256),
  file_size: Number,
  mime_type: String,
  uploaded_at: Date,
  status: 'processing' | 'ready' | 'failed'
}
```

**Chunks** (optional):
```javascript
{
  chunk_id: UUID,
  doc_id: UUID (ref: Document),
  page: Number,
  chunk_index: Number,
  text_content: String
}
```

### Vector DB (Pinecone/Qdrant)

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

## 🔑 Key API Endpoints

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
- `POST /api/chat/query` - Send chat query with document filtering

## 🎨 Design Features

- **Modern Gradients**: Purple/pink color scheme
- **Smooth Animations**: Hover effects, transitions, floating elements
- **Responsive Layout**: Works on all screen sizes
- **Custom Scrollbars**: Styled to match theme
- **Loading States**: Spinners and progress indicators
- **Error Handling**: User-friendly error messages

## 🔐 Security Features

- JWT authentication
- Password hashing with bcryptjs
- Protected API routes
- File type validation
- File size limits
- Checksum verification for duplicates

## 📝 Development Workflow

1. **View the implementation plan**:
   ```bash
   cat .agent/workflows/project-plan.md
   ```

2. **Start frontend**:
   ```bash
   npm start
   ```

3. **Start backend** (in separate terminal):
   ```bash
   cd backend
   npm run dev
   ```

4. **Access the app**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🧪 Testing

The frontend includes:
- Component testing setup with React Testing Library
- Test files in `src/**/*.test.js`

Run tests:
```bash
npm test
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)
1. Build production bundle: `npm run build`
2. Deploy `build/` folder
3. Set environment variables

### Backend (Railway/Render)
1. Push to GitHub
2. Connect to deployment platform
3. Set environment variables
4. Deploy

## 📚 Next Steps

1. **Implement Backend**: Follow the plan in `.agent/workflows/project-plan.md`
2. **Set up MongoDB**: Create database and collections
3. **Configure Vector DB**: Set up Pinecone/Qdrant index
4. **Add Google Drive**: Implement OAuth flow
5. **Test Integration**: Connect frontend to backend
6. **Deploy**: Push to production

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

## 📄 License

MIT License - feel free to use this project as you wish.

## 🆘 Support

For detailed implementation guidance, see:
- `.agent/workflows/project-plan.md` - Complete implementation plan
- Component files - Each has inline documentation
- Service files - API integration examples

---

**Built with ❤️ using React, Node.js, MongoDB, and Vector DB**
