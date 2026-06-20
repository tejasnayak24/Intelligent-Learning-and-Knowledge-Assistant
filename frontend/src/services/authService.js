import API from './api';

export const authService = {
  signup: async (name, email, password) => {
    const response = await API.post('/signup', { name, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await API.post('/login', { email, password });
    
    if (response.data && typeof response.data === 'string') {
      localStorage.setItem('token', response.data);
    } else if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};