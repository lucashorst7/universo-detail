# PR-017 — Affiliate Analytics Scalability

## Objetivo

Remover o carregamento integral de links e eventos de clique no navegador e tornar a operação de afiliados escalável, pesquisável e resiliente.

## Implementação

- Agregação dos cliques dos últimos 30 dias no PostgreSQL.
- Resumo administrativo com links totais, cliques recentes e links ativos.
- Listagem paginada com 20 registros por página.
- Busca server-side por nome do produto ou marketplace.
- Estado de busca e paginação persistido na URL.
- Data do último clique por link.
- Tratamento explícito de falhas e opção de nova tentativa.
- Índice composto em `affiliate_clicks(affiliate_link_id, clicked_at DESC)`.
- RPCs protegidas por `is_admin()` e disponíveis apenas para usuários autenticados.

## Migration

`supabase/migrations/20260710230000_add_affiliate_analytics_scalability.sql`

## RPCs

- `get_affiliate_analytics_summary()`
- `get_affiliate_link_count(text)`
- `get_affiliate_link_analytics(text, integer, integer)`

## Segurança

As funções usam `SECURITY DEFINER`, `search_path` fixo e recusam execução quando o usuário autenticado não é administrador.
