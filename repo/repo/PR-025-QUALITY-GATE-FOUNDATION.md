# PR-025 — Quality Gate Foundation

## Objetivo

Adicionar uma base automatizada de prevenção de regressões para as regras críticas do portal e executar a mesma validação em cada pull request e atualização das branches principais.

## Entregas

- Vitest configurado para testes unitários em ambiente Node.js.
- Cobertura V8 com limites mínimos globais para os módulos críticos testados.
- Testes para paginação, geração de slugs, relevância da busca e identificação de mídia gerenciada.
- Workflow GitHub Actions com instalação determinística via `npm ci`.
- Pipeline executando lint, tipagem, cobertura e build de produção.
- Comando `npm run check` convertido em quality gate completo.

## Comandos

```bash
npm test
npm run test:watch
npm run test:coverage
npm run check
```

## Critérios de cobertura

- Linhas: 90%
- Funções: 90%
- Branches: 85%
- Statements: 90%

## Observações

O workflow não depende de segredos de produção. Durante o build sem credenciais válidas do Supabase, o gerador de crawler utiliza o fallback estático já existente.
