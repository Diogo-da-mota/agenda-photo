-- =====================================================
-- MIGRAÇÃO: ACESSO PÚBLICO AOS CONTRATOS
-- Data: 2025-01-15
-- Objetivo: Permitir acesso público aos contratos via função SQL
-- =====================================================

-- 1. CRIAR FUNÇÃO PARA BUSCAR CONTRATO PÚBLICO
-- Esta função permite buscar contratos sem autenticação
CREATE OR REPLACE FUNCTION get_public_contract(contract_id text)
RETURNS TABLE (
  id_contrato text,
  user_id uuid,
  cliente_id uuid,
  titulo text,
  descricao text,
  status text,
  valor_total numeric,
  data_evento timestamp with time zone,
  tipo_evento text,
  conteudo text,
  email_cliente text,
  nome_cliente text,
  cpf_cliente text,
  endereco_cliente text,
  data_assinatura timestamp with time zone,
  data_expiracao timestamp with time zone,
  criado_em timestamp with time zone,
  cliente_nome text,
  cliente_email text,
  cliente_telefone text
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id_contrato,
    c.user_id,
    c.cliente_id,
    c.titulo,
    c.descricao,
    c.status,
    c.valor_total,
    c.data_evento,
    c.tipo_evento,
    c.conteudo,
    c.email_cliente,
    c.nome_cliente,
    c.cpf_cliente,
    c.endereco_cliente,
    c.data_assinatura,
    c.data_expiracao,
    c.criado_em,
    cl.nome as cliente_nome,
    cl.email as cliente_email,
    cl.telefone as cliente_telefone
  FROM contratos c
  LEFT JOIN clientes cl ON c.cliente_id = cl.id
  WHERE c.id_contrato = contract_id;
END;
$$;

-- 2. CONCEDER PERMISSÕES PARA EXECUÇÃO PÚBLICA
GRANT EXECUTE ON FUNCTION get_public_contract(text) TO anon;
GRANT EXECUTE ON FUNCTION get_public_contract(text) TO authenticated;

-- 3. COMENTÁRIO DA FUNÇÃO
COMMENT ON FUNCTION get_public_contract(text) IS 'Função para buscar contratos publicamente sem autenticação';

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se a função foi criada
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'get_public_contract';