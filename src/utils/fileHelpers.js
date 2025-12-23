import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './constants';

/**
 * Validate file type
 */
export const isValidFileType = (file) => {
    return ALLOWED_FILE_TYPES.includes(file.type);
};

/**
 * Validate file size
 */
export const isValidFileSize = (file) => {
    return file.size <= MAX_FILE_SIZE;
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Generate file icon based on type
 */
export const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word')) return 'DOC';
    if (mimeType.includes('text')) return 'TXT';
    return 'FILE';
};

/**
 * Calculate SHA-256 checksum (client-side)
 */
export const calculateChecksum = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
    let dateStr = date;

    // Only add Z for UTC if it's missing AND doesn't already have timezone info
    // IST timestamps: 2025-12-22T12:28:17+05:30
    // UTC timestamps: 2025-12-22T06:58:17Z or 2025-12-22T06:58:17
    if (typeof date === 'string' && date.includes('T') && !date.endsWith('Z') && !date.includes('+') && !date.includes('-', 10)) {
        dateStr += 'Z';
    }

    const d = new Date(dateStr);

    // Explicitly format for IST timezone
    return d.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    });
};

/**
 * Extract folder path from full path
 */
export const extractFolder = (path) => {
    const parts = path.split('/');
    parts.pop(); // Remove filename
    return parts.join('/') || 'Root';
};
