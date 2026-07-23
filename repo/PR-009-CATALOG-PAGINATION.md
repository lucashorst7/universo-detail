# PR-009 — Catalog Pagination

## Objetivo

Evitar o carregamento integral das listagens públicas de produtos e manter a navegação escalável conforme o catálogo cresce.

## Implementação

- Paginação server-side via `range()` do Supabase.
- Tamanho fixo de 24 produtos por página.
- Contagem total com `count: 'exact'`.
- Estado da página persistido no parâmetro `?page=`.
- Componente reutilizável e acessível de paginação.
- Aplicação nas páginas de categoria, marca e novidades.
- URLs da primeira página permanecem canônicas, sem parâmetro redundante.

## Impacto

- Redução do volume de dados transferidos por navegação.
- Menor custo de renderização no cliente.
- URLs compartilháveis para páginas internas do catálogo.
- Base preparada para catálogos maiores.

## Banco de dados

Nenhuma migration necessária.
