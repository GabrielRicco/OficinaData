DROP SCHEMA IF EXISTS oficina CASCADE;

CREATE SCHEMA oficina;

SET search_path TO oficina;


-- CRIAÇÃO DE DOMÍNIOS
DROP DOMAIN IF EXISTS cpf_dom CASCADE;
CREATE DOMAIN cpf_dom AS VARCHAR(11)
CHECK (VALUE ~ '^[0-9]{11}$');

DROP DOMAIN IF EXISTS cnpj_dom CASCADE;
CREATE DOMAIN cnpj_dom AS VARCHAR(14)
CHECK (VALUE ~ '^[0-9]{14}$');

DROP DOMAIN IF EXISTS email_dom CASCADE;
CREATE DOMAIN email_dom AS TEXT
CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

DROP DOMAIN IF EXISTS telefone_dom CASCADE;
CREATE DOMAIN telefone_dom AS VARCHAR(11)
CHECK (VALUE ~ '^[0-9]{10,11}$');

DROP DOMAIN IF EXISTS placa_dom CASCADE;
CREATE DOMAIN placa_dom AS VARCHAR(7)
CHECK (VALUE ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$');

DROP DOMAIN IF EXISTS dinheiro_dom CASCADE;
CREATE DOMAIN dinheiro_dom AS NUMERIC(10,2)
CHECK (VALUE >= 0);


-- CRIAÇÃO DAS TABELAS
DROP TABLE IF EXISTS cliente CASCADE;

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,

    nome TEXT NOT NULL,

    email email_dom NOT NULL UNIQUE,

    telefone telefone_dom,

    cpf cpf_dom UNIQUE,
    cnpj cnpj_dom UNIQUE,

    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

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
    preco_base dinheiro_dom NOT NULL,
    tempo_estimado_min INT NOT NULL CHECK (tempo_estimado_min > 0)
);


DROP TABLE IF EXISTS peca CASCADE;

CREATE TABLE peca (
    id_peca SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    fornecedor TEXT NOT NULL,
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

    status TEXT NOT NULL CHECK (status IN ('Agendado', 'Em andamento', 'Concluído', 'Cancelado', 'No-show')),

    km_entrada INT NOT NULL CHECK (km_entrada >= 0),
    km_saida INT,

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


-- USUÁRIOS DO SISTEMA (autenticação JWT — separado das entidades de negócio)
DROP TABLE IF EXISTS usuario CASCADE;

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,

    nome TEXT NOT NULL,

    email email_dom NOT NULL UNIQUE,

    senha_hash TEXT NOT NULL,

    perfil TEXT NOT NULL CHECK (perfil IN ('Atendente', 'Gerente')),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    data_criacao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- FUNÇÕES E TRIGGERS
DROP FUNCTION IF EXISTS oficina.fn_recalcula_total_servicos() CASCADE;

CREATE OR REPLACE FUNCTION oficina.fn_recalcula_total_servicos()
RETURNS TRIGGER AS $$
BEGIN
    SET search_path TO oficina;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        UPDATE oficina.agendamento
        SET total_servicos = COALESCE((
            SELECT SUM(total)
            FROM oficina.item_servico
            WHERE id_agendamento = NEW.id_agendamento
        ), 0)
        WHERE id_agendamento = NEW.id_agendamento;
    END IF;

    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        IF TG_OP = 'DELETE' OR NEW.id_agendamento <> OLD.id_agendamento THEN
            UPDATE oficina.agendamento
            SET total_servicos = COALESCE((
                SELECT SUM(total)
                FROM oficina.item_servico
                WHERE id_agendamento = OLD.id_agendamento
            ), 0)
            WHERE id_agendamento = OLD.id_agendamento;
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_item_servico_aiud_total ON oficina.item_servico;

CREATE TRIGGER trg_item_servico_aiud_total
AFTER INSERT OR UPDATE OR DELETE ON oficina.item_servico
FOR EACH ROW
EXECUTE FUNCTION oficina.fn_recalcula_total_servicos();


DROP FUNCTION IF EXISTS oficina.fn_recalcula_total_pecas() CASCADE;

CREATE OR REPLACE FUNCTION oficina.fn_recalcula_total_pecas()
RETURNS TRIGGER AS $$
BEGIN
    SET search_path TO oficina;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        UPDATE oficina.agendamento
        SET total_pecas = COALESCE((
            SELECT SUM(total)
            FROM oficina.item_peca
            WHERE id_agendamento = NEW.id_agendamento
        ), 0)
        WHERE id_agendamento = NEW.id_agendamento;
    END IF;

    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        IF TG_OP = 'DELETE' OR NEW.id_agendamento <> OLD.id_agendamento THEN
            UPDATE oficina.agendamento
            SET total_pecas = COALESCE((
                SELECT SUM(total)
                FROM oficina.item_peca
                WHERE id_agendamento = OLD.id_agendamento
            ), 0)
            WHERE id_agendamento = OLD.id_agendamento;
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_item_peca_aiud_total ON oficina.item_peca;

CREATE TRIGGER trg_item_peca_aiud_total
AFTER INSERT OR UPDATE OR DELETE ON oficina.item_peca
FOR EACH ROW
EXECUTE FUNCTION oficina.fn_recalcula_total_pecas();


DROP FUNCTION IF EXISTS oficina.fn_valida_pagamento_status() CASCADE;

CREATE OR REPLACE FUNCTION oficina.fn_valida_pagamento_status()
RETURNS TRIGGER AS $$
DECLARE
    v_status TEXT;
BEGIN
    SET search_path TO oficina;

    SELECT status INTO v_status
    FROM oficina.agendamento
    WHERE id_agendamento = NEW.id_agendamento;

    IF v_status IS DISTINCT FROM 'Concluído' THEN
        RAISE EXCEPTION 'Pagamento só é permitido para agendamentos com status Concluído (status atual: %)', v_status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pagamento_biu_status ON oficina.pagamento;

CREATE TRIGGER trg_pagamento_biu_status
BEFORE INSERT OR UPDATE ON oficina.pagamento
FOR EACH ROW
EXECUTE FUNCTION oficina.fn_valida_pagamento_status();


DROP FUNCTION IF EXISTS oficina.fn_valida_avaliacao_status() CASCADE;

CREATE OR REPLACE FUNCTION oficina.fn_valida_avaliacao_status()
RETURNS TRIGGER AS $$
DECLARE
    v_status TEXT;
BEGIN
    SET search_path TO oficina;

    SELECT status INTO v_status
    FROM oficina.agendamento
    WHERE id_agendamento = NEW.id_agendamento;

    IF v_status IS DISTINCT FROM 'Concluído' THEN
        RAISE EXCEPTION 'Avaliação só é permitida para agendamentos com status Concluído (status atual: %)', v_status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_avaliacao_biu_status ON oficina.avaliacao;

CREATE TRIGGER trg_avaliacao_biu_status
BEFORE INSERT OR UPDATE ON oficina.avaliacao
FOR EACH ROW
EXECUTE FUNCTION oficina.fn_valida_avaliacao_status();
