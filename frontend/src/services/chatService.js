import API from './api';

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
    const response = await API.post('/search', { question: questionText });
    return response.data; // Returns the raw text response string from Gemini
  }
};