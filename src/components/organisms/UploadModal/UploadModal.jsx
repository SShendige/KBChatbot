import React, { useState } from 'react';
import FileUploadZone from '../../molecules/FileUploadZone/FileUploadZone';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';
import { uploadLocalFiles } from '../../../services/documentService';
import { useDocuments } from '../../../hooks/useDocuments';
import './UploadModal.css';

const UploadModal = ({ isOpen, onClose }) => {
    const { fetchDocuments } = useDocuments();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [folder, setFolder] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);

    const handleFilesSelected = (files) => {
        setSelectedFiles(files);
        setError(null);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        try {
            setUploading(true);
            setError(null);

            await uploadLocalFiles(
                selectedFiles,
                folder || 'Root',
                (progress) => setUploadProgress(progress)
            );

            // Refresh documents list
            await fetchDocuments();

            // Close modal and reset
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            setSelectedFiles([]);
            setFolder('');
            setError(null);
            setUploadProgress(0);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Upload Documents</h2>
                    <button className="modal-close" onClick={handleClose} disabled={uploading}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <Input
                        label="Folder (optional)"
                        placeholder="e.g., HR/Policies"
                        value={folder}
                        onChange={(e) => setFolder(e.target.value)}
                        disabled={uploading}
                    />

                    <FileUploadZone
                        onFilesSelected={handleFilesSelected}
                        multiple={true}
                    />

                    {selectedFiles.length > 0 && (
                        <div className="selected-files">
                            <h3 className="selected-files-title">
                                Selected Files ({selectedFiles.length})
                            </h3>
                            <ul className="selected-files-list">
                                {selectedFiles.map((file, index) => (
                                    <li key={index} className="selected-file-item">
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {uploading && (
                        <div className="upload-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="progress-text">{uploadProgress}% uploaded</p>
                        </div>
                    )}

                    {error && (
                        <div className="upload-error">
                            <span className="error-icon">!</span>
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <Button variant="outline" onClick={handleClose} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || uploading}
                        loading={uploading}
                    >
                        Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
