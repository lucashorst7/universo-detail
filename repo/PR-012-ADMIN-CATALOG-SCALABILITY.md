# PR-012 — Admin Catalog Scalability

## Objetivo

Tornar a gestão de produtos previsível em catálogos maiores, removendo o carregamento integral da tabela no navegador e adicionando feedback operacional para consultas e exclusões.

## Entregas

- paginação server-side da listagem administrativa de produtos;
- limite de 20 registros por página;
- contagem total via Supabase;
- busca por nome executada no banco com debounce;
- persistência de busca e página na URL;
- correção automática de páginas fora do intervalo após exclusões;
- tratamento visual de erros de consulta;
- tratamento explícito de falhas ao excluir links afiliados ou produtos;
- recarregamento consistente após exclusão;
- imagens resilientes nas miniaturas administrativas;
- tabela com rolagem horizontal em telas estreitas;
- rótulos e estados acessíveis para busca, paginação e ações.

## Impacto técnico

A quantidade de dados transferida para o painel passa a ser constante por página. A busca deixa de depender do volume total carregado no cliente e o operador recebe confirmação clara quando uma operação falha.

## Banco de dados

Nenhuma migration necessária.
