# PR-002 — Engineering Baseline

## Objetivo

Estabelecer uma baseline técnica reproduzível para o projeto e reduzir o custo do carregamento inicial por meio de code splitting por rota.

## Alterações

- ESLint 9 configurado e dependências declaradas no projeto.
- Scripts `lint`, `typecheck`, `build` e `check` adicionados.
- Todas as páginas públicas e administrativas convertidas para `React.lazy`.
- `Suspense` global de rotas com fallback acessível.
- Separação explícita dos vendors React, Supabase e Lucide no build do Vite.
- Build passa a executar typecheck antes do empacotamento.

## Critérios de aceite

- `npm ci` conclui sem dependências ausentes.
- `npm run lint` conclui sem erros.
- `npm run typecheck` conclui sem erros.
- `npm run build` conclui com sucesso.
- Rotas públicas e administrativas geram chunks independentes.
