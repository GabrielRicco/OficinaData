const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function salvarSessao(loginResponse) {
  localStorage.setItem('oficina_token', loginResponse.token);
  localStorage.setItem('oficina_usuario', JSON.stringify(loginResponse.usuario));
}

export function limparSessao() {
  localStorage.removeItem('oficina_token');
  localStorage.removeItem('oficina_usuario');
}

export function obterUsuario() {
  const usuario = localStorage.getItem('oficina_usuario');
  return usuario ? JSON.parse(usuario) : null;
}

async function request(path, options = {}) {
  const token = localStorage.getItem('oficina_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.erro || 'Erro ao comunicar com o backend.');
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
};
