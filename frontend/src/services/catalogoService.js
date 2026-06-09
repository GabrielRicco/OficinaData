import { apiFetch } from './api';

export function listarTiposServico() {
  return apiFetch('/tipos-servico');
}

export function listarFuncionarios() {
  return apiFetch('/funcionarios');
}
