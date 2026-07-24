# PR-013 — Admin Form Reliability

## Objetivo

Eliminar estados parciais no salvamento de produtos e tornar os erros de carregamento e validação visíveis no painel administrativo.

## Implementação

- Nova RPC `save_product_with_affiliate_links` executada em uma única transação PostgreSQL.
- Inserção/atualização do produto e substituição dos links afiliados passam a ter commit ou rollback conjunto.
- RPC restrita a usuários autenticados que atendam a `is_admin()`.
- Validação no cliente e no banco para nome, slug, marketplace, URL e link principal único.
- Carregamento paralelo do produto e dos links afiliados com estado explícito de erro.
- Mensagens de erro com `role="alert"` e confirmação de sucesso em região anunciável.

## Migration obrigatória

Aplicar antes da publicação:

```text
supabase/migrations/20260710190000_add_transactional_product_save.sql
```

## Resultado operacional

Uma falha ao gravar qualquer link afiliado não apaga os links anteriores nem deixa o produto parcialmente atualizado.
