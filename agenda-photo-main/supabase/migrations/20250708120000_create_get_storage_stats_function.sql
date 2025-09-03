-- supabase/migrations/20250708120000_create_get_storage_stats_function.sql

-- Cria a função RPC `get_storage_stats` que é usada pela aplicação
-- para buscar o total de armazenamento utilizado pelo usuário autenticado.
-- Esta função é essencial para a barra de progresso de armazenamento no dashboard.

CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS bigint -- Retorna o total de bytes como um inteiro grande
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com os privilégios do criador da função, necessário para ler a tabela `storage.objects`
AS $$
DECLARE
  total_size bigint;
BEGIN
  -- Soma o tamanho de todos os objetos que pertencem ao usuário autenticado.
  -- O `auth.uid()` obtém o ID do usuário da sessão atual.
  -- O tamanho de cada objeto é extraído do campo `metadata`.
  SELECT
    SUM((metadata->>'size')::bigint) INTO total_size
  FROM
    storage.objects
  WHERE
    owner = auth.uid();

  -- Se o usuário não tiver nenhum objeto, a soma será NULL.
  -- `COALESCE` garante que retornemos 0 nesse caso.
  RETURN COALESCE(total_size, 0);
END;
$$;

-- Concede permissão de execução da função para o role `authenticated`,
-- que representa qualquer usuário logado.
GRANT EXECUTE ON FUNCTION get_storage_stats() TO authenticated;

-- Adiciona um comentário na função para documentação no banco de dados.
COMMENT ON FUNCTION get_storage_stats() IS 'Calcula o uso total de armazenamento em bytes para o usuário autenticado.'; 