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

function getErrorMessage(status, body) {
  const defaultMessage = body?.message || 'Erro ao comunicar com a API';

  switch (status) {
    case 400:
      return body?.message || 'Dados inválidos. Verifique os campos do formulário.';
    case 401:
      return body?.message || 'Sua sessão expirou. Faça login novamente.';
    case 403:
      return body?.message || 'Você não tem permissão para acessar este recurso.';
    case 404:
      return body?.message || 'Recurso não encontrado.';
    case 500:
      return body?.message || 'Erro no servidor. Tente novamente mais tarde.';
    default:
      return defaultMessage;
  }
}

class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.status = status;
    this.statusText = body?.statusText || '';
    this.errors = body?.errors || null;
  }
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
    let body = {};
    try {
      body = await response.json();
    } catch {
      body = { message: response.statusText };
    }

    const message = getErrorMessage(response.status, body);
    throw new ApiError(response.status, message, body);
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

  const auth = await response.json();
  setAuthSession(auth);
  return true;
}
