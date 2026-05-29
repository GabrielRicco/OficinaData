const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

let accessToken = null;
let refreshToken = null;
let currentUser = null;

export function setAuthSession(auth) {
  accessToken = auth?.token || null;
  refreshToken = auth?.refreshToken || null;
  currentUser = auth?.usuario || null;
}

export function getCurrentUser() {
  return currentUser;
}

export function clearAuthSession() {
  accessToken = null;
  refreshToken = null;
  currentUser = null;
}

export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 && refreshToken) {
    const refreshed = await refresh();
    if (refreshed) {
      return apiFetch(path, options);
    }
  }

  if (!response.ok) {
    let message = 'Erro ao comunicar com a API';
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function refresh() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` }
  });

  if (!response.ok) {
    clearAuthSession();
    return false;
  }

  setAuthSession(await response.json());
  return true;
}
