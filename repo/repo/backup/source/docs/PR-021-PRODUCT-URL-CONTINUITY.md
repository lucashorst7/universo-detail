# PR-021 — Product URL Continuity

## Objetivo

Preservar links antigos quando o slug de um produto for alterado, evitando 404 em favoritos, compartilhamentos, backlinks e resultados já indexados.

## Implementação

- Cria `product_slug_history` para armazenar slugs anteriores.
- Registra o slug antigo dentro da mesma transação usada para salvar o produto.
- Reserva slugs históricos para impedir que sejam reutilizados por outro produto.
- Expõe somente a RPC pública `resolve_public_product_slug(text)`; a tabela não é consultável diretamente por usuários públicos.
- Redireciona a rota pública antiga para `/produto/{slug-atual}` usando navegação `replace`.
- Mantém preview administrativo e sitemap apenas com o slug canônico atual.
- Remove automaticamente o histórico quando o produto é excluído (`ON DELETE CASCADE`).

## Segurança

A resolução pública retorna apenas produtos com status `published` e cuja data de publicação já foi liberada. Produtos em rascunho, revisão, arquivados ou agendados não podem ser descobertos pela função.

## Migration

`supabase/migrations/20260711030000_add_product_url_continuity.sql`

## Validação

```bash
npm run lint
npm run typecheck
npm run build
npm run check
```
