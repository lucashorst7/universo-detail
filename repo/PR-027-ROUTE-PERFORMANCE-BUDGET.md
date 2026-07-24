# PR-027 — Route Performance Budget

## Objetivo

Transformar a divisão de código já existente em um contrato de desempenho verificável. A aplicação já usa `React.lazy` nas rotas; esta PR impede que futuras alterações aumentem silenciosamente o carregamento inicial ou criem chunks excessivos.

## Implementação

- orçamento versionado em `performance-budget.json`;
- verificador reproduzível em `scripts/check-performance-budget.mjs`;
- medição por tamanho gzip, equivalente à transferência real com compressão;
- validação do bundle de entrada, CSS, vendors React/Supabase, maior chunk lazy e totais;
- falha explícita quando a estrutura esperada do build não é encontrada;
- integração ao `npm run check` e ao GitHub Actions.

## Orçamentos iniciais

| Métrica | Limite gzip |
| --- | ---: |
| JavaScript de entrada | 25 kB |
| CSS total | 12 kB |
| Vendor React | 65 kB |
| Vendor Supabase | 60 kB |
| Maior chunk lazy | 12 kB |
| JavaScript total | 175 kB |
| Assets JS + CSS | 190 kB |

Os valores partem do bundle validado nesta PR e mantêm margem controlada para evolução. Alterações nos limites exigem revisão explícita do arquivo versionado.

## Comandos

```bash
npm run build
npm run check:performance
npm run check
```

## Critérios de aceite

- o build de produção deve existir antes da análise;
- todos os limites devem passar;
- lint, tipagem, cobertura, auditoria, build e orçamento devem permanecer verdes.
