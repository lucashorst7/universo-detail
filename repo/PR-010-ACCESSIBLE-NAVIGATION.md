# PR-010 — Accessible Navigation

## Objetivo

Corrigir lacunas de navegação típicas de aplicações SPA e melhorar a experiência de teclado, leitores de tela e usuários com sensibilidade a movimento.

## Entregas

- link de salto para o conteúdo principal;
- região principal focalizável após mudanças de rota;
- retorno automático ao topo em novas páginas;
- preservação de navegação por fragmentos (`#anchor`);
- anúncio do título da nova página por região `aria-live`;
- fechamento do menu de categorias com `Escape`;
- fechamento do menu ao clicar fora;
- relações `aria-controls` e `aria-haspopup` nos controles de navegação;
- suporte a `prefers-reduced-motion` para reduzir animações e transições.

## Arquivos principais

- `src/components/RouteAccessibility.tsx`
- `src/components/Header.tsx`
- `src/App.tsx`
- `src/index.css`

## Banco de dados

Nenhuma migration necessária.

## Validação

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run check`
