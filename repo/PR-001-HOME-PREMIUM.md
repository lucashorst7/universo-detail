# PR-001 — Home Premium

## Entregas

- Hero orientado à descoberta e decisão de compra
- Busca principal na Home
- Indicadores dinâmicos do Supabase
- Categorias, produtos e marcas com nova hierarquia visual
- ProductCard tipado e responsivo
- Header com estado de rolagem, menu mobile e busca
- Footer com transparência de afiliados
- Componentes `Container` e `SectionHeader`

## Correções de build incluídas

- Remoção de chave excedente em `ProductForm.tsx`
- Ajuste de tipos em consultas relacionais do Supabase
- Ajuste do tipo de ícones Lucide
- Tipagem da página pública de produto

## Validação

Executado com sucesso:

```bash
npm install
npm run build
```

O Vite emitiu apenas aviso de chunk principal acima de 500 kB. O code splitting fica para um PR específico de performance.
