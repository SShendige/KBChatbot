import React, { createContext, useState, useEffect, useContext } from 'react';
import { getDocuments, getFolders, deleteDocument as deleteDocService } from '../services/documentService';
import { AuthContext } from './AuthContext';
import { STORAGE_KEYS } from '../utils/constants';

export const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [documents, setDocuments] = useState([]);
    const [folders, setFolders] = useState([]);
    const [selectedDocIds, setSelectedDocIds] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch documents when user changes
    useEffect(() => {
        if (user) {
            fetchDocuments();
            fetchFolders();
        } else {
            setDocuments([]);
            setFolders([]);
        }
    }, [user]);

    // Validate selected docs exist after documents are loaded
    useEffect(() => {
        if (documents.length > 0 && selectedDocIds.length > 0) {
            const validDocIds = selectedDocIds.filter(id =>
                documents.some(doc => doc.doc_id === id)
            );

            // Only update if some selections were invalid
            if (validDocIds.length !== selectedDocIds.length) {
                console.log('Removing invalid doc selections');
                setSelectedDocIds(validDocIds);
            }
        }
    }, [documents]);

    const fetchDocuments = async (filters = {}) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDocuments(filters);
            setDocuments(data.documents || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const fetchFolders = async () => {
        try {
            const data = await getFolders();
            setFolders(data.folders || []);
        } catch (err) {
            console.error('Failed to fetch folders:', err);
        }
    };

    const deleteDocument = async (docId) => {
        try {
            await deleteDocService(docId);
            setDocuments(prev => prev.filter(doc => doc.doc_id !== docId));
            setSelectedDocIds(prev => prev.filter(id => id !== docId));
            await fetchFolders(); // Refresh folders
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to delete document');
        }
    };

    const toggleDocumentSelection = (docId) => {
        setSelectedDocIds(prev => {
            if (prev.includes(docId)) {
                return prev.filter(id => id !== docId);
            } else {
                return [...prev, docId];
            }
        });
    };

    const selectAllDocuments = () => {
        setSelectedDocIds(documents.map(doc => doc.doc_id));
    };

    const clearSelection = () => {
        setSelectedDocIds([]);
    };

    const filterByFolder = (folder) => {
        setSelectedFolder(folder);
        fetchDocuments({ folder });
    };

    const clearFolderFilter = () => {
        setSelectedFolder(null);
        fetchDocuments();
    };

    const value = {
        documents,
        folders,
        selectedDocIds,
        setSelectedDocIds,
        selectedFolder,
        loading,
        error,
        fetchDocuments,
        fetchFolders,
        deleteDocument,
        toggleDocumentSelection,
        selectAllDocuments,
        clearSelection,
        filterByFolder,
        clearFolderFilter
    };

    return (
        <DocumentContext.Provider value={value}>
            {children}
        </DocumentContext.Provider>
    );
};
