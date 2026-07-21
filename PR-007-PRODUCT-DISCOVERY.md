# PR-007 — Product Discovery

## Objetivo

Criar continuidade de navegação na página de produto e tornar os cards públicos resilientes a falhas de imagem.

## Implementação

- seção de produtos relacionados ao final da página de produto;
- prioridade para itens da mesma categoria;
- preenchimento complementar com produtos da mesma marca;
- remoção do produto atual e de duplicidades;
- limite de quatro recomendações;
- ordenação por destaque e recência;
- link contextual para a categoria do produto;
- uso do componente `ResilientImage` em todos os cards públicos.

## Banco de dados

Nenhuma migration necessária. A implementação usa `category_id`, `brand_id`, `is_featured` e `created_at` já existentes.

## Critérios de aceite

- o produto atual nunca aparece entre os relacionados;
- a seção não é renderizada quando não há recomendações;
- imagens inválidas não quebram o layout dos cards;
- lint, typecheck e build passam sem erros.
