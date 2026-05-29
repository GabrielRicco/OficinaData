import { api, salvarSessao } from './api';

export async function login(email, senha) {
  const response = await api.post('/auth/login', { email, senha });
  salvarSessao(response);
  return response;
}
