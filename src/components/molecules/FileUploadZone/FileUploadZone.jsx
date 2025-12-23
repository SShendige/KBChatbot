import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { isValidFileType, isValidFileSize, formatFileSize } from '../../../utils/fileHelpers';
import './FileUploadZone.css';

const FileUploadZone = ({ onFilesSelected, accept, maxSize, multiple = true }) => {
    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            const errors = rejectedFiles.map(({ file, errors }) => ({
                file: file.name,
                errors: errors.map(e => e.message)
            }));
            console.error('Rejected files:', errors);
        }

        if (acceptedFiles.length > 0) {
            onFilesSelected(acceptedFiles);
        }
    }, [onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: accept || {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md']
        },
        maxSize: maxSize || 10 * 1024 * 1024, // 10MB default
        multiple
    });

    return (
        <div
            {...getRootProps()}
            className={`file-upload-zone ${isDragActive ? 'file-upload-zone-active' : ''}`}
        >
            <input {...getInputProps()} />
            {isDragActive ? (
                <p className="file-upload-text">Drop files here...</p>
            ) : (
                <>
                    <p className="file-upload-text">
                        Drag & drop files here, or <span className="file-upload-link">click to browse</span>
                    </p>
                    <p className="file-upload-hint">
                        Supported: PDF, DOCX, DOC, TXT, MD (Max {formatFileSize(maxSize || 10 * 1024 * 1024)})
                    </p>
                </>
            )}
        </div>
    );
};

export default FileUploadZone;
