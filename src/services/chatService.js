import api from './api';

/**
 * Create a new chat session
 */
export const createSession = async (data = {}) => {
    const response = await api.post('/chat/session', {
        title: data.title || 'New Chat',
        active_doc_ids: data.active_doc_ids || []
    });
    return response.data;
};

/**
 * List all user's chat sessions
 */
export const listSessions = async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
};

/**
 * Load a specific chat session with all messages
 */
export const loadSession = async (sessionId) => {
    const response = await api.get(`/chat/session/${sessionId}`);
    return response.data;
};

/**
 * Update session (title, active docs)
 */
export const updateSession = async (sessionId, data) => {
    const response = await api.patch(`/chat/session/${sessionId}`, {
        title: data.title,
        active_doc_ids: data.active_doc_ids
    });
    return response.data;
};

/**
 * Send a message in a session
 */
export const sendMessage = async (data) => {
    const response = await api.post('/chat/message', {
        session_id: data.session_id,
        message: data.message
    });
    return response.data;
};

/**
 * Legacy: Send chat query (kept for backwards compatibility)
 */
export const sendChatQuery = async (query, selectedDocIds, folder = null) => {
    const response = await api.post('/chat/query', {
        query,
        selected_doc_ids: selectedDocIds,
        folder
    });
    return response.data;
};
