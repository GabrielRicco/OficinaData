import { apiFetch, setAuthSession } from './api';

export async function login(email, senha) {
  const auth = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha })
  });
  setAuthSession(auth);
  return auth;
}
