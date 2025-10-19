export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_APP_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  ENDPOINTS: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    LOGOUT: '/users/logout',
  }
};
