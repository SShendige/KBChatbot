// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// File Upload Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown'
];

export const FILE_TYPE_EXTENSIONS = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'text/plain': '.txt',
  'text/markdown': '.md'
};

// Document Sources
export const DOCUMENT_SOURCES = {
  LOCAL: 'local',
  GDRIVE: 'gdrive'
};

// Document Status
export const DOCUMENT_STATUS = {
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed'
};

// Chat Constants
export const MAX_CHAT_HISTORY = 50;
export const TYPING_INDICATOR_DELAY = 500;

// UI Constants
export const SIDEBAR_WIDTH = 280;
export const HEADER_HEIGHT = 64;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'kbc_auth_token',
  USER_DATA: 'kbc_user_data',
  SELECTED_DOCS: 'kbc_selected_docs',
  CURRENT_SESSION: 'kbc_current_session'
};
