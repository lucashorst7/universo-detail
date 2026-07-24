# PR-006 — Product Media Experience

## Objetivo

Ativar na página pública a galeria de imagens já prevista no modelo de produto, melhorando a avaliação visual do item sem alterar o domínio ou criar novas entidades.

## Alterações

- Exibição da imagem principal com prioridade de carregamento.
- Galeria deduplicada usando `image_url` e `gallery_images`.
- Miniaturas selecionáveis por mouse, toque e teclado.
- Estado ativo exposto com `aria-pressed`.
- Foco visível nas miniaturas.
- Carregamento tardio das miniaturas e decodificação assíncrona.
- Componente reutilizável `ResilientImage`.
- Fallback visual quando uma URL está vazia, expirada ou inválida.
- Reinicialização automática do fallback quando a origem da imagem muda.

## Critérios de aceite

- Produtos com apenas uma imagem mantêm a apresentação simples, sem miniaturas.
- Produtos com galeria permitem trocar a imagem principal.
- URLs duplicadas não geram miniaturas repetidas.
- Falhas de imagem não exibem o ícone quebrado do navegador.
- A navegação da galeria funciona por teclado.
- `npm run check` conclui sem erros.
