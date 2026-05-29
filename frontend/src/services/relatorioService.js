import { apiFetch } from './api';

export function buscarDashboard() {
  return apiFetch('/relatorios/dashboard');
}

export function buscarReceitaMensal() {
  return apiFetch('/relatorios/receita-mensal');
}

export function buscarRankingServicos() {
  return apiFetch('/relatorios/ranking-servicos');
}

export function buscarPecasAbaixoMinimo() {
  return apiFetch('/pecas/abaixo-estoque-minimo');
}
