# PR-030 — Search Index & Content Indexing

## Objetivo

Desacoplar a busca pública da tabela `products` por meio de um índice dedicado, com ranking PostgreSQL, sugestões e governança administrativa.

## Entregas

- tabela `search_documents` com índice GIN em português e inglês;
- sincronização automática de produtos por trigger;
- atualização do índice ao alterar nomes de marcas e categorias;
- respeito ao workflow editorial e a `publish_at`;
- RPC pública `search_catalog` com full-text search, similaridade e pesos por título;
- RPC pública `suggest_catalog_search`;
- cache local de sugestões por 60 segundos;
- busca pública migrada para o índice;
- sugestões no cabeçalho desktop e mobile;
- painel `/admin/indice-busca`;
- RPC administrativa `get_search_index_stats`;
- reconstrução protegida por `rebuild_search_index`;
- registro da reconstrução na trilha de auditoria;
- testes para normalização, cache e integração das funções cliente.

## Segurança

A tabela não aceita escrita por clientes. Conteúdos agendados podem existir internamente para manter a publicação automática, mas a RLS e as RPCs públicas só os expõem após `publish_at`.

## Migration

`supabase/migrations/20260711080000_add_search_index.sql`

## Operação

Após aplicar a migration, a carga inicial é executada automaticamente. O administrador também pode reconstruir o índice pela nova tela.
