import API from './api';

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
    
    return response.data;
  },
};