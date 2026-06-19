import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://sana-pathology-backend.onrender.com/api';

const getHeaders = async (contentType = 'application/json') => {
  const headers = { 'Content-Type': contentType };
  try {
    const userStr = await AsyncStorage.getItem('sana_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const token = user.accessToken || user.token;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {}
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
};

export const api = {
  get: async (endpoint) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, { headers });
    return handleResponse(res);
  },
  post: async (endpoint, body) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST', headers, body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  put: async (endpoint, body) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT', headers, body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  delete: async (endpoint) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE', headers,
    });
    return handleResponse(res);
  },
};

export const publicApi = {
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`);
    return handleResponse(res);
  },
  post: async (endpoint, body) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
};
