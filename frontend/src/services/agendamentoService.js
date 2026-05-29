import { api } from './api';

export function listarAgendamentos(limite = 20) {
  return api.get(`/agendamentos?limite=${limite}`);
}

export function carregarDashboard() {
  return api.get('/dashboard');
}
