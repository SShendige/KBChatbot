import React from 'react';
import DocumentCard from '../../molecules/DocumentCard/DocumentCard';
import Button from '../../atoms/Button/Button';
import Spinner from '../../atoms/Spinner/Spinner';
import { useDocuments } from '../../../hooks/useDocuments';
import './DocumentList.css';

const DocumentList = () => {
    const {
        documents,
        selectedDocIds,
        loading,
        error,
        toggleDocumentSelection,
        selectAllDocuments,
        clearSelection,
        deleteDocument
    } = useDocuments();

    if (loading) {
        return (
            <div className="document-list-loading">
                <Spinner size="large" />
                <p>Loading documents...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="document-list-error">
                <div className="error-icon">!</div>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="document-list">
            <div className="document-list-header">
                <div className="document-list-info">
                    <h2 className="document-list-title">My Documents</h2>
                    <p className="document-list-count">
                        {documents.length} document{documents.length !== 1 ? 's' : ''} •{' '}
                        {selectedDocIds.length} selected
                    </p>
                </div>
                <div className="document-list-actions">
                    {selectedDocIds.length > 0 ? (
                        <Button variant="ghost" size="small" onClick={clearSelection}>
                            Clear Selection
                        </Button>
                    ) : (
                        documents.length > 0 && (
                            <Button variant="ghost" size="small" onClick={selectAllDocuments}>
                                Select All
                            </Button>
                        )
                    )}
                </div>
            </div>

            {documents.length === 0 ? (
                <div className="document-list-empty">
                    <h3 className="empty-title">No Documents Yet</h3>
                    <p className="empty-text">
                        Upload your first document to get started with knowledge-based chat
                    </p>
                </div>
            ) : (
                <div className="document-grid">
                    {documents.map((doc) => (
                        <DocumentCard
                            key={doc.doc_id}
                            document={doc}
                            isSelected={selectedDocIds.includes(doc.doc_id)}
                            onToggleSelect={toggleDocumentSelection}
                            onDelete={deleteDocument}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentList;
