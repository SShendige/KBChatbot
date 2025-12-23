import React from 'react';
import './ChatMessage.css';
import botAvatar from '../../../assets/bot-avatar.jpg';
import userAvatar from '../../../assets/user-avatar.jpg';
import { formatDate } from '../../../utils/fileHelpers';

const ChatMessage = ({ message }) => {
    const { role, content, sources, isError, created_at } = message;

    const renderSourcesAttachment = () => {
        if (role !== 'assistant' || isError || !sources || sources.length === 0) {
            return null;
        }

        return (
            <div className="chat-message-sources-attachment">
                <div className="sources-header">Source Documents</div>
                <div className="sources-list">
                    {sources.map((source, index) => (
                        <div key={index} className="source-item">
                            <span className="source-filename">{source.file_name}</span>
                            {source.page && <span className="source-page-tag">Pg. {source.page}</span>}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={`chat-message chat-message-${role} ${isError ? 'chat-message-error' : ''}`}>
            <div className="chat-message-avatar">
                {role === 'user' ? (
                    <img src={userAvatar} alt="User" className="user-avatar-img" />
                ) : (
                    <img src={botAvatar} alt="KBC Bot" className="bot-avatar-img" />
                )}
            </div>
            <div className="chat-message-content">
                <div className="chat-message-text">{content}</div>

                {renderSourcesAttachment()}

                <div className="chat-message-time">
                    {formatDate(created_at)}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
