import { apiFetch } from './api';

export function listarAgendamentos({ status = '', data = '', page = 0, size = 10 } = {}) {
  const params = new URLSearchParams({ page, size });
  if (status) params.set('status', status);
  if (data) params.set('data', data);
  return apiFetch(`/agendamentos?${params.toString()}`);
}

export function detalharAgendamento(id) {
  return apiFetch(`/agendamentos/${id}`);
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

export function adicionarServico(id, payload) {
  return apiFetch(`/agendamentos/${id}/itens-servico`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function adicionarPeca(id, payload) {
  return apiFetch(`/agendamentos/${id}/itens-peca`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function registrarPagamento(id, payload) {
  return apiFetch(`/agendamentos/${id}/pagamento`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function registrarAvaliacao(id, payload) {
  return apiFetch(`/agendamentos/${id}/avaliacao`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
