import API from './api';

export const notesService = {
  getNotes: async () => {
    const response = await API.post('/summarize');
    return response.data; 
  }
};