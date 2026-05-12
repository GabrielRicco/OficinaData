-- SQLite version of OficinaData schema and seed data
-- This file is adapted from a PostgreSQL script to run on SQLite.
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS avaliacao;
DROP TABLE IF EXISTS pagamento;
DROP TABLE IF EXISTS item_peca;
DROP TABLE IF EXISTS item_servico;
DROP TABLE IF EXISTS agendamento;
DROP TABLE IF EXISTS peca;
DROP TABLE IF EXISTS tipo_servico;
DROP TABLE IF EXISTS funcionario;
DROP TABLE IF EXISTS veiculo;
DROP TABLE IF EXISTS cliente;

CREATE TABLE cliente (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE CHECK(email LIKE '%_@_%._%'),
    telefone TEXT CHECK(length(telefone) BETWEEN 10 AND 11 AND telefone GLOB '[0-9]*'),
    cpf TEXT UNIQUE CHECK(cpf GLOB '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
    cnpj TEXT UNIQUE CHECK(cnpj GLOB '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
    data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tipo_cliente CHECK (
        (cpf IS NOT NULL AND cnpj IS NULL)
        OR
        (cpf IS NULL AND cnpj IS NOT NULL)
    )
);

CREATE TABLE veiculo (
    id_veiculo INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL REFERENCES cliente(id_cliente) ON DELETE CASCADE,
    placa TEXT NOT NULL UNIQUE CHECK(placa GLOB '[A-Z][A-Z][A-Z][0-9][A-Z0-9][0-9][0-9]'),
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano INTEGER CHECK(ano >= 1900),
    data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE funcionario (
    id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cargo TEXT NOT NULL,
    salario NUMERIC NOT NULL CHECK (salario > 0),
    data_admissao TEXT NOT NULL
);

CREATE TABLE tipo_servico (
    id_tipo_servico INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    preco_base NUMERIC NOT NULL
);

CREATE TABLE peca (
    id_peca INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco_unitario NUMERIC NOT NULL,
    quantidade_estoque INTEGER NOT NULL CHECK (quantidade_estoque >= 0),
    quantidade_minima INTEGER NOT NULL CHECK (quantidade_minima >= 0)
);

CREATE TABLE agendamento (
    id_agendamento INTEGER PRIMARY KEY AUTOINCREMENT,
    id_veiculo INTEGER NOT NULL REFERENCES veiculo(id_veiculo),
    data_abertura TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TEXT,
    status TEXT NOT NULL CHECK (status IN ('Aberto', 'Em andamento', 'Concluido')),
    km_entrada INTEGER NOT NULL CHECK (km_entrada >= 0),
    km_saida INTEGER,
    total_servicos NUMERIC DEFAULT 0,
    total_pecas NUMERIC DEFAULT 0,
    total_geral NUMERIC DEFAULT 0,
    CONSTRAINT chk_datas CHECK (
        data_conclusao IS NULL OR data_conclusao >= data_abertura
    ),
    CONSTRAINT chk_km CHECK (
        km_saida IS NULL OR km_saida >= km_entrada
    )
);

CREATE TABLE item_servico (
    id_item_servico INTEGER PRIMARY KEY AUTOINCREMENT,
    id_agendamento INTEGER NOT NULL REFERENCES agendamento(id_agendamento) ON DELETE CASCADE,
    id_tipo_servico INTEGER NOT NULL REFERENCES tipo_servico(id_tipo_servico),
    id_funcionario INTEGER NOT NULL REFERENCES funcionario(id_funcionario),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC NOT NULL,
    desconto NUMERIC DEFAULT 0 CHECK (desconto >= 0 AND desconto <= 100),
    total NUMERIC NOT NULL CHECK (total >= 0)
);

CREATE TABLE item_peca (
    id_item_peca INTEGER PRIMARY KEY AUTOINCREMENT,
    id_agendamento INTEGER NOT NULL REFERENCES agendamento(id_agendamento) ON DELETE CASCADE,
    id_peca INTEGER NOT NULL REFERENCES peca(id_peca),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC NOT NULL,
    desconto NUMERIC DEFAULT 0 CHECK (desconto >= 0 AND desconto <= 100),
    total NUMERIC NOT NULL CHECK (total >= 0)
);

CREATE TABLE pagamento (
    id_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
    id_agendamento INTEGER NOT NULL REFERENCES agendamento(id_agendamento),
    forma_pagamento TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    parcelas INTEGER DEFAULT 1 CHECK (parcelas > 0),
    data_pagamento TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE avaliacao (
    id_avaliacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_agendamento INTEGER NOT NULL UNIQUE REFERENCES agendamento(id_agendamento),
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao TEXT DEFAULT CURRENT_TIMESTAMP
);

-- CTE para gerar sequências numéricas em SQLite
WITH digits AS (
    SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
    SELECT 8 UNION ALL SELECT 9
),
numbers AS (
    SELECT (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) + 1 AS i
    FROM digits a, digits b, digits c, digits d
    WHERE (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) < 3500
)
INSERT INTO cliente (nome, email, telefone, cpf, cnpj)
SELECT
    'Cliente PF ' || i,
    'pf' || i || '@email.com',
    printf('%011d', 84900000000 + i),
    printf('%011d', i),
    NULL
FROM numbers
WHERE i <= 150;

WITH digits AS (
    SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
    SELECT 8 UNION ALL SELECT 9
),
numbers AS (
    SELECT (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) + 1 AS i
    FROM digits a, digits b, digits c, digits d
    WHERE (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) < 3500
)
INSERT INTO cliente (nome, email, telefone, cpf, cnpj)
SELECT
    'Empresa ' || i,
    'pj' || i || '@empresa.com',
    printf('%011d', 84800000000 + i),
    NULL,
    printf('%014d', i)
FROM numbers
WHERE i <= 50;

WITH digits AS (
    SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
    SELECT 8 UNION ALL SELECT 9
),
numbers AS (
    SELECT (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) + 1 AS i
    FROM digits a, digits b, digits c, digits d
    WHERE (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) < 3500
)
INSERT INTO veiculo (id_cliente, placa, marca, modelo, ano)
SELECT
    1 + ((i - 1) % 200),
    substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', ((i-1)/26/26) % 26 + 1, 1) ||
    substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', ((i-1)/26) % 26 + 1, 1) ||
    substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', ((i-1) % 26) + 1, 1) ||
    ((i % 10)) ||
    substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', (i % 26) + 1, 1) ||
    printf('%02d', ((i % 99) + 1)),
    CASE ((i-1) % 10)
        WHEN 0 THEN 'Toyota' WHEN 1 THEN 'Honda' WHEN 2 THEN 'Ford' WHEN 3 THEN 'Chevrolet'
        WHEN 4 THEN 'Volkswagen' WHEN 5 THEN 'Fiat' WHEN 6 THEN 'Hyundai' WHEN 7 THEN 'Renault'
        WHEN 8 THEN 'Nissan' ELSE 'Jeep' END,
    CASE ((i-1) % 10)
        WHEN 0 THEN 'Corolla' WHEN 1 THEN 'Civic' WHEN 2 THEN 'Ka' WHEN 3 THEN 'Onix'
        WHEN 4 THEN 'Gol' WHEN 5 THEN 'Uno' WHEN 6 THEN 'HB20' WHEN 7 THEN 'Sandero'
        WHEN 8 THEN 'Kicks' ELSE 'Compass' END,
    2010 + (i % 14)
FROM numbers
WHERE i <= 500;

INSERT INTO funcionario (nome, cargo, salario, data_admissao)
WITH digits AS (
    SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
    SELECT 8 UNION ALL SELECT 9
),
numbers AS (
    SELECT (a.d * 10 + b.d) + 1 AS i
    FROM digits a, digits b
    WHERE (a.d * 10 + b.d) < 50
)
SELECT
    'Funcionario ' || i,
    CASE (i % 10)
        WHEN 0 THEN 'Mecânico' WHEN 1 THEN 'Eletricista' WHEN 2 THEN 'Atendente' WHEN 3 THEN 'Gestor'
        WHEN 4 THEN 'Pintor' WHEN 5 THEN 'Funileiro' WHEN 6 THEN 'Alinhador' WHEN 7 THEN 'Balanceiro'
        WHEN 8 THEN 'Borracheiro' ELSE 'Auxiliar' END,
    CASE
        WHEN (i % 10) = 3 THEN 6500.00
        WHEN (i % 10) IN (1,2) THEN 4200.00
        ELSE 2800.00
    END,
    date('2018-01-01', printf('+%d days', ((i * 37) % 2000)))
FROM numbers;

INSERT INTO tipo_servico (descricao, preco_base)
VALUES
    ('Troca de óleo e filtro',          120.00),
    ('Revisão de freios',               250.00),
    ('Alinhamento e balanceamento',     180.00),
    ('Troca de correia dentada',        450.00),
    ('Revisão do sistema elétrico',     300.00),
    ('Manutenção do ar-condicionado',   350.00),
    ('Troca de pastilhas de freio',     200.00),
    ('Revisão geral',                   800.00),
    ('Troca de amortecedores',          600.00),
    ('Diagnóstico eletrônico',          150.00),
    ('Troca de bateria',                280.00),
    ('Polimento e cristalização',       400.00),
    ('Higienização interna',            180.00),
    ('Troca de pneus',                  320.00),
    ('Reparo de funilaria',             700.00),
    ('Pintura parcial',                1200.00),
    ('Troca de embreagem',              950.00),
    ('Revisão de suspensão',            500.00),
    ('Limpeza de bicos injetores',      220.00),
    ('Troca de velas de ignição',       160.00);

INSERT INTO peca (nome, preco_unitario, quantidade_estoque, quantidade_minima)
VALUES
    ('Filtro de óleo',           25.00,  45,  10),
    ('Óleo motor 5W30 (1L)',      22.00,  80,  20),
    ('Pastilha de freio dianteira',120.00, 30,  8),
    ('Pastilha de freio traseira', 95.00,  25,  8),
    ('Correia dentada',          180.00,   5,  4),
    ('Vela de ignição',           35.00,  60, 15),
    ('Filtro de ar',              45.00,  40, 10),
    ('Filtro de combustível',     55.00,  20,  8),
    ('Amortecedor dianteiro',    320.00,   3,  6),
    ('Amortecedor traseiro',     290.00,   2,  6),
    ('Disco de freio',           210.00,  10,  5),
    ('Bateria 60Ah',             420.00,   7,  4),
    ('Correia alternador',        65.00,  15,  6),
    ('Bomba d''água',            280.00,   4,  5),
    ('Termostato',                90.00,  12,  4),
    ('Sensor de oxigênio',       150.00,   8,  3),
    ('Rolamento roda dianteira', 180.00,   6,  4),
    ('Rolamento roda traseira',  175.00,   5,  4),
    ('Óleo de câmbio (1L)',       35.00,  30,  8),
    ('Fluido de freio DOT4',      28.00,  35,  8),
    ('Gás refrigerante R134a',    85.00,   9,  5),
    ('Embreagem kit completo',   650.00,   2,  3),
    ('Bobina de ignição',        220.00,  11,  4),
    ('Injetor de combustível',   380.00,   4,  4),
    ('Coxim do motor',           120.00,   7,  4),
    ('Bucha de bandeja',          45.00,  18,  6),
    ('Terminal de direção',       75.00,  14,  5),
    ('Barra estabilizadora',     190.00,   6,  4),
    ('Bomba de direção',         450.00,   3,  4),
    ('Radiador',                 580.00,   2,  3),
    ('Cabo de vela',              55.00,  20,  6),
    ('Módulo de injeção',        750.00,   2,  3),
    ('Calço de válvula',          15.00,  50, 10),
    ('Junta do cabeçote',        180.00,   4,  4),
    ('Parafuso cárter',            5.00, 100, 20),
    ('Abraçadeira mangueira',      8.00,  80, 20),
    ('Mangueira do radiador',     65.00,   3,  5),
    ('Polia tensora',            145.00,   5,  4),
    ('Válvula EGR',              320.00,   1,  3),
    ('Catalisador',              890.00,   1,  2);

WITH digits AS (
    SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
    SELECT 8 UNION ALL SELECT 9
),
numbers AS (
    SELECT (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) + 1 AS i
    FROM digits a, digits b, digits c, digits d
    WHERE (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) < 3500
)
INSERT INTO agendamento (id_veiculo, data_abertura, data_conclusao, status, km_entrada, km_saida, total_servicos, total_pecas, total_geral)
SELECT
    1 + ((i - 1) % 500),
    datetime('now', '-' || (i % 730) || ' days', '-' || (i % 24) || ' hours'),
    CASE
        WHEN i % 20 < 13 THEN datetime('now', '-' || (i % 730) || ' days', '-' || (i % 24) || ' hours', '+' || (1 + i % 8) || ' hours')
        ELSE NULL
    END,
    CASE
        WHEN i % 20 < 13 THEN 'Concluido'
        WHEN i % 20 < 16 THEN 'Em andamento'
        ELSE 'Aberto'
    END,
    20000 + (i * 37 % 180000),
    CASE
        WHEN i % 20 < 13 THEN 20000 + (i * 37 % 180000) + (50 + i % 500)
        ELSE NULL
    END,
    0.00,
    0.00,
    0.00
FROM numbers;

WITH digits AS (
    SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
    SELECT 8 UNION ALL SELECT 9
),
numbers AS (
    SELECT (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) + 1 AS i
    FROM digits a, digits b, digits c, digits d
    WHERE (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) < 3500
)
INSERT INTO item_servico (id_agendamento, id_tipo_servico, id_funcionario, quantidade, preco_unitario, desconto, total)
SELECT
    ag,
    1 + ((ag + rnd) % 20),
    1 + ((ag + rnd * 7) % 50),
    1,
    (SELECT preco_base FROM tipo_servico WHERE id_tipo_servico = 1 + ((ag + rnd) % 20)) + (rnd * 10.00),
    (ag % 4) * 5.0,
    ((SELECT preco_base FROM tipo_servico WHERE id_tipo_servico = 1 + ((ag + rnd) % 20)) + (rnd * 10.00)) * (1 - ((ag % 4) * 5.0) / 100.0)
FROM (
    SELECT i AS ag, 0 AS rnd FROM numbers
    UNION ALL
    SELECT i AS ag, 1 AS rnd FROM numbers
) base;

WITH digits AS (
    SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
    SELECT 8 UNION ALL SELECT 9
),
numbers AS (
    SELECT (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) + 1 AS i
    FROM digits a, digits b, digits c, digits d
    WHERE (a.d * 1000 + b.d * 100 + c.d * 10 + d.d) < 3500
)
INSERT INTO item_peca (id_agendamento, id_peca, quantidade, preco_unitario, desconto, total)
SELECT
    ag,
    1 + ((ag + rnd) % 40),
    1 + (ag % 3),
    (SELECT preco_unitario FROM peca WHERE id_peca = 1 + ((ag + rnd) % 40)) + (rnd * 5.00),
    (ag % 3) * 5.0,
    ((SELECT preco_unitario FROM peca WHERE id_peca = 1 + ((ag + rnd) % 40)) + (rnd * 5.00)) * (1 - ((ag % 3) * 5.0) / 100.0)
FROM (
    SELECT i AS ag, 0 AS rnd FROM numbers
    UNION ALL
    SELECT i AS ag, 1 AS rnd FROM numbers WHERE i <= 1500
) base;

UPDATE agendamento
SET total_servicos = COALESCE((
    SELECT SUM(total) FROM item_servico WHERE id_agendamento = agendamento.id_agendamento
), 0);

UPDATE agendamento
SET total_pecas = COALESCE((
    SELECT SUM(total) FROM item_peca WHERE id_agendamento = agendamento.id_agendamento
), 0);

UPDATE agendamento
SET total_geral = total_servicos + total_pecas;

INSERT INTO pagamento (id_agendamento, forma_pagamento, valor, parcelas, data_pagamento)
SELECT
    a.id_agendamento,
    CASE (a.id_agendamento % 5)
        WHEN 0 THEN 'Dinheiro' WHEN 1 THEN 'Cartão de Crédito' WHEN 2 THEN 'Cartão de Débito'
        WHEN 3 THEN 'PIX' ELSE 'Boleto' END,
    a.total_geral,
    CASE
        WHEN a.id_agendamento % 5 = 1 THEN 1 + (a.id_agendamento % 12)
        ELSE 1
    END,
    datetime(a.data_conclusao, '+' || (a.id_agendamento % 3) || ' hours')
FROM agendamento a
WHERE a.status = 'Concluido';

INSERT INTO pagamento (id_agendamento, forma_pagamento, valor, parcelas, data_pagamento)
SELECT
    a.id_agendamento,
    'Cartão de Crédito',
    ROUND(a.total_geral * 0.5, 2),
    3,
    datetime(a.data_conclusao, '+1 day')
FROM agendamento a
WHERE a.status = 'Concluido'
  AND a.id_agendamento % 20 IN (0,1,2,3,4,5);

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
    datetime(a.data_conclusao, '+' || (2 + a.id_agendamento % 48) || ' hours')
FROM agendamento a
WHERE a.status = 'Concluido';
