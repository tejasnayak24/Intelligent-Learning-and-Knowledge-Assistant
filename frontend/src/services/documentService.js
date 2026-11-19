import API from './api';
import { authService } from './authService';

// Chat and notes work on one PDF at a time: the one the signed-in user
// uploaded most recently in this browser. It is stored under the user's
// email, so another account in the same browser never picks it up.
const activeDocumentKey = () => {
  const user = authService.getCurrentUser();
  return user ? `activeDocument:${user.email}` : null;
};

export const documentService = {
  uploadPdf: async (fileObject, onProgress) => {
    const formData = new FormData();
    formData.append('file', fileObject);

    const response = await API.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    if (response.data?.document_id) {
      documentService.setActiveDocument({
        id: response.data.document_id,
        filename: response.data.filename,
      });
    }

    return response.data;
  },

  // --- ACTIVE DOCUMENT ---
  // { id, filename } of the selected PDF, or null if this user has none.
  getActiveDocument: () => {
    try {
      const key = activeDocumentKey();
      const document = key ? JSON.parse(localStorage.getItem(key)) : null;
      return typeof document?.id === 'string' ? document : null;
    } catch {
      return null;
    }
  },

  setActiveDocument: ({ id, filename }) => {
    try {
      const key = activeDocumentKey();
      if (key) {
        localStorage.setItem(key, JSON.stringify({ id, filename }));
      }
    } catch {
      // Storage unavailable: chat will ask the user to upload a PDF again.
    }
  },
};
