import { apiFetch } from './api';

export function listarPecas({ nome, fornecedor, precoMin, precoMax, page = 0, size = 20 } = {}) {
  const params = new URLSearchParams();
  if (nome) params.set('nome', nome);
  if (fornecedor) params.set('fornecedor', fornecedor);
  if (precoMin !== undefined && precoMin !== '') params.set('precoMin', precoMin);
  if (precoMax !== undefined && precoMax !== '') params.set('precoMax', precoMax);
  params.set('page', page);
  params.set('size', size);
  return apiFetch(`/pecas?${params.toString()}`);
}

export function listarPecasAbaixoMinimo() {
  return apiFetch('/pecas/abaixo-estoque-minimo');
}
