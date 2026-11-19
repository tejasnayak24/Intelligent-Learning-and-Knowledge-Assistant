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

  // --- CURRENT USER ---
  // Name and email of the signed-in user, read from the token saved at login.
  // Returns null when there is no token, or it is unreadable, expired or has
  // no email. This only decodes the token for display; it does not verify it.
  getCurrentUser: () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // A JWT is header.payload.signature; the payload is base64url-encoded JSON.
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
      const claims = JSON.parse(new TextDecoder().decode(bytes));

      const email = typeof claims?.email === 'string' ? claims.email.trim() : '';
      const expired = typeof claims?.exp === 'number' && claims.exp * 1000 <= Date.now();
      if (!email || expired) return null;

      const name = typeof claims.name === 'string' ? claims.name.trim() : '';
      return { name: name || null, email };
    } catch {
      return null;
    }
  },

  // --- HELPER UTILITY ---
  // Quick check method for protecting client-side dashboard routing matrices
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};