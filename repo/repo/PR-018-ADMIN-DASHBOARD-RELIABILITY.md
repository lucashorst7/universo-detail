# PR-018 — Admin Dashboard Reliability

## Objetivo

Consolidar as métricas administrativas em uma única operação de banco, eliminar falhas silenciosas e transformar o dashboard em uma superfície operacional orientada a pendências editoriais.

## Implementação

- RPC `get_admin_dashboard_snapshot()` protegida por `is_admin()`.
- Uma única chamada substitui as nove consultas independentes anteriores.
- Cliques passam a representar os últimos 30 dias, alinhados ao relatório de afiliados.
- Novos indicadores de publicações agendadas e conteúdo incompleto.
- Fila de atenção priorizando produtos em revisão e itens com dados essenciais ausentes.
- Tratamento explícito de erro e ação de nova tentativa.
- Atualização manual do snapshot sem recarregar a aplicação.
- Estado positivo quando não existem pendências editoriais.

## Critérios de conteúdo incompleto

Um produto ativo é considerado incompleto quando não possui um ou mais dos seguintes elementos:

- marca;
- categoria;
- descrição curta;
- descrição completa;
- imagem principal;
- link afiliado.

## Segurança

A RPC utiliza `SECURITY DEFINER`, `search_path` fixo e execução exclusiva para usuários autenticados que atendam a `public.is_admin()`.

## Migration

`supabase/migrations/20260711000000_add_admin_dashboard_reliability.sql`
