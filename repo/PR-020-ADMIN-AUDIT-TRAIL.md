# PR-020 — Admin Audit Trail

## Objetivo

Adicionar rastreabilidade às operações administrativas realizadas sobre produtos, marcas, categorias e links afiliados.

## Implementação

- tabela `admin_audit_logs`, protegida por RLS;
- captura automática por triggers PostgreSQL;
- registro de usuário, entidade, ação, campos alterados e data;
- snapshots JSON anteriores e atuais preservados no banco para investigação;
- consulta paginada por RPC restrita a administradores;
- busca por item, e-mail ou identificador;
- filtros por entidade e ação;
- nova página `/admin/historico`;
- nenhum dado de auditoria é exposto nas rotas públicas.

## Segurança

- usuários anônimos não possuem acesso;
- administradores têm apenas leitura direta na tabela;
- inserção ocorre exclusivamente pela função de trigger;
- RPC utiliza `SECURITY DEFINER`, `search_path` fixo e valida `is_admin()`.

## Migration

`supabase/migrations/20260711020000_add_admin_audit_trail.sql`
