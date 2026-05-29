import { api } from './api';

export function cadastrarCliente(dados) {
  return api.post('/clientes', dados);
}
