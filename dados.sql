SET search_path TO oficina;

-- Desativa triggers durante a carga: ganhamos performance e podemos popular
-- os totais em batch via UPDATE final, sem disparar recálculo a cada linha.
SET session_replication_role = replica;

-- ============================================================
-- 1. CLIENTES
-- ============================================================
INSERT INTO cliente (nome, email, telefone, cpf, cnpj)
SELECT
    'Cliente PF ' || i,
    'pf' || i || '@email.com',
    LPAD((84900000000 + i)::TEXT, 11, '0'),
    LPAD(i::TEXT, 11, '0'),
    NULL
FROM generate_series(1, 150) AS i;

INSERT INTO cliente (nome, email, telefone, cpf, cnpj)
SELECT
    'Empresa ' || i,
    'pj' || i || '@empresa.com',
    LPAD((84800000000 + i)::TEXT, 11, '0'),
    NULL,
    LPAD(i::TEXT, 14, '0')
FROM generate_series(1, 50) AS i;

-- ============================================================
-- 2. VEÍCULOS
-- ============================================================
INSERT INTO veiculo (id_cliente, placa, marca, modelo, ano)
SELECT
    1 + ((i - 1) % 200),
    CHR(65 + ((i-1)/676) % 26) ||
    CHR(65 + ((i-1)/26)  % 26) ||
    CHR(65 + (i-1)       % 26) ||
    ((i % 10))::TEXT ||
    CHR(65 + (i % 26)) ||
    LPAD(((i % 99) + 1)::TEXT, 2, '0'),
    (ARRAY['Toyota','Honda','Ford','Chevrolet','Volkswagen','Fiat',
           'Hyundai','Renault','Nissan','Jeep'])[ 1 + ((i-1) % 10) ],
    (ARRAY['Corolla','Civic','Ka','Onix','Gol','Uno','HB20',
           'Sandero','Kicks','Compass'])[ 1 + ((i-1) % 10) ],
    2010 + (i % 14)
FROM generate_series(1, 500) AS i;

-- ============================================================
-- 3. FUNCIONÁRIOS
-- ============================================================
INSERT INTO funcionario (nome, cargo, salario, data_admissao)
SELECT
    'Funcionario ' || i,
    (ARRAY['Mecânico','Eletricista','Atendente','Gestor','Pintor',
           'Funileiro','Alinhador','Balanceiro','Borracheiro','Auxiliar'])
        [ 1 + ((i-1) % 10) ],
    CASE
        WHEN (i % 10) = 4 THEN 6500.00
        WHEN (i % 10) IN (1,2) THEN 4200.00
        ELSE 2800.00
    END,
    (DATE '2018-01-01' + ((i * 37) % 2000) * INTERVAL '1 day')::DATE
FROM generate_series(1, 50) AS i;

-- ============================================================
-- 4. TIPOS DE SERVIÇO
-- ============================================================
INSERT INTO tipo_servico (descricao, preco_base, tempo_estimado_min)
VALUES
    ('Troca de óleo e filtro',          120.00,  30),
    ('Revisão de freios',               250.00,  90),
    ('Alinhamento e balanceamento',     180.00,  60),
    ('Troca de correia dentada',        450.00, 180),
    ('Revisão do sistema elétrico',     300.00, 120),
    ('Manutenção do ar-condicionado',   350.00, 120),
    ('Troca de pastilhas de freio',     200.00,  60),
    ('Revisão geral',                   800.00, 240),
    ('Troca de amortecedores',          600.00, 180),
    ('Diagnóstico eletrônico',          150.00,  45),
    ('Troca de bateria',                280.00,  20),
    ('Polimento e cristalização',       400.00, 180),
    ('Higienização interna',            180.00,  90),
    ('Troca de pneus',                  320.00,  60),
    ('Reparo de funilaria',             700.00, 360),
    ('Pintura parcial',                1200.00, 480),
    ('Troca de embreagem',              950.00, 300),
    ('Revisão de suspensão',            500.00, 150),
    ('Limpeza de bicos injetores',      220.00,  75),
    ('Troca de velas de ignição',       160.00,  45);

-- ============================================================
-- 5. PEÇAS
-- ============================================================
INSERT INTO peca (nome, fornecedor, preco_unitario, quantidade_estoque, quantidade_minima)
VALUES
    ('Filtro de óleo',              'Bosch',           25.00,  45,  10),
    ('Óleo motor 5W30 (1L)',        'NGK',             22.00,  80,  20),
    ('Pastilha de freio dianteira', 'Cofap',          120.00,  30,   8),
    ('Pastilha de freio traseira',  'MAHLE',           95.00,  25,   8),
    ('Correia dentada',             'Magneti Marelli',180.00,   5,   4),
    ('Vela de ignição',             'Valeo',           35.00,  60,  15),
    ('Filtro de ar',                'Bosch',           45.00,  40,  10),
    ('Filtro de combustível',       'NGK',             55.00,  20,   8),
    ('Amortecedor dianteiro',       'Cofap',          320.00,   3,   6),
    ('Amortecedor traseiro',        'MAHLE',          290.00,   2,   6),
    ('Disco de freio',              'Magneti Marelli',210.00,  10,   5),
    ('Bateria 60Ah',                'Valeo',          420.00,   7,   4),
    ('Correia alternador',          'Bosch',           65.00,  15,   6),
    ('Bomba d''água',               'NGK',            280.00,   4,   5),
    ('Termostato',                  'Cofap',           90.00,  12,   4),
    ('Sensor de oxigênio',          'MAHLE',          150.00,   8,   3),
    ('Rolamento roda dianteira',    'Magneti Marelli',180.00,   6,   4),
    ('Rolamento roda traseira',     'Valeo',          175.00,   5,   4),
    ('Óleo de câmbio (1L)',         'Bosch',           35.00,  30,   8),
    ('Fluido de freio DOT4',        'NGK',             28.00,  35,   8),
    ('Gás refrigerante R134a',      'Cofap',           85.00,   9,   5),
    ('Embreagem kit completo',      'MAHLE',          650.00,   2,   3),
    ('Bobina de ignição',           'Magneti Marelli',220.00,  11,   4),
    ('Injetor de combustível',      'Valeo',          380.00,   4,   4),
    ('Coxim do motor',              'Bosch',          120.00,   7,   4),
    ('Bucha de bandeja',            'NGK',             45.00,  18,   6),
    ('Terminal de direção',         'Cofap',           75.00,  14,   5),
    ('Barra estabilizadora',        'MAHLE',          190.00,   6,   4),
    ('Bomba de direção',            'Magneti Marelli',450.00,   3,   4),
    ('Radiador',                    'Valeo',          580.00,   2,   3),
    ('Cabo de vela',                'Bosch',           55.00,  20,   6),
    ('Módulo de injeção',           'NGK',            750.00,   2,   3),
    ('Calço de válvula',            'Cofap',           15.00,  50,  10),
    ('Junta do cabeçote',           'MAHLE',          180.00,   4,   4),
    ('Parafuso cárter',             'Magneti Marelli',  5.00, 100,  20),
    ('Abraçadeira mangueira',       'Valeo',            8.00,  80,  20),
    ('Mangueira do radiador',       'Bosch',           65.00,   3,   5),
    ('Polia tensora',               'NGK',            145.00,   5,   4),
    ('Válvula EGR',                 'Cofap',          320.00,   1,   3),
    ('Catalisador',                 'MAHLE',          890.00,   1,   2);

-- ============================================================
-- 6. AGENDAMENTOS
--    Distribuição (i % 20):
--      0..13  -> 'Concluído'    (70% = 2450)
--      14,15  -> 'Em andamento' (10% = 350)
--      16,17  -> 'Agendado'     (10% = 350)
--      18     -> 'Cancelado'    (5%  = 175)
--      19     -> 'No-show'      (5%  = 175)
-- ============================================================
INSERT INTO agendamento (id_veiculo, data_abertura, data_conclusao, status,
                         km_entrada, km_saida, total_servicos, total_pecas)
SELECT
    1 + ((i - 1) % 500),
    NOW() - ((i % 730) || ' days')::INTERVAL - ((i % 24) || ' hours')::INTERVAL,
    CASE
        WHEN i % 20 < 14 THEN
            NOW() - ((i % 730) || ' days')::INTERVAL + ((1 + i % 8) || ' hours')::INTERVAL
        WHEN i % 20 = 18 THEN
            NOW() - ((i % 730) || ' days')::INTERVAL + INTERVAL '30 minutes'
        ELSE NULL
    END,
    CASE
        WHEN i % 20 < 14 THEN 'Concluído'
        WHEN i % 20 < 16 THEN 'Em andamento'
        WHEN i % 20 < 18 THEN 'Agendado'
        WHEN i % 20 = 18 THEN 'Cancelado'
        ELSE 'No-show'
    END,
    20000 + (i * 37 % 180000),
    CASE
        WHEN i % 20 < 14 THEN 20000 + (i * 37 % 180000) + (50 + i % 500)
        ELSE NULL
    END,
    0.00,
    0.00
FROM generate_series(1, 3500) AS i;

-- ============================================================
-- 7. ITENS DE SERVIÇO
-- ============================================================
INSERT INTO item_servico (id_agendamento, id_tipo_servico, id_funcionario,
                          quantidade, preco_unitario, desconto)
SELECT
    ag,
    1 + ((ag + rnd) % 20),
    1 + ((ag + rnd * 7) % 50),
    1,
    (SELECT preco_base FROM tipo_servico WHERE id_tipo_servico = 1 + ((ag + rnd) % 20))
        + (rnd * 10.00),
    (ag % 4) * 5.0
FROM (
    SELECT gs AS ag, 0 AS rnd FROM generate_series(1, 3500) gs
    UNION ALL
    SELECT gs AS ag, 1 AS rnd FROM generate_series(1, 3500) gs
) base;

-- ============================================================
-- 8. ITENS DE PEÇA
-- ============================================================
INSERT INTO item_peca (id_agendamento, id_peca, quantidade, preco_unitario, desconto)
SELECT
    ag,
    1 + ((ag + rnd) % 40),
    1 + (ag % 3),
    (SELECT preco_unitario FROM peca WHERE id_peca = 1 + ((ag + rnd) % 40))
        + (rnd * 5.00),
    (ag % 3) * 5.0
FROM (
    SELECT gs AS ag, 0 AS rnd FROM generate_series(1, 3500) gs
    UNION ALL
    SELECT gs AS ag, 1 AS rnd FROM generate_series(1, 1500) gs
) base;

-- ============================================================
-- 9. RECÁLCULO DE TOTAIS
--    Como a carga rodou com triggers desativados, precisamos popular
--    total_servicos e total_pecas manualmente antes de reativá-los.
-- ============================================================
UPDATE agendamento a
SET total_servicos = COALESCE((
    SELECT SUM(total) FROM item_servico WHERE id_agendamento = a.id_agendamento
), 0);

UPDATE agendamento a
SET total_pecas = COALESCE((
    SELECT SUM(total) FROM item_peca WHERE id_agendamento = a.id_agendamento
), 0);

-- ============================================================
-- 10. PAGAMENTOS
--     Apenas para status 'Concluído' (2450 agendamentos).
--     1 pagamento padrão para todos + 1 parcelado para ~23% deles.
-- ============================================================
INSERT INTO pagamento (id_agendamento, forma_pagamento, valor, parcelas, data_pagamento)
SELECT
    a.id_agendamento,
    (ARRAY['Dinheiro','Cartão de Crédito','Cartão de Débito','PIX','Boleto'])
        [ 1 + (a.id_agendamento % 5) ],
    a.total_geral,
    CASE
        WHEN a.id_agendamento % 5 = 1 THEN 1 + (a.id_agendamento % 12)
        ELSE 1
    END,
    a.data_conclusao + ((a.id_agendamento % 3) || ' hours')::INTERVAL
FROM agendamento a
WHERE a.status = 'Concluído';

INSERT INTO pagamento (id_agendamento, forma_pagamento, valor, parcelas, data_pagamento)
SELECT
    a.id_agendamento,
    'Cartão de Crédito',
    ROUND(a.total_geral * 0.5, 2),
    3,
    a.data_conclusao + INTERVAL '1 day'
FROM agendamento a
WHERE a.status = 'Concluído'
  AND a.id_agendamento % 100 < 23;

-- ============================================================
-- 11. AVALIAÇÕES
--     Uma por agendamento (UNIQUE), apenas para 'Concluído'.
--     2200 dos 2450 concluídos.
-- ============================================================
INSERT INTO avaliacao (id_agendamento, nota, comentario, data_avaliacao)
SELECT
    a.id_agendamento,
    1 + (a.id_agendamento % 5),
    CASE (a.id_agendamento % 5)
        WHEN 0 THEN 'Péssimo atendimento, não recomendo.'
        WHEN 1 THEN 'Abaixo do esperado, demorou muito.'
        WHEN 2 THEN 'Atendimento regular, poderia melhorar.'
        WHEN 3 THEN 'Bom serviço, voltarei outras vezes.'
        WHEN 4 THEN 'Excelente! Serviço rápido e de qualidade.'
    END,
    a.data_conclusao + ((2 + a.id_agendamento % 48) || ' hours')::INTERVAL
FROM agendamento a
WHERE a.status = 'Concluído'
ORDER BY a.id_agendamento
LIMIT 2200;

-- ============================================================
-- 12. USUÁRIOS DO SISTEMA
-- ============================================================
INSERT INTO usuario (nome, email, senha_hash, perfil) VALUES
    ('Administrador',     'admin@oficina.local',     '$2a$10$placeholderhashplaceholderhashplaceholderhashplaceholder1', 'Gerente'),
    ('Gerente Geral',     'gerente@oficina.local',   '$2a$10$placeholderhashplaceholderhashplaceholderhashplaceholder2', 'Gerente'),
    ('Atendente Manhã',   'atendente1@oficina.local','$2a$10$placeholderhashplaceholderhashplaceholderhashplaceholder3', 'Atendente'),
    ('Atendente Tarde',   'atendente2@oficina.local','$2a$10$placeholderhashplaceholderhashplaceholderhashplaceholder4', 'Atendente'),
    ('Atendente Noite',   'atendente3@oficina.local','$2a$10$placeholderhashplaceholderhashplaceholderhashplaceholder5', 'Atendente'),
    ('Recepção',          'recepcao@oficina.local',  '$2a$10$placeholderhashplaceholderhashplaceholderhashplaceholder6', 'Atendente');

-- ============================================================
-- Reativa triggers para uso normal do sistema
-- ============================================================
SET session_replication_role = DEFAULT;
