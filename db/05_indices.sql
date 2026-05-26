SET search_path TO oficina;

-- Único índice mantido após o ciclo EXPLAIN ANALYZE documentado em
-- docs/06_relatorio.pdf. O otimizador passa a usar Index Only Scan
-- neste índice (em vez do agendamento_pkey) para a contagem de Q1,
-- com redução de aproximadamente 5% no tempo de execução.
CREATE INDEX idx_agendamento_veiculo
  ON agendamento(id_veiculo);

-- Índices propostos e DESCARTADOS após validação empírica (ver relatório):
--   idx_agendamento_status_data_desc  (Q2) -- partial index não selecionado;
--                                            Seq Scan + Filter é igual ou melhor.
--   idx_item_servico_tipo_servico     (Q3) -- Hash Join continua ótimo (7k x 20).
--   idx_item_servico_funcionario      (Q4, Q8) -- Hash Join continua ótimo.
--   idx_agendamento_status_concluido  (Q4) -- partial não selecionado.
--   idx_veiculo_cliente               (Q5) -- Hash Join continua ótimo.
--   idx_pagamento_agendamento         (Q5) -- Hash Join continua ótimo.
--   idx_item_servico_funcionario_distinct (Q8) -- redundante com idx_item_servico_funcionario.
