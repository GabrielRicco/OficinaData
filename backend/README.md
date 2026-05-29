# OficinaData Backend

API REST em Spring Boot para o frontend React da OficinaData.

## Requisitos

- JDK 17+
- Maven 3.9+
- PostgreSQL 16+
- Scripts `db/02_ddl.sql`, `db/03_dados.sql` e `db/05_indices.sql` executados no banco `oficina_db`

## Configuração

Por padrão, a API conecta em:

```bash
jdbc:postgresql://localhost:5432/oficina_db?currentSchema=oficina
```

Variáveis suportadas:

```bash
DB_URL=jdbc:postgresql://localhost:5432/oficina_db?currentSchema=oficina
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=troque-por-um-segredo-grande
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Execução

```bash
mvn spring-boot:run
```

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

## Login local

Os dados de carga usam hashes placeholder. Enquanto os hashes reais não forem gerados, a API aceita a senha `123456`.

Usuários úteis:

- `gerente@oficina.local`
- `atendente1@oficina.local`
- `atendente@oficina.local` como alias de `atendente1@oficina.local`

## Endpoints principais

- `POST /api/auth/login`
- `POST /api/clientes`
- `GET /api/agendamentos?limite=20`
- `GET /api/dashboard`
