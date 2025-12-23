import React from 'react';
import Badge from '../../atoms/Badge/Badge';
import Checkbox from '../../atoms/Checkbox/Checkbox';
import Button from '../../atoms/Button/Button';
import { formatFileSize, formatDate, getFileIcon } from '../../../utils/fileHelpers';
import { DOCUMENT_STATUS } from '../../../utils/constants';
import './DocumentCard.css';

const DocumentCard = ({
    document,
    isSelected,
    onToggleSelect,
    onDelete
}) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case DOCUMENT_STATUS.READY:
                return <Badge variant="success">Ready</Badge>;
            case DOCUMENT_STATUS.PROCESSING:
                return <Badge variant="processing">Processing</Badge>;
            case DOCUMENT_STATUS.FAILED:
                return <Badge variant="danger">Failed</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`Delete "${document.file_name}"?`)) {
            onDelete(document.doc_id);
        }
    };

    return (
        <div className={`document-card ${isSelected ? 'document-card-selected' : ''}`}>
            <div className="document-card-header">
                <Checkbox
                    checked={isSelected}
                    onChange={() => onToggleSelect(document.doc_id)}
                />
                {getStatusBadge(document.status)}
            </div>

            <div className="document-card-body">
                <div className="document-icon">{getFileIcon(document.mime_type)}</div>
                <div className="document-info">
                    <h3 className="document-name" title={document.file_name}>
                        {document.file_name}
                    </h3>
                    <div className="document-meta">
                        <span className="document-meta-item">Folder: {document.folder}</span>
                        <span className="document-meta-item">Size: {formatFileSize(document.file_size)}</span>
                        <span className="document-meta-item">
                            {document.source === 'gdrive' ? 'Google Drive' : 'Local'}
                        </span>
                    </div>
                    <div className="document-date">
                        Uploaded: {formatDate(document.uploaded_at)}
                    </div>
                </div>
            </div>

            <div className="document-card-footer">
                <Button
                    variant="danger"
                    size="small"
                    onClick={handleDelete}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
};

export default DocumentCard;
