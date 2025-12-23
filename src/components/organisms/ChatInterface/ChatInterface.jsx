import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '../../molecules/ChatMessage/ChatMessage';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';
import Spinner from '../../atoms/Spinner/Spinner';
import { useChat } from '../../../hooks/useChat';
import { useDocuments } from '../../../hooks/useDocuments';
import './ChatInterface.css';

const ChatInterface = () => {
    const { messages, loading, sendMessage, clearChat, currentSessionId, createNewSession, sessions } = useChat();
    const { selectedDocIds } = useDocuments();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || loading || selectedDocIds.length === 0) return;

        let sessionId = currentSessionId;

        // Create session if none exists
        if (!sessionId) {
            const newId = await createNewSession('New Chat');
            if (!newId) return;
            sessionId = newId;
        }

        // Send message with the verified sessionId
        sendMessage(inputValue);
        setInputValue('');
    };

    return (
        <div className="chat-interface">
            <div className="chat-header">
                <div className="chat-header-info">
                    <h2 className="chat-title">
                        {sessions.find(s => s.session_id === currentSessionId)?.title || 'Knowledge Chat'}
                    </h2>
                    <p className="chat-subtitle">
                        {selectedDocIds.length} document{selectedDocIds.length !== 1 ? 's' : ''} selected
                    </p>
                </div>
                {messages.length > 0 && (
                    <Button variant="ghost" size="small" onClick={clearChat}>
                        Clear Chat
                    </Button>
                )}
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <h3 className="chat-empty-title">Start a Conversation</h3>
                        <p className="chat-empty-text">
                            {selectedDocIds.length === 0
                                ? 'Select documents from the sidebar to begin'
                                : 'Ask questions about your selected documents'}
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <ChatMessage key={message.message_id} message={message} />
                        ))}
                        {loading && (
                            <div className="chat-loading">
                                <Spinner size="small" />
                                <span>Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <form className="chat-input-form" onSubmit={handleSubmit}>
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                        selectedDocIds.length === 0
                            ? 'Select a Document'
                            : !currentSessionId
                                ? 'Start a new chat...'
                                : 'Ask a question...'
                    }
                    disabled={!currentSessionId || loading || selectedDocIds.length === 0}
                    className="chat-input"
                />
                <Button
                    type="submit"
                    variant="primary"
                    disabled={!inputValue.trim() || !currentSessionId || loading || selectedDocIds.length === 0}
                    loading={loading}
                    title={selectedDocIds.length === 0 ? 'Please select at least one document' : ''}
                >
                    Send
                </Button>
            </form>
        </div >
    );
};

export default ChatInterface;
