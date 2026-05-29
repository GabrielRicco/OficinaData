import { apiFetch } from './api';

export function listarAgendamentos({ status = '', data = '', page = 0, size = 10 } = {}) {
  const params = new URLSearchParams({ page, size });
  if (status) params.set('status', status);
  if (data) params.set('data', data);
  return apiFetch(`/agendamentos?${params.toString()}`);
}

export function abrirAgendamento(payload) {
  return apiFetch('/agendamentos', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function atualizarStatus(id, payload) {
  return apiFetch(`/agendamentos/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}
