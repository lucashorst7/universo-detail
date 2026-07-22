# Backup Completo do Projeto - Papo Detailer

**Data do Backup:** 22 de Julho de 2026  
**Projeto:** Papo Detailer (Estética Automotiva)  
**Banco de Dados:** Supabase (PostgreSQL)

---

## Estrutura do Backup

```
backup/
├── README.md                          # Este arquivo
├── supabase/
│   ├── migrations/
│   │   └── migration_list.txt          # Lista de 59 migrations aplicadas
│   ├── schema/
│   │   ├── 01_schema.sql               # Criação de todas as tabelas + tipos enum
│   │   ├── 07_foreign_keys.sql         # Chaves estrangeiras e constraints unique
│   │   └── 08_check_constraints.sql    # Constraints check
│   ├── rls/
│   │   └── 02_rls_policies.sql         # 52 políticas RLS (Row Level Security)
│   ├── indexes/
│   │   └── 03_indexes.sql              # 54 índices
│   ├── functions/
│   │   └── 04_functions.sql            # 37 funções PL/pgSQL
│   ├── triggers/
│   │   └── 05_triggers.sql             # 11 triggers
│   ├── data/
│   │   └── 06_data.sql                 # INSERT de todos os dados
│   └── auth/
│       └── 00_auth_users.sql           # Usuários de autenticação (auth.users)
```

---

## Resumo dos Dados

| Tabela                  | Registros |
|-------------------------|-----------|
| categories              | 8         |
| brands                  | 29        |
| products                | 105       |
| product_categories      | 105       |
| collections             | 3         |
| collection_items        | 11        |
| guides                  | 2         |
| guide_products          | 3         |
| spotlight               | 1         |
| customer_reviews        | 1         |
| admin_users             | 1         |
| user_profiles           | 1         |
| admin_audit_logs        | 14        |
| category_slug_history   | 7         |
| search_documents        | 105       |
| affiliate_links         | 0         |
| affiliate_clicks       | 0         |
| product_slug_history    | 0         |
| brand_slug_history      | 0         |
| runtime_error_logs      | 0         |
| search_insights         | 0         |
| banned_users            | 0         |
| **auth.users**          | 1         |
| **Total de registros**  | **392**   |

---

## Como Restaurar o Backup

### Ordem de Execução (CRÍTICA)

Os arquivos SQL devem ser executados **nesta ordem exata** para evitar erros de dependência:

1. **`auth/00_auth_users.sql`** — Insere usuários de autenticação primeiro
2. **`schema/01_schema.sql`** — Cria todas as tabelas e habilita RLS
3. **`rls/02_rls_policies.sql`** — Aplica todas as políticas de segurança
4. **`indexes/03_indexes.sql`** — Cria os índices
5. **`functions/04_functions.sql`** — Cria as funções PL/pgSQL
6. **`triggers/05_triggers.sql`** — Cria os triggers
7. **`data/06_data.sql`** — Insere todos os dados
8. **`schema/07_foreign_keys.sql`** — Adiciona chaves estrangeiras e constraints unique

### Restauração via Supabase MCP

Se estiver usando o ambiente Bolt com Supabase MCP:

1. Use `apply_migration` para executar os arquivos de schema, RLS, índices, funções, triggers e foreign keys (um por vez)
2. Use `execute_sql` para executar os arquivos de dados (INSERTs)
3. Para os usuários de autenticação, use `execute_sql` com o conteúdo de `00_auth_users.sql`

### Restauração via Supabase Dashboard

1. Acesse o SQL Editor do Supabase Dashboard
2. Execute cada arquivo SQL na ordem indicada acima
3. Cole o conteúdo de cada arquivo e clique em "Run"

### Restauração via psql

```bash
psql "sua_string_de_conexao" -f auth/00_auth_users.sql
psql "sua_string_de_conexao" -f schema/01_schema.sql
psql "sua_string_de_conexao" -f rls/02_rls_policies.sql
psql "sua_string_de_conexao" -f indexes/03_indexes.sql
psql "sua_string_de_conexao" -f functions/04_functions.sql
psql "sua_string_de_conexao" -f triggers/05_triggers.sql
psql "sua_string_de_conexao" -f data/06_data.sql
psql "sua_string_de_conexao" -f schema/07_foreign_keys.sql
```

---

## Notas Importantes

- **Tipo Enum:** O tipo `product_status` (valores: draft, review, published, archived) é criado no arquivo de schema
- **RLS:** Todas as 22 tabelas têm Row Level Security habilitada com 52 políticas no total
- **Funções SECURITY DEFINER:** Algumas funções usam `SECURITY DEFINER` com `SET search_path TO 'public', 'auth'` — isso é intencional para permitir operações administrativas
- **Usuário Admin:** O usuário `lucashorst@hotmail.com` (ID: `63bcd7bb-63e6-4b31-a338-cf06831572a1`) está incluído no backup com sua senha hash bcrypt
- **Triggers de Auditoria:** Os triggers `audit_*` registram todas as alterações em `admin_audit_logs` automaticamente
- **Search Documents:** A tabela `search_documents` é sincronizada via trigger quando produtos são inseridos/atualizados, mas os dados foram incluídos no backup para evitar reprocessamento
- **Migrations:** A lista completa de 59 migrations está em `migrations/migration_list.txt` para referência histórica

---

## Credenciais do Banco

As credenciais do Supabase (URL, anon key, service role key) estão no arquivo `.env` do projeto. Não inclua credenciais em arquivos de backup por segurança.
