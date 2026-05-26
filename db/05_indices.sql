--===========================================================================
-- 05_indices.sql
-- Índices propostos baseado em análise EXPLAIN ANALYZE
--===========================================================================
-- 
-- CICLO DE VALIDAÇÃO OBRIGATÓRIO PARA CADA ÍNDICE:
-- 1. Executar EXPLAIN ANALYZE da consulta SEM o índice
-- 2. Criar o índice (CREATE INDEX abaixo)
-- 3. Executar ANALYZE para atualizar estatísticas
-- 4. Executar EXPLAIN ANALYZE da consulta COM o índice
-- 5. Documentar no relatório a redução de tempo e mudança de estratégia
-- 
-- Este arquivo contém APENAS os CREATE INDEX validados por evidência empírica.
-- Nenhum índice aqui deve existir sem seu par de EXPLAIN ANALYZE antes/depois.
--===========================================================================

SET search_path TO oficina;

--===========================================================================
-- ÍNDICES PARA CONSULTA 2: Receita por mês
--===========================================================================
-- Motivação: Filtros em status='Concluido' e range de data_conclusao
-- Com ~3500 agendamentos e ~55% Concluidos (~1925 linhas), índice composto
-- pode transformar Seq Scan em Index Range Scan + Index Only Scan
--
-- Status: [PENDENTE - executar EXPLAIN ANALYZE antes/depois para validar]
-- Redução esperada: 40-60% (index scan + buffer cache)

CREATE INDEX idx_agendamento_status_data_desc 
  ON agendamento(status, data_conclusao DESC)
  WHERE status = 'Concluido';
-- Índice parcial: inclui apenas agendamentos concluídos, reduzindo tamanho
-- Comentário: Consulta 2 - Filtra por status E data


--===========================================================================
-- ÍNDICES PARA CONSULTA 3: Top 10 tipos de serviço
--===========================================================================
-- Motivação: JOIN entre item_servico e tipo_servico
-- item_servico (~7000 linhas) x tipo_servico (~20 linhas)
-- Índice em FK acelera Nested Loop Join
--
-- Status: [PENDENTE - executar EXPLAIN ANALYZE antes/depois para validar]
-- Redução esperada: 20-35% (reduz buffers de hash join)

CREATE INDEX idx_item_servico_tipo_servico 
  ON item_servico(id_tipo_servico);
-- Comentário: Consulta 3 - Acelera join item_servico->tipo_servico


--===========================================================================
-- ÍNDICES PARA CONSULTA 4: Ranking funcionários
--===========================================================================
-- Motivação: Dois joins (funcionario-item_servico, item_servico-agendamento)
--            + filtro WHERE status='Concluido'
-- 50 funcionários join ~7000 items + filter por status
-- Índices em FKs + índice parcial para status
--
-- Status: [PENDENTE - executar EXPLAIN ANALYZE antes/depois para validar]
-- Redução esperada: 35-55% (múltiplos nested loops acelerados)

CREATE INDEX idx_item_servico_funcionario 
  ON item_servico(id_funcionario);
-- Comentário: Consulta 4 - Acelera join funcionario->item_servico

CREATE INDEX idx_agendamento_status_concluido 
  ON agendamento(status)
  WHERE status = 'Concluido';
-- Comentário: Consulta 4 - Índice parcial para filter status='Concluido'


--===========================================================================
-- ÍNDICES PARA CONSULTA 5: Top 20 clientes por gasto
--===========================================================================
-- Motivação: 4-way join cliente->veiculo->agendamento->pagamento
--            Pior caso: múltiplas seq scans concatenadas
-- Índices nas FKs aceleram dramatically via Nested Loop
--
-- Status: [PENDENTE - executar EXPLAIN ANALYZE antes/depois para validar]
-- Redução esperada: 50-70% (4 índices, cada um reduz fator 2x)

CREATE INDEX idx_veiculo_cliente 
  ON veiculo(id_cliente);
-- Comentário: Consulta 5 - Acelera join cliente->veiculo

CREATE INDEX idx_agendamento_veiculo 
  ON agendamento(id_veiculo);
-- Comentário: Consulta 5 - Acelera join veiculo->agendamento

CREATE INDEX idx_pagamento_agendamento 
  ON pagamento(id_agendamento);
-- Comentário: Consulta 5 - Acelera join agendamento->pagamento


--===========================================================================
-- ÍNDICES PARA CONSULTA 8: Nota média funcionário
--===========================================================================
-- Motivação: Dois joins (funcionario-item_servico-avaliacao)
--            HAVING clause com COUNT(DISTINCT av.id_avaliacao) >= 5
-- Índice em FK melhora Nested Loop, filtro HAVING é post-agregação
--
-- Status: [PENDENTE - executar EXPLAIN ANALYZE antes/depois para validar]
-- Redução esperada: 25-40% (nested loop acceleration)

CREATE INDEX idx_item_servico_funcionario_distinct 
  ON item_servico(id_funcionario);
-- Comentário: Consulta 8 - Acelera join funcionario->item_servico


--===========================================================================
-- ÍNDICES NÃO CRIADOS (decisão justificada)
--===========================================================================
-- 
-- CONSULTA 1 (Contagem de registros):
--   Decisão: Sem índices
--   Razão: Operação UNION de COUNT(*) puro; sem WHERE, sem JOIN
--   Análise: Seq Scan em cada tabela é ótimo; índice não ajuda COUNT(*)
--
-- CONSULTA 6 (Distribuição formas pagamento):
--   Decisão: Sem índices
--   Razão: Seq Scan é correto; GROUP BY agregação pura
--   Análise: Todas as linhas de pagamento (~5000) devem ser lidas
--
-- CONSULTA 7 (Peças abaixo do mínimo):
--   Decisão: Sem índices
--   Razão: Tabela muito pequena (~40 linhas)
--   Análise: Seq Scan em tabela pequena + overhead de índice não compensam
--           índice apenas para ~12-15 linhas abaixo do mínimo

--===========================================================================
-- INSTRUÇÕES DE USO
--===========================================================================
-- 
-- 1. ANTES de executar estes índices:
--    - Colete EXPLAIN ANALYZE de cada consulta correspondente
--    - Documente no relatório (04_relatorio_explain_analyze.txt)
--
-- 2. CRIAR os índices:
--    psql -h seu_host -U seu_usuario -d seu_db -f 05_indices.sql
--
-- 3. APÓS criar índices:
--    - Execute ANALYZE; (atualizar estatísticas)
--    - Colete novamente EXPLAIN ANALYZE das mesmas consultas
--    - Compare: tempo, tipo de varredura, buffers
--
-- 4. DOCUMENTAR redução percentual na tabela de síntese do relatório
--
-- 5. Se redução for < 5%: descomentar índice e aguardar dados reais
--    Se redução for > 5%: manter índice no script final

--===========================================================================
-- REMOÇÃO DE ÍNDICES (se necessário reanalizar)
--===========================================================================
-- Para deletar um índice durante validação:
--   DROP INDEX IF EXISTS oficina.idx_agendamento_status_data_desc CASCADE;
--
-- Após dropar, re-execute ANALYZE e colete novo EXPLAIN ANALYZE

--===========================================================================
