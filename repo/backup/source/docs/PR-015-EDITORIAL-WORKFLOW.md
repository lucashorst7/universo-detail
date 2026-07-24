# PR-015 — Editorial Workflow

## Objetivo
Introduzir governança editorial para produtos sem alterar a arquitetura da aplicação.

## Entregas
- Status: `draft`, `review`, `published` e `archived`.
- Agendamento por `publish_at` e registro de `published_at`.
- RLS pública restrita a produtos publicados e já liberados.
- Preview autenticado em `/preview/produto/:slug`, sempre `noindex, nofollow`.
- Filtro e alteração rápida de status no catálogo administrativo.
- Indicadores editoriais no dashboard.
- Persistência transacional dos campos editoriais pela RPC existente.

## Migration
Aplicar `supabase/migrations/20260710210000_add_editorial_workflow.sql`.

Produtos existentes são migrados como publicados para evitar regressão. Novos produtos passam a iniciar como rascunho.
