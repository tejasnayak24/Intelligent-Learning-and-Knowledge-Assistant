import API from './api';

export const authService = {
  // --- SIGNUP SERVICE ---
  signup: async (name, email, password) => {
    try {
      const response = await API.post('/signup', { name, email, password });
      return response.data;
    } catch (error) {
      // Logs exact backend failure details cleanly into the console matrix
      console.error('AuthService Signup Exception:', error.response?.data || error.message);
      throw error; // Bubbles error up to keep components in the catch block
    }
  },

  // --- LOGIN SERVICE ---
  login: async (email, password) => {
    try {
      const response = await API.post('/login', { email, password });
      
      // Extract token safely across all common backend response formats:
      // 1. Raw string payload
      // 2. Custom token object (.token)
      // 3. FastAPI standard OAuth2 payload (.access_token)
      const token = typeof response.data === 'string'
        ? response.data
        : (response.data?.token || response.data?.access_token);

      if (token) {
        localStorage.setItem('token', token);
      } else {
        console.warn('Authentication successful, but no token format matched the payload:', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('AuthService Login Exception:', error.response?.data || error.message);
      throw error; // CRITICAL: Forces Login.jsx to halt navigation on 401/400 errors
    }
  },

  // --- LOGOUT SERVICE ---
  logout: () => {
    localStorage.removeItem('token');
  },

  // --- HELPER UTILITY ---
  // Quick check method for protecting client-side dashboard routing matrices
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};