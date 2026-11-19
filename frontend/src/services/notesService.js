import API from './api';
import { documentService } from './documentService';

export const notesService = {
  getNotes: async () => {
    // Summarize only the selected PDF (see documentService).
    const activeDocument = documentService.getActiveDocument();
    const response = await API.post('/summarize', { document_id: activeDocument?.id });
    return response.data; 
  }
};