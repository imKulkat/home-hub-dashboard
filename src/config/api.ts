// API Configuration - All endpoints in one place
export const API_CONFIG = {
  baseUrl: '/api',
  
  endpoints: {
    login: '/api/login',
    stats: {
      system: '/api/stats/system',
      storage: '/api/stats/storage',
      temperature: '/api/stats/temperature',
    },
    docker: {
      containers: '/api/docker/containers',
    },
    install: '/api/install',
    installStatus: '/api/install/status',
    terminal: '/terminal',
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
