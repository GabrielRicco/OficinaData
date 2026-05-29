import { apiFetch } from './api';

export function cadastrarCliente(cliente) {
  return apiFetch('/clientes', {
    method: 'POST',
    body: JSON.stringify(cliente)
  });
}

export function cadastrarVeiculo(veiculo) {
  return apiFetch('/veiculos', {
    method: 'POST',
    body: JSON.stringify(veiculo)
  });
}

export function listarClientes({ nome = '', tipo = '', page = 0, size = 10 } = {}) {
  const params = new URLSearchParams({ page, size });
  if (nome) params.set('nome', nome);
  if (tipo) params.set('tipo', tipo);
  return apiFetch(`/clientes?${params.toString()}`);
}
