# PR-008 — Search Relevance

## Objetivo

Tornar a busca pública mais útil, previsível e segura sem introduzir um serviço externo de indexação.

## Implementação

- normalização do termo de busca, com remoção de espaços duplicados e limite de 80 caracteres;
- sanitização dos caracteres que interferem na sintaxe PostgREST;
- busca em nome, descrição curta e descrição completa;
- limite de 48 resultados por consulta;
- ranqueamento local por correspondência exata, prefixo, ocorrência no nome, marca e descrição;
- desempate alfabético estável;
- mensagens de resultado e estado vazio mais informativas;
- preservação de `noindex` na rota de busca interna.

## Banco de dados

Nenhuma migration necessária. A PR usa os campos públicos existentes em `products`.

## Critérios de aceite

- termos vazios não disparam consulta;
- caracteres especiais não quebram o filtro PostgREST;
- correspondências exatas e por prefixo aparecem antes de ocorrências genéricas;
- a consulta nunca retorna mais de 48 registros;
- lint, typecheck e build passam sem erros.
