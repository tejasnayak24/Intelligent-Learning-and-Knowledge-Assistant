import API from './api';

export const notesService = {
  getNotes: async () => {
    const response = await API.get('/documents');
    return response.data; 
  }
};