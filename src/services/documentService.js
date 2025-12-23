import api from './api';

/**
 * Get all documents for current user
 */
export const getDocuments = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/documents?${params}`);
    return response.data;
};

/**
 * Get document by ID
 */
export const getDocumentById = async (docId) => {
    const response = await api.get(`/documents/${docId}`);
    return response.data;
};

/**
 * Delete document
 */
export const deleteDocument = async (docId) => {
    const response = await api.delete(`/documents/${docId}`);
    return response.data;
};

/**
 * Get unique folders
 */
export const getFolders = async () => {
    const response = await api.get('/documents/folders');
    return response.data;
};

/**
 * Upload local files
 */
export const uploadLocalFiles = async (files, folder, onProgress) => {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append('files', file);
    });

    formData.append('folder', folder || 'Root');

    const response = await api.post('/upload/local', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (onProgress) {
                onProgress(percentCompleted);
            }
        }
    });

    return response.data;
};

/**
 * Upload from Google Drive
 */
export const uploadFromGoogleDrive = async (driveFiles, folder) => {
    const response = await api.post('/upload/gdrive', {
        files: driveFiles,
        folder: folder || 'Root'
    });
    return response.data;
};

/**
 * Get upload status
 */
export const getUploadStatus = async (docId) => {
    const response = await api.get(`/upload/status/${docId}`);
    return response.data;
};

/**
 * Get documents by folder
 */
export const getDocumentsByFolder = async (folder) => {
    return getDocuments({ folder });
};
