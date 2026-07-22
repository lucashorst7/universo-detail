# PR-003 — Application Resilience

## Objetivo

Impedir que falhas de infraestrutura sejam apresentadas como catálogo vazio e fornecer recuperação previsível para erros de rota, consulta e renderização.

## Alterações

- Error Boundary global para falhas inesperadas de renderização.
- Componente reutilizável `ErrorState` com ação de nova tentativa.
- Tratamento explícito de erros do Supabase nas páginas públicas.
- Retry local sem recarregar toda a aplicação.
- Rota curinga e página 404 integrada ao layout público.
- Preservação dos estados distintos de carregamento, vazio, não encontrado e erro.

## Páginas cobertas

- Home
- Busca
- Novidades
- Marcas
- Marca
- Categoria
- Produto
- Rotas inexistentes

## Critérios de aceite

- Erros de consulta não são exibidos como listas vazias.
- O usuário consegue repetir consultas que falharam.
- Erros inesperados de React exibem fallback seguro.
- URLs inexistentes retornam uma página 404 navegável.
- `npm run check` conclui sem erros.
