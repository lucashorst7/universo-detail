# PR-019 — Media Storage Hygiene

## Objetivo

Impedir o acúmulo de arquivos órfãos no bucket `product-images` quando imagens são substituídas, removidas da galeria ou quando um produto é excluído.

## Implementação

- Reconhecimento estrito de URLs públicas do bucket gerenciado.
- URLs externas nunca são enviadas para exclusão.
- Após um salvamento transacional bem-sucedido, imagens gerenciadas removidas do produto são apagadas do Storage.
- Uploads feitos durante a edição e descartados antes do salvamento também entram na limpeza pós-save.
- A exclusão de produto usa a RPC `delete_product_safely`, que bloqueia o registro, coleta suas URLs e exclui o produto em uma única transação.
- O cliente remove os objetos do Storage somente após a exclusão do banco ser confirmada.
- Falhas de limpeza não revertem alterações já persistidas; o painel informa claramente a pendência operacional.

## Segurança

A RPC exige `is_admin()`, usa `SECURITY DEFINER`, fixa o `search_path` e não concede execução a usuários anônimos.

## Migration

`supabase/migrations/20260711010000_add_media_storage_hygiene.sql`
