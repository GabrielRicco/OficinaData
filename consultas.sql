--database: ./db.sqlite

-- Consulta 1: Contagem de registros por tabela
-- (a) SQL executado
SELECT 'cliente' AS tabela, COUNT(*) AS qtd FROM cliente
UNION ALL SELECT 'veiculo', COUNT(*) FROM veiculo
UNION ALL SELECT 'funcionario', COUNT(*) FROM funcionario
UNION ALL SELECT 'tipo_servico', COUNT(*) FROM tipo_servico
UNION ALL SELECT 'peca', COUNT(*) FROM peca
UNION ALL SELECT 'agendamento', COUNT(*) FROM agendamento
UNION ALL SELECT 'item_servico', COUNT(*) FROM item_servico
UNION ALL SELECT 'item_peca', COUNT(*) FROM item_peca
UNION ALL SELECT 'pagamento', COUNT(*) FROM pagamento
UNION ALL SELECT 'avaliacao', COUNT(*) FROM avaliacao;


-- Consulta 2: Receita total e ticket médio por mês (últimos 12 meses)
-- Considera apenas agendamentos com status 'Concluido'
SELECT strftime('%Y-%m', data_conclusao) AS mes,
			 COUNT(*) AS qtd_agendamentos,
			 ROUND(SUM(total_geral),2) AS receita_total,
			 ROUND(AVG(total_geral),2) AS ticket_medio
FROM agendamento
WHERE status = 'Concluido'
	AND data_conclusao IS NOT NULL
	AND data_conclusao >= datetime('now','-12 months')
GROUP BY mes
ORDER BY mes DESC;


-- Consulta 3: Top 10 tipos de serviço mais realizados (por quantidade e faturamento)
SELECT ts.id_tipo_servico,
			 ts.descricao,
			 SUM(isv.quantidade) AS qtd_execucoes,
			 ROUND(SUM(isv.total),2) AS faturamento
FROM item_servico isv
JOIN tipo_servico ts ON isv.id_tipo_servico = ts.id_tipo_servico
GROUP BY ts.id_tipo_servico, ts.descricao
ORDER BY qtd_execucoes DESC, faturamento DESC
LIMIT 10;


-- Consulta 4: Ranking de funcionários por faturamento (ordens concluídas)
SELECT f.id_funcionario,
			 f.nome,
			 COUNT(DISTINCT isv.id_agendamento) AS qtd_os,
			 ROUND(SUM(isv.total),2) AS faturamento
FROM funcionario f
JOIN item_servico isv ON isv.id_funcionario = f.id_funcionario
JOIN agendamento ag ON ag.id_agendamento = isv.id_agendamento
WHERE ag.status = 'Concluido'
GROUP BY f.id_funcionario, f.nome
ORDER BY faturamento DESC;


-- Consulta 5: Top 20 clientes por gasto acumulado (distinguindo PF/PJ)
-- Usa pagamentos como fonte de gasto (somente pagamentos registrados)
SELECT c.id_cliente,
			 c.nome,
			 CASE WHEN c.cpf IS NOT NULL THEN 'PF' ELSE 'PJ' END AS tipo_cliente,
			 ROUND(SUM(p.valor),2) AS gasto_total
FROM cliente c
JOIN veiculo v ON v.id_cliente = c.id_cliente
JOIN agendamento ag ON ag.id_veiculo = v.id_veiculo
JOIN pagamento p ON p.id_agendamento = ag.id_agendamento
GROUP BY c.id_cliente, c.nome, tipo_cliente
ORDER BY gasto_total DESC
LIMIT 20;


-- Consulta 6: Distribuição percentual das formas de pagamento confirmadas
SELECT forma_pagamento,
			 COUNT(*) AS qtd_transacoes,
			 ROUND(SUM(valor),2) AS valor_total,
			 ROUND( (SUM(valor) * 100.0) / (SELECT SUM(valor) FROM pagamento), 2) AS perc_valor
FROM pagamento
GROUP BY forma_pagamento
ORDER BY valor_total DESC;


-- Consulta 7: Peças com estoque atual abaixo do mínimo (exibe déficit e fornecedor se houver)
SELECT id_peca,
			 nome,
			 quantidade_estoque,
			 quantidade_minima,
			 (quantidade_minima - quantidade_estoque) AS deficit,
			 NULL AS fornecedor -- schema atual não possui tabela/coluna de fornecedor
FROM peca
WHERE quantidade_estoque < quantidade_minima
ORDER BY deficit DESC;


-- Consulta 8 (simplificada): Nota média de avaliação por funcionário (apenas >= 5 avaliações)
-- Contamos avaliações distintas por funcionário e calculamos a média das notas
SELECT f.id_funcionario,
	   f.nome,
	   COUNT(DISTINCT av.id_avaliacao) AS qtd_avaliacoes,
	   ROUND(AVG(av.nota),2) AS nota_media
FROM funcionario f
JOIN item_servico isv ON isv.id_funcionario = f.id_funcionario
JOIN avaliacao av ON av.id_agendamento = isv.id_agendamento
GROUP BY f.id_funcionario, f.nome
HAVING COUNT(DISTINCT av.id_avaliacao) >= 5
ORDER BY nota_media DESC;
