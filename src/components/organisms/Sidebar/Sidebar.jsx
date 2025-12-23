import React, { useState } from 'react';
import FolderSelector from '../../molecules/FolderSelector/FolderSelector';
import Button from '../../atoms/Button/Button';
import { useDocuments } from '../../../hooks/useDocuments';
import { useAuth } from '../../../hooks/useAuth';
import { useChat } from '../../../hooks/useChat';
import './Sidebar.css';

const Sidebar = ({ onUploadClick }) => {
    const { folders, selectedFolder, filterByFolder, clearFolderFilter, selectedDocIds } = useDocuments();
    const { user, logout } = useAuth();
    const { sessions, currentSessionId, createNewSession, setCurrentSessionId, deleteSession } = useChat();
    const [deletingId, setDeletingId] = useState(null);

    const handleDeleteSession = async (e, sessionId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this chat session?')) {
            setDeletingId(sessionId);
            try {
                await deleteSession(sessionId);
            } finally {
                setDeletingId(null);
            }
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="logo-text">KBChatBot</span>
                </div>
                <div className="sidebar-user">
                    <div className="user-info">
                        <div className="user-email">{user?.email}</div>
                    </div>
                </div>
            </div>

            <div className="sidebar-content">
                <Button
                    variant="primary"
                    onClick={() => createNewSession('New Chat')}
                    className="upload-button"
                >
                    + New Chat
                </Button>

                <div className="sidebar-section">
                    <h3 className="section-title">Chat Sessions</h3>
                    <div className="sessions-list">
                        {sessions.map(session => (
                            <div
                                key={session.session_id}
                                className={`session-item ${currentSessionId === session.session_id ? 'active' : ''} ${deletingId === session.session_id ? 'deleting' : ''}`}
                                onClick={() => setCurrentSessionId(session.session_id)}
                            >
                                <span className="session-title">{session.title}</span>
                                <button
                                    className="session-delete-btn"
                                    onClick={(e) => handleDeleteSession(e, session.session_id)}
                                    disabled={deletingId === session.session_id}
                                    title="Delete session"
                                >
                                    {deletingId === session.session_id ? '...' : '×'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <Button
                    variant="primary"
                    onClick={onUploadClick}
                    className="upload-button"
                >
                    Upload Documents
                </Button>



                <FolderSelector
                    folders={folders}
                    selectedFolder={selectedFolder}
                    onSelectFolder={filterByFolder}
                    onClearFilter={clearFolderFilter}
                />
            </div>

            <div className="sidebar-footer">
                <Button variant="ghost" size="small" onClick={logout}>
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
