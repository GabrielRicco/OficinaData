-- Remove o schema se já existir (idempotência)
DROP SCHEMA IF EXISTS oficina CASCADE;

-- Cria o schema
CREATE SCHEMA oficina;

-- Define o schema como padrão da sessão
SET search_path TO oficina;


-- CRIAÇÃO DE DOMÍNIOS
-- CPF: 11 dígitos numéricos
CREATE DOMAIN cpf_dom AS VARCHAR(11)
CHECK (VALUE ~ '^[0-9]{11}$');

-- CNPJ: 14 dígitos numéricos
CREATE DOMAIN cnpj_dom AS VARCHAR(14)
CHECK (VALUE ~ '^[0-9]{14}$');

-- Email
CREATE DOMAIN email_dom AS TEXT
CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Telefone (formato flexível: só números, 10 a 11 dígitos)
CREATE DOMAIN telefone_dom AS VARCHAR(11)
CHECK (VALUE ~ '^[0-9]{10,11}$');

-- Placa Mercosul (ABC1D23) ou antiga (ABC1234)
CREATE DOMAIN placa_dom AS VARCHAR(7)
CHECK (VALUE ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$');

-- Valores monetários (nunca usar FLOAT)
CREATE DOMAIN dinheiro_dom AS NUMERIC(10,2)
CHECK (VALUE >= 0);


--CRIAÇÃO DAS TABELAS
DROP TABLE IF EXISTS cliente CASCADE;

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,

    nome TEXT NOT NULL,

    email email_dom NOT NULL UNIQUE,

    telefone telefone_dom,
   
    -- Pessoa Física ou Jurídica
    cpf cpf_dom UNIQUE,
    cnpj cnpj_dom UNIQUE,

    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Regra: PF tem CPF e não tem CNPJ | PJ tem CNPJ e não tem CPF
    CONSTRAINT chk_tipo_cliente CHECK (
        (cpf IS NOT NULL AND cnpj IS NULL)
        OR
        (cpf IS NULL AND cnpj IS NOT NULL)
    )
);

DROP TABLE IF EXISTS veiculo CASCADE;

CREATE TABLE veiculo (
    id_veiculo SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL REFERENCES cliente(id_cliente) ON DELETE CASCADE,

    placa placa_dom NOT NULL UNIQUE,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano INT CHECK (ano >= 1900),

    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS funcionario CASCADE;

CREATE TABLE funcionario (
    id_funcionario SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    cargo TEXT NOT NULL,

    salario dinheiro_dom NOT NULL CHECK (salario > 0),

    data_admissao DATE NOT NULL
);


DROP TABLE IF EXISTS tipo_servico CASCADE;

CREATE TABLE tipo_servico (
    id_tipo_servico SERIAL PRIMARY KEY,
    descricao TEXT NOT NULL,
    preco_base dinheiro_dom NOT NULL
);


DROP TABLE IF EXISTS peca CASCADE;

CREATE TABLE peca (
    id_peca SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    preco_unitario dinheiro_dom NOT NULL,

    quantidade_estoque INT NOT NULL CHECK (quantidade_estoque >= 0),
    quantidade_minima INT NOT NULL CHECK (quantidade_minima >= 0)
);

DROP TABLE IF EXISTS agendamento CASCADE;

CREATE TABLE agendamento (
    id_agendamento SERIAL PRIMARY KEY,

    id_veiculo INT NOT NULL REFERENCES veiculo(id_veiculo),

    data_abertura TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TIMESTAMPTZ,

    status TEXT NOT NULL CHECK (status IN ('Aberto', 'Em andamento', 'Concluido')),

    km_entrada INT NOT NULL CHECK (km_entrada >= 0),
    km_saida INT,

    -- totais (calculados depois via trigger)
    total_servicos dinheiro_dom DEFAULT 0,
    total_pecas dinheiro_dom DEFAULT 0,

    total_geral dinheiro_dom GENERATED ALWAYS AS (total_servicos + total_pecas) STORED,

    CONSTRAINT chk_datas CHECK (
        data_conclusao IS NULL OR data_conclusao >= data_abertura
    ),

    CONSTRAINT chk_km CHECK (
        km_saida IS NULL OR km_saida >= km_entrada
    )
);

DROP TABLE IF EXISTS item_servico CASCADE;

CREATE TABLE item_servico (
    id_item_servico SERIAL PRIMARY KEY,

    id_agendamento INT NOT NULL REFERENCES agendamento(id_agendamento) ON DELETE CASCADE,
    id_tipo_servico INT NOT NULL REFERENCES tipo_servico(id_tipo_servico),
    id_funcionario INT NOT NULL REFERENCES funcionario(id_funcionario),

    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario dinheiro_dom NOT NULL,
    desconto NUMERIC(5,2) DEFAULT 0 CHECK (desconto >= 0 AND desconto <= 100),

    total dinheiro_dom GENERATED ALWAYS AS (
        quantidade * preco_unitario * (1 - desconto / 100)
    ) STORED
);

DROP TABLE IF EXISTS item_peca CASCADE;

CREATE TABLE item_peca (
    id_item_peca SERIAL PRIMARY KEY,

    id_agendamento INT NOT NULL REFERENCES agendamento(id_agendamento) ON DELETE CASCADE,
    id_peca INT NOT NULL REFERENCES peca(id_peca),

    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario dinheiro_dom NOT NULL,
    desconto NUMERIC(5,2) DEFAULT 0 CHECK (desconto >= 0 AND desconto <= 100),

    total dinheiro_dom GENERATED ALWAYS AS (
        quantidade * preco_unitario * (1 - desconto / 100)
    ) STORED
);

DROP TABLE IF EXISTS pagamento CASCADE;

CREATE TABLE pagamento (
    id_pagamento SERIAL PRIMARY KEY,

    id_agendamento INT NOT NULL REFERENCES agendamento(id_agendamento),

    forma_pagamento TEXT NOT NULL,
    valor dinheiro_dom NOT NULL,
    parcelas INT DEFAULT 1 CHECK (parcelas > 0),

    data_pagamento TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS avaliacao CASCADE;

CREATE TABLE avaliacao (
    id_avaliacao SERIAL PRIMARY KEY,

    id_agendamento INT UNIQUE NOT NULL REFERENCES agendamento(id_agendamento),

    nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,

    data_avaliacao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);