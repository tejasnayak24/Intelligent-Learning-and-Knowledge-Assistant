import axios from 'axios';

// Address of the backend API, used by every service in this folder. Vite reads
// VITE_API_BASE_URL from .env.development for `npm run dev` (the local backend)
// and from .env.production for `npm run build`, which is what Vercel runs (the
// Render backend). A value set in the environment, such as in the Vercel
// project settings, takes priority over both files.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

if (!API_BASE_URL) {
  console.error(
    'VITE_API_BASE_URL is not set, so API requests will not reach the backend. ' +
      'Set it in frontend/.env.development or frontend/.env.production.'
  );
}

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// To automatically injects your JWT token into headers if logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;