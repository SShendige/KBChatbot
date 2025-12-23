import React, { createContext, useState, useContext, useEffect } from 'react';
import { createSession, sendMessage, loadSession, listSessions, updateSession } from '../services/chatService';
import { DocumentContext } from './DocumentContext';
import { STORAGE_KEYS } from '../utils/constants';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { selectedDocIds, setSelectedDocIds } = useContext(DocumentContext);
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load sessions on mount
    useEffect(() => {
        const initializeSessions = async () => {
            await loadUserSessions();

            // Load persisted session ID
            const savedSessionId = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
            if (savedSessionId) {
                // Verify the session still exists
                try {
                    const sessionData = await loadSession(savedSessionId);
                    if (sessionData && sessionData.session_id) {
                        setCurrentSessionId(savedSessionId);
                    } else {
                        // Session doesn't exist, clear it
                        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
                    }
                } catch (err) {
                    console.error('Saved session not found:', err);
                    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
                }
            }
        };

        initializeSessions();
    }, []);

    const isInitialLoad = React.useRef(true);
    const isSwitchingSession = React.useRef(false);

    // Save current session ID to localStorage whenever it changes
    useEffect(() => {
        if (currentSessionId) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, currentSessionId);
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
        }
    }, [currentSessionId]);

    // Load current session when it changes
    useEffect(() => {
        if (currentSessionId) {
            isSwitchingSession.current = true;
            loadCurrentSession();
        } else {
            setMessages([]);
        }
    }, [currentSessionId]);

    // Sync document selection changes with session's active_doc_ids
    useEffect(() => {
        // Skip sync during initial page load or when we are currently loading a session from the backend
        if (isInitialLoad.current || isSwitchingSession.current) return;

        if (currentSessionId && selectedDocIds) {
            updateActiveDocs(selectedDocIds);
        }
    }, [selectedDocIds, currentSessionId]);

    const loadUserSessions = async () => {
        try {
            const data = await listSessions();
            setSessions(data);
        } catch (err) {
            console.error('Failed to load sessions:', err);
        }
    };

    const loadCurrentSession = async () => {
        if (!currentSessionId) return;
        try {
            setLoading(true);
            const data = await loadSession(currentSessionId);

            setMessages(data.messages || []);

            // Sync the title in the sessions list if it changed
            if (data.session && data.session.title) {
                setSessions(prev => prev.map(s =>
                    s.session_id === currentSessionId ? { ...s, title: data.session.title } : s
                ));
            }

            // RESTORE Backend State as the Source of Truth
            if (data.session && data.session.active_doc_ids) {
                console.log('DEBUG: Restoring active docs from backend:', data.session.active_doc_ids);
                setSelectedDocIds(data.session.active_doc_ids);
            } else {
                setSelectedDocIds([]);
            }

            // Once state is restored, allow future syncs
            setTimeout(() => {
                isInitialLoad.current = false;
                isSwitchingSession.current = false;
            }, 100);

        } catch (err) {
            console.error('Failed to load session:', err);
            setError('Failed to load session');
            isSwitchingSession.current = false;
            isInitialLoad.current = false;
        } finally {
            setLoading(false);
        }
    };

    const createNewSession = async (title = 'New Chat') => {
        try {
            // Check if there's already an empty "New Chat" session
            const emptyNewChatSession = sessions.find(s => s.title === 'New Chat');
            if (emptyNewChatSession) {
                setCurrentSessionId(emptyNewChatSession.session_id);
                // Keep current selection for New Chat instead of clearing
                return emptyNewChatSession.session_id;
            }

            // Check if current session is empty
            if (currentSessionId) {
                const currentMessages = messages.filter(m => !m.message_id.startsWith('temp-'));
                if (currentMessages.length === 0) {
                    // Current session is empty, reuse it and keep selection
                    return currentSessionId;
                }
            }

            const response = await createSession({
                title,
                active_doc_ids: selectedDocIds // Use current selection
            });
            // Don't clear selection in UI
            const newSession = {
                session_id: response.session_id,
                title: response.title
            };
            setSessions(prev => [newSession, ...prev]);
            setCurrentSessionId(response.session_id);
            return response.session_id;
        } catch (err) {
            console.error('Failed to create session:', err);
            setError('Failed to create session');
        }
    };

    const sendChatMessage = async (query) => {
        if (!query.trim() || !currentSessionId) return;

        try {
            setLoading(true);
            setError(null);

            // Add user message to UI immediately
            // Create IST timestamp to match backend
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
            const istTime = new Date(now.getTime() + istOffset);

            const userMessage = {
                message_id: `temp-${Date.now()}`,
                session_id: currentSessionId,
                role: 'user',
                content: query,
                created_at: istTime.toISOString().replace('Z', '+05:30')
            };
            setMessages(prev => [...prev, userMessage]);
            console.log('DEBUG: Added user message to UI:', userMessage);

            // Send message to backend
            const response = await sendMessage({
                session_id: currentSessionId,
                message: query
            });
            console.log('DEBUG: Backend response:', response);

            // Reload session to get persisted messages with real IDs
            await loadCurrentSession();

            // If backend returned a generated title, update the session
            if (response.title && response.title !== 'New Chat') {
                console.log('DEBUG: Updating session title to:', response.title);
                setSessions(prev => prev.map(s =>
                    s.session_id === currentSessionId
                        ? { ...s, title: response.title }
                        : s
                ));
            }

        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Failed to send message';
            setError(errorMsg);
            // Remove the temporary user message if sending failed
            setMessages(prev => prev.filter(m => !m.message_id.startsWith('temp-')));
            console.error('Failed to send message:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateActiveDocs = async (docIds) => {
        if (!currentSessionId) return;
        try {
            await updateSession(currentSessionId, {
                active_doc_ids: docIds
            });
        } catch (err) {
            console.error('Failed to update session:', err);
        }
    };

    const clearCurrentChat = () => {
        setMessages([]);
        setError(null);
    };

    const deleteSession = async (sessionId) => {
        try {
            const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            const response = await fetch(`http://localhost:5000/api/chat/session/${sessionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to delete session');
            }

            // Remove from sessions list
            setSessions(prev => prev.filter(s => s.session_id !== sessionId));

            // If deleted session was current, clear it
            if (currentSessionId === sessionId) {
                setCurrentSessionId(null);
                setMessages([]);
            }
        } catch (err) {
            console.error('Failed to delete session:', err);
            setError('Failed to delete session');
        }
    };

    const value = {
        // Session management
        sessions,
        currentSessionId,
        setCurrentSessionId,
        createNewSession,
        loadUserSessions,
        updateActiveDocs,
        // Messages
        messages,
        loading,
        error,
        sendMessage: sendChatMessage,
        clearChat: clearCurrentChat,
        deleteSession
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
