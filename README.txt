================================================================================
TRABALHO PRÁTICO - BANCO DE DADOS II
Sistema de Agendamento de Manutenção Veicular (Oficina Mecânica)
Autor: [PREENCHER]
================================================================================


1. VERSÃO DO POSTGRESQL UTILIZADA
--------------------------------------------------------------------------------
PostgreSQL 17 (conforme exigido pela seção 2.3 do enunciado).
Recomenda-se a utilização da versão 17.x ou superior. Não há garantia de
compatibilidade com versões anteriores devido ao uso de recursos específicos
de domínios, triggers e tipos de dados desta versão.


2. ESTRUTURA DO PACOTE
--------------------------------------------------------------------------------
O pacote de entrega contém os seguintes arquivos:

  01_modelo_logico.png  - Diagrama Entidade-Relacionamento (DER) do sistema.
  02_ddl.sql            - Criação do schema, domínios, tabelas e triggers.
  03_dados.sql          - Script de população da base (aprox. 22.100 registros).
  04_consultas.sql      - Conjunto de 8 consultas analíticas exigidas.
  05_indices.sql        - Índices validados via EXPLAIN ANALYZE.
  06_relatorio.pdf      - Relatório de otimização e análise de desempenho.
  README.txt            - Este arquivo (instruções de execução).


3. PRÉ-REQUISITOS
--------------------------------------------------------------------------------
  - PostgreSQL 17 ou superior instalado e em execução.
  - Cliente de linha de comando psql (ou ferramenta equivalente como
    DBeaver, pgAdmin ou DataGrip).
  - Banco de dados de destino previamente criado.
  - Usuário com permissão de CREATE SCHEMA no banco de destino.

Exemplo de criação do banco antes da execução dos scripts:

    createdb -U postgres oficina_db


4. ORDEM DE EXECUÇÃO DOS SCRIPTS
--------------------------------------------------------------------------------
Os scripts devem ser executados na ordem numérica indicada pelo prefixo do
nome do arquivo. A partir de um terminal, com o serviço PostgreSQL ativo:

    psql -U postgres -d oficina_db -f 02_ddl.sql
    psql -U postgres -d oficina_db -f 03_dados.sql
    psql -U postgres -d oficina_db -f 04_consultas.sql
    psql -U postgres -d oficina_db -f 05_indices.sql

Alternativamente, a partir de uma sessão psql já aberta:

    \i 02_ddl.sql
    \i 03_dados.sql
    \i 04_consultas.sql
    \i 05_indices.sql

Descrição de cada etapa:

  02_ddl.sql       Cria a estrutura completa do banco: schema "oficina",
                   domínios, tabelas, restrições de integridade e triggers.
  03_dados.sql     Popula as tabelas com o volume exigido pelo enunciado.
  04_consultas.sql Executa as 8 consultas analíticas (saída em tela).
  05_indices.sql   Cria os índices definitivos. Deve ser executado APÓS
                   a coleta inicial dos planos via EXPLAIN ANALYZE, para
                   que seja possível comparar o desempenho antes e depois
                   da criação dos índices.


5. TEMPO APROXIMADO DE EXECUÇÃO DA CARGA
--------------------------------------------------------------------------------
Tempo aproximado em hardware comum (SSD, 16GB RAM): 30 a 60 segundos para o
script 03_dados.sql; demais scripts são instantâneos.

Volumes principais carregados pelo 03_dados.sql:
  - 3.500 agendamentos
  - 7.000 itens de serviço
  - 5.000 itens de peça
  - aprox. 3.000 pagamentos
  - aprox. 2.200 avaliações
  Total aproximado: 22.100 registros distribuídos entre as tabelas.

Aviso: após o primeiro carregamento, execute "ANALYZE;" antes de coletar
planos de execução, a fim de garantir que o otimizador disponha de
estatísticas atualizadas:

    psql -U postgres -d oficina_db -c "ANALYZE;"


6. NOTAS SOBRE A ENTREGA 4 (OTIMIZAÇÃO)
--------------------------------------------------------------------------------
Todos os índices propostos foram validados via EXPLAIN ANALYZE, comparando
o plano de execução antes e depois de sua criação. O arquivo 05_indices.sql
contém somente os índices que demonstraram redução mensurável no tempo de
execução das consultas analíticas. Índices testados e descartados (por não
apresentarem ganho efetivo ou por gerarem custo adicional de manutenção
superior ao benefício) estão devidamente documentados no arquivo
06_relatorio.pdf, juntamente com a justificativa técnica de cada decisão.


7. SCHEMA E ACESSO AOS OBJETOS
--------------------------------------------------------------------------------
Todos os objetos do banco são criados sob o schema "oficina". Para consultar
os objetos diretamente em uma sessão psql sem precisar qualificar o nome de
cada tabela, defina o search_path após a execução dos scripts:

    SET search_path TO oficina;

Para tornar a configuração persistente para o usuário corrente:

    ALTER ROLE postgres SET search_path TO oficina, public;


================================================================================
FIM DO README
================================================================================
