# PR-022 — Taxonomy URL Continuity

## Objetivo
Preservar links antigos de marcas e categorias após alterações de slug, sem expor diretamente as tabelas de histórico.

## Implementação
- Histórico dedicado para slugs de marcas e categorias.
- Triggers transacionais capturam o slug anterior antes da atualização.
- Slugs históricos ficam reservados e não podem ser reutilizados por outra taxonomia.
- RPCs públicas resolvem apenas o slug canônico atual.
- Páginas públicas redirecionam com `replace`, preservando paginação apenas na URL canônica futura.
- Exclusões removem automaticamente o histórico por `ON DELETE CASCADE`.

## Migration
`supabase/migrations/20260711040000_add_taxonomy_url_continuity.sql`

## Validação
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run check`
