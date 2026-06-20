import API from './api';

export const chatService = {
  askQuestion: async (questionText) => {
    const response = await API.post('/search', { question: questionText });
    return response.data; // Returns the raw text response string from Gemini
  }
};