import React, { useState } from 'react';
import Sidebar from '../../components/organisms/Sidebar/Sidebar';
import ChatInterface from '../../components/organisms/ChatInterface/ChatInterface';
import DocumentList from '../../components/organisms/DocumentList/DocumentList';
import UploadModal from '../../components/organisms/UploadModal/UploadModal';
import Button from '../../components/atoms/Button/Button';
import './Dashboard.css';

const Dashboard = () => {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [activeView, setActiveView] = useState('chat'); // 'chat' or 'documents'

    return (
        <div className="dashboard">
            <Sidebar onUploadClick={() => setUploadModalOpen(true)} />

            <div className="dashboard-main">
                <div className="dashboard-header">
                    <div className="view-toggle">
                        <Button
                            variant={activeView === 'chat' ? 'primary' : 'ghost'}
                            onClick={() => setActiveView('chat')}
                        >
                            Chat
                        </Button>
                        <Button
                            variant={activeView === 'documents' ? 'primary' : 'ghost'}
                            onClick={() => setActiveView('documents')}
                        >
                            Documents
                        </Button>
                    </div>
                </div>

                <div className="dashboard-content">
                    {activeView === 'chat' ? (
                        <ChatInterface />
                    ) : (
                        <DocumentList />
                    )}
                </div>
            </div>

            <UploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
            />
        </div>
    );
};

export default Dashboard;
