# Trabalho Prático - Banco de Dados II

Sistema de Agendamento de Manutenção Veicular (Oficina Mecânica).

Projeto desenvolvido conforme o enunciado v4 da disciplina. No momento, o repositório está focado nas **Entregas 1 a 5 (Banco de Dados)**. As pastas `backend/` e `frontend/` serão preenchidas na **Entrega 6** (aplicação MVC REST com autenticação JWT).

---

## Equipe

| Integrante | Matrícula |
|---|---|
| [Gabriel Ricco] | [2024B010874] |
| [Caroline] | [2024b010635] | 
| [Paulo Roberto] | [2024b010858] |

---

## Sumário

1. [Versão do PostgreSQL](#1-versão-do-postgresql)
2. [Estrutura do repositório](#2-estrutura-do-repositório)
3. [Stack](#3-stack)
4. [Autenticação e perfis de usuário](#4-autenticação-e-perfis-de-usuário)
5. [Pré-requisitos](#5-pré-requisitos)
6. [Ordem de execução dos scripts SQL](#6-ordem-de-execução-dos-scripts-sql)
7. [Tempo aproximado de execução da carga](#7-tempo-aproximado-de-execução-da-carga)
8. [Notas sobre EXPLAIN ANALYZE e otimização](#8-notas-sobre-explain-analyze-e-otimização)
9. [Schema e search_path](#9-schema-e-search_path)
10. [Execução da aplicação (Entrega 6)](#10-execução-da-aplicação-entrega-6)

---

## 1. Versão do PostgreSQL

Este projeto utiliza **PostgreSQL 16 ou superior**, conforme exigido pelo enunciado v4.

Recomenda-se a versão 16.x ou mais recente. Não há garantia de compatibilidade com versões anteriores devido ao uso de recursos específicos de domínios, triggers e tipos de dados.

---

## 2. Estrutura do repositório

```
db/
  01_modelo_logico.png   - Diagrama Entidade-Relacionamento (DER)
  02_ddl.sql             - Schema, domínios, tabelas e triggers (inclui tabela usuario para JWT)
  03_dados.sql           - Script de carga (~22.100 registros)
  04_consultas.sql       - 8 consultas analíticas
  05_indices.sql         - Índices validados via EXPLAIN ANALYZE
  explain_queries.sql    - Utilitário para coleta de planos de execução
backend/                 - Aplicação Spring Boot / FastAPI (Entrega 6, em desenvolvimento)
frontend/                - Aplicação React / Vue / Angular (Entrega 6, em desenvolvimento)
docs/
  06_relatorio.pdf       - Relatório do ciclo EXPLAIN ANALYZE
README.md                - Este arquivo
```

---

## 3. Stack

- **Banco de dados**: PostgreSQL 16+
- **Backend**: [Spring Boot (Java) / FastAPI (Python) / Django REST (Python) — a decidir]
- **Frontend**: [React / Vue / Angular / Svelte — a decidir]
- **Autenticação**: JWT
- **Documentação da API**: OpenAPI / Swagger UI

---

## 4. Autenticação e perfis de usuário

O DDL (`db/02_ddl.sql`) já inclui a tabela `usuario`, que dará suporte à autenticação JWT da aplicação a ser construída na Entrega 6. A tabela contempla dois perfis de acesso:

- **Atendente**: opera o fluxo de agendamentos, peças e serviços.
- **Gerente**: além das operações de atendente, tem acesso a relatórios analíticos e gestão de usuários.

A geração e validação dos tokens JWT, bem como o controle de papéis (roles), serão implementados no backend da Entrega 6.

---

## 5. Pré-requisitos

- PostgreSQL 16 ou superior instalado e em execução.
- Cliente de linha de comando `psql` (ou ferramenta equivalente como DBeaver, pgAdmin ou DataGrip).
- Banco de dados de destino previamente criado.
- Usuário com permissão de `CREATE SCHEMA` no banco de destino.

Exemplo de criação do banco antes da execução dos scripts:

```bash
createdb -U postgres oficina_db
```

---

## 6. Ordem de execução dos scripts SQL

Os scripts devem ser executados na ordem numérica indicada pelo prefixo do nome do arquivo. A partir de um terminal, com o serviço PostgreSQL ativo:

```bash
psql -U postgres -d oficina_db -f db/02_ddl.sql
psql -U postgres -d oficina_db -f db/03_dados.sql
psql -U postgres -d oficina_db -f db/04_consultas.sql
psql -U postgres -d oficina_db -f db/05_indices.sql
```

Alternativamente, a partir de uma sessão `psql` já aberta:

```sql
\i db/02_ddl.sql
\i db/03_dados.sql
\i db/04_consultas.sql
\i db/05_indices.sql
```

Descrição de cada etapa:

| Arquivo | Descrição |
|---|---|
| `db/02_ddl.sql` | Cria a estrutura completa do banco: schema `oficina`, domínios, tabelas, restrições de integridade, triggers e a tabela `usuario` para JWT. |
| `db/03_dados.sql` | Popula as tabelas com o volume exigido pelo enunciado. |
| `db/04_consultas.sql` | Executa as 8 consultas analíticas (saída em tela). |
| `db/05_indices.sql` | Cria os índices definitivos. Deve ser executado **após** a coleta inicial dos planos via `EXPLAIN ANALYZE`, para que seja possível comparar o desempenho antes e depois da criação dos índices. |

---

## 7. Tempo aproximado de execução da carga

Em hardware comum (SSD, 16 GB de RAM), o script `db/03_dados.sql` leva entre **30 e 60 segundos**. Os demais scripts são praticamente instantâneos.

Volumes principais carregados pelo `db/03_dados.sql`:

- 3.500 agendamentos
- 7.000 itens de serviço
- 5.000 itens de peça
- aprox. 3.000 pagamentos
- aprox. 2.200 avaliações

Total aproximado: **22.100 registros** distribuídos entre as tabelas.

**Aviso**: após o primeiro carregamento, execute `ANALYZE;` antes de coletar planos de execução, a fim de garantir que o otimizador disponha de estatísticas atualizadas:

```bash
psql -U postgres -d oficina_db -c "ANALYZE;"
```

---

## 8. Notas sobre EXPLAIN ANALYZE e otimização

Todos os índices propostos foram validados via `EXPLAIN ANALYZE`, comparando o plano de execução antes e depois de sua criação. O arquivo `db/05_indices.sql` contém somente os índices que demonstraram redução mensurável no tempo de execução das consultas analíticas.

Índices testados e **descartados** (por não apresentarem ganho efetivo ou por gerarem custo de manutenção superior ao benefício) estão documentados no arquivo `docs/06_relatorio.pdf`, juntamente com a justificativa técnica de cada decisão.

O utilitário `db/explain_queries.sql` pode ser usado para coletar planos de execução de forma sistemática durante o ciclo de otimização.

---

## 9. Schema e search_path

Todos os objetos do banco são criados sob o schema **`oficina`**. Para consultar os objetos diretamente em uma sessão `psql` sem precisar qualificar o nome de cada tabela, defina o `search_path` após a execução dos scripts:

```sql
SET search_path TO oficina;
```

Para tornar a configuração persistente para o usuário corrente:

```sql
ALTER ROLE postgres SET search_path TO oficina, public;
```

---

## 10. Execução da aplicação (Entrega 6)

Backend Spring Boot:

```bash
cd backend
mvn spring-boot:run
```

Frontend React:

```bash
cd frontend
npm install
npm run dev
```

O frontend usa `http://localhost:8080/api` por padrão. Para alterar:

```bash
VITE_API_URL=http://localhost:8080/api npm run dev
```

Enquanto os usuários do script de carga mantiverem hashes placeholder, a API aceita a senha `123456` para login local.
