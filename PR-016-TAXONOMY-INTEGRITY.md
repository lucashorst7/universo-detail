# PR-016 — Taxonomy Integrity

## Objetivo
Evitar marcas e categorias órfãs ou exclusões silenciosas no painel administrativo.

## Entregas
- Contagem agregada de produtos vinculados por marca e categoria.
- Exclusão bloqueada no cliente quando existem vínculos.
- RPCs protegidas que repetem a validação no PostgreSQL para evitar race conditions.
- Mensagens de erro e opção de nova tentativa.
- Tabelas administrativas responsivas e controles acessíveis.

## Migration
`supabase/migrations/20260710220000_add_taxonomy_integrity.sql`

## Segurança
Todas as funções validam `is_admin()`, usam `SECURITY DEFINER` com `search_path` vazio e não concedem execução a `anon`.
