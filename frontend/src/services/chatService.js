import API from './api';
import { documentService } from './documentService';

export const chatService = {
  // Check if a document vector store index is active in the backend directory
  checkVectorStatus: async () => {
    try {
      const response = await API.get('/check-vectors');
      return response.data; // Expects { faiss_exists: boolean, chunks_exists: boolean }
    } catch (error) {
      console.error('Error fetching vector status:', error);
      return { faiss_exists: false, chunks_exists: false };
    }
  },

  askQuestion: async (questionText) => {
    // Answers come only from the selected PDF (see documentService).
    const activeDocument = documentService.getActiveDocument();
    const response = await API.post('/search', {
      question: questionText,
      document_id: activeDocument?.id,
    });
    return response.data; // Returns the raw text response string from Gemini
  }
};