// API Configuration - All endpoints in one place
const BASE_URL = 'https://api.vesastar.top';

export const API_CONFIG = {
  baseUrl: BASE_URL,
  
  endpoints: {
    login: `${BASE_URL}/api/login`,
    stats: {
      system: `${BASE_URL}/api/stats/system`,
      storage: `${BASE_URL}/api/stats/storage`,
      temperature: `${BASE_URL}/api/stats/temperature`,
    },
    docker: {
      containers: `${BASE_URL}/api/docker/containers`,
    },
    install: `${BASE_URL}/api/install`,
    installStatus: `${BASE_URL}/api/install/status`,
    terminal: `wss://api.vesastar.top/terminal`,
  },
  
  // Polling intervals in milliseconds
  polling: {
    stats: 5000,
    containers: 10000,
  },
};

// Helper to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = sessionStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper for authenticated fetch
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    sessionStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  return response;
};
