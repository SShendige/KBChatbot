# Frontend Integration - Chat Sessions & Persistence

## 🎯 Overview

The frontend has been updated to integrate with the new backend chat session APIs. Users can now:
- Create multiple chat sessions
- Switch between saved sessions
- Messages persist across page refreshes
- All data stored in MongoDB

## 📋 Changes Made

### 1. **ChatContext.jsx** (Context API)
**What changed:**
- Added session management (sessions list, currentSessionId)
- Added useEffect to load sessions on mount
- Added useEffect to load messages when session changes
- New functions:
  - `createNewSession()` — Create and switch to new chat
  - `loadUserSessions()` — Fetch all sessions from backend
  - `loadCurrentSession()` — Load messages for current session
  - `sendChatMessage()` — Send message to backend and reload session
  - `updateActiveDocs()` — Update which documents are active for RAG

**Key feature:** Messages are fetched from MongoDB, not stored in React state

### 2. **chatService.js** (API Layer)
**New functions:**
- `createSession()` — POST `/chat/session`
- `listSessions()` — GET `/chat/sessions`
- `loadSession()` — GET `/chat/session/{id}`
- `updateSession()` — PATCH `/chat/session/{id}`
- `sendMessage()` — POST `/chat/message`

**Backwards compatible:** Old `sendChatQuery()` still available

### 3. **Sidebar.jsx** (Component)
**What changed:**
- Added `+ New Chat` button at the top
- Added "Chat Sessions" section showing list of all user's sessions
- Click a session to load it
- Active session is highlighted
- Imported `useChat` hook

### 4. **ChatInterface.jsx** (Component)
**What changed:**
- Messages keyed by `message_id` instead of `id`
- Placeholder text now says "Start a new chat..."
- Auto-creates session on first input (when unfocused)
- Disabled submit if no session active
- Uses `currentSessionId` instead of checking `selectedDocIds`

### 5. **ChatMessage.jsx** (Component)
**What changed:**
- Now accepts both `timestamp` and `created_at` fields
- Backend returns `created_at`, so component handles both

### 6. **Sidebar.css** (Styles)
**New CSS classes:**
- `.sidebar-section` — Section container
- `.section-title` — "Chat Sessions" header
- `.sessions-list` — Scrollable session list
- `.session-item` — Individual session button
- `.session-item.active` — Active session styling

## 🔄 Data Flow

### Create New Chat
```
User clicks "+ New Chat"
    ↓
createNewSession() called
    ↓
POST /api/chat/session → Backend creates session in MongoDB
    ↓
Session added to sessions list
    ↓
currentSessionId set → messages loaded (will be empty)
```

### Load Existing Chat
```
User clicks session in sidebar
    ↓
setCurrentSessionId(session_id)
    ↓
useEffect triggers
    ↓
GET /api/chat/session/{id} → Backend fetches from MongoDB
    ↓
Messages displayed in ChatInterface
```

### Send Message
```
User types and clicks Send
    ↓
sendChatMessage() called
    ↓
POST /api/chat/message → Backend stores message and gets response
    ↓
Reload session: GET /api/chat/session/{id}
    ↓
New messages displayed (user + assistant)
```

### Page Refresh
```
User refreshes page
    ↓
ChatProvider mounts
    ↓
loadUserSessions() called on mount
    ↓
Sessions list populated from MongoDB
    ↓
If there was a currentSessionId, it can be restored
```

## 💾 State Management

### ChatContext provides:
```javascript
{
  // Sessions
  sessions: Array,                    // All user's sessions
  currentSessionId: String|null,      // Currently active session
  setCurrentSessionId: Function,      // Switch sessions
  createNewSession: Function,         // Create new session
  loadUserSessions: Function,         // Refresh sessions list
  updateActiveDocs: Function,         // Update active docs for RAG
  
  // Messages
  messages: Array,                    // Messages from current session
  loading: Boolean,                   // Loading state
  error: String|null,                 // Error message
  sendMessage: Function,              // Send message in session
  clearChat: Function                 // Clear current chat
}
```

## 🔑 Key Changes from Old Behavior

| Before | After |
|--------|-------|
| One global chat | Multiple sessions |
| Messages in React state | Messages from MongoDB |
| No persistence | Auto-persistence |
| No session list | Session tabs in sidebar |
| Refresh clears chat | Refresh loads from DB |
| Page state = local only | Page state = UI state |

## 🚀 Testing Checklist

- [ ] Can create multiple chat sessions
- [ ] Sessions appear in sidebar
- [ ] Click session loads its messages
- [ ] Send message stores it in MongoDB
- [ ] Refresh page → sessions still there
- [ ] Login with same account → see previous sessions
- [ ] New Chat button works
- [ ] Active session is highlighted

## 📝 Files Modified

1. `src/context/ChatContext.jsx` — Session management logic
2. `src/services/chatService.js` — New API endpoints
3. `src/components/organisms/Sidebar/Sidebar.jsx` — Session list UI
4. `src/components/organisms/Sidebar/Sidebar.css` — Session list styles
5. `src/components/organisms/ChatInterface/ChatInterface.jsx` — Session-aware chat
6. `src/components/molecules/ChatMessage/ChatMessage.jsx` — Handle new message format

## 🔗 Backend Requirements

These backend endpoints must be running:
- POST `/api/chat/session` — Create session
- GET `/api/chat/sessions` — List sessions
- GET `/api/chat/session/{id}` — Load session + messages
- POST `/api/chat/message` — Send message
- PATCH `/api/chat/session/{id}` — Update session

All are documented in `CHAT_PERSISTENCE_SETUP.md`

## 🎨 UI Flow

```
Dashboard
├── Sidebar
│   ├── [+ New Chat] button
│   ├── Chat Sessions section
│   │   ├── Session 1 (clickable)
│   │   ├── Session 2 (clickable)
│   │   └── Session 3 (clickable)
│   ├── Upload Documents button
│   └── Logout button
│
└── ChatInterface
    ├── Messages (from selected session)
    ├── Message input
    └── Send button
```

## 🐛 Debugging Tips

If sessions aren't showing:
1. Check browser console for errors
2. Verify JWT token is being sent
3. Check backend logs for API errors
4. Verify MongoDB is running

If messages aren't persisting:
1. Check `loadCurrentSession()` is being called
2. Verify POST /message returns successfully
3. Check MongoDB has data with `verify_mongodb.py`

---

**Status:** ✅ Frontend fully integrated with backend chat session APIs
