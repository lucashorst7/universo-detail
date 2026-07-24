# PR-014 — Product Gallery Management

## Objetivo

Fechar a inconsistência entre a página pública, que já consome `gallery_images`, e o painel administrativo, que até esta PR não permitia editar nem persistir essa galeria.

## Entregas

- Editor de imagens adicionais no formulário de produto.
- Upload ou inclusão por URL usando o fluxo de storage já existente.
- Limite de oito imagens adicionais.
- Prevenção de URLs duplicadas.
- Reordenação acessível das imagens.
- Remoção individual e preview resiliente.
- Carregamento de galerias existentes durante a edição.
- Persistência de `gallery_images` pela RPC transacional.
- Validação do formato e do limite também no PostgreSQL.

## Banco de dados

Aplicar a migration:

`supabase/migrations/20260710200000_add_transactional_gallery_save.sql`

A migration substitui a função `save_product_with_affiliate_links` preservando sua assinatura e adicionando a gravação transacional da galeria.

## Critérios de validação

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run check`
