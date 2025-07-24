-- Função para iniciar uma transação
CREATE OR REPLACE FUNCTION iniciar_transacao()
RETURNS void AS $$
BEGIN
  -- Inicia uma nova transação
  BEGIN;
END;
$$ LANGUAGE plpgsql;

-- Função para commit de uma transação
CREATE OR REPLACE FUNCTION commit_transacao()
RETURNS void AS $$
BEGIN
  -- Commit da transação atual
  COMMIT;
END;
$$ LANGUAGE plpgsql;

-- Função para rollback de uma transação
CREATE OR REPLACE FUNCTION rollback_transacao()
RETURNS void AS $$
BEGIN
  -- Rollback da transação atual
  ROLLBACK;
END;
$$ LANGUAGE plpgsql;

-- Função para sincronização atômica de evento com financeiro
CREATE OR REPLACE FUNCTION sincronizar_evento_atomico(
  p_evento_id uuid,
  p_user_id uuid,
  p_valor_entrada decimal,
  p_valor_restante decimal
)
RETURNS TABLE (
  success boolean,
  mensagem text
) AS $$
DECLARE
  v_sync_id uuid;
  v_tem_entrada boolean;
  v_tem_restante boolean;
BEGIN
  -- Gerar ID de sincronização
  v_sync_id := gen_random_uuid();
  
  -- Verificar transações existentes
  SELECT 
    COUNT(*) > 0,
    COUNT(*) > 0 INTO v_tem_entrada, v_tem_restante
  FROM financeiro_transacoes
  WHERE evento_id = p_evento_id 
    AND user_id = p_user_id
    AND tipo = 'receita'
    AND (
      (valor = p_valor_entrada AND status = 'recebido') OR
      (valor = p_valor_restante AND status = 'pendente')
    );
  
  -- Iniciar transação
  BEGIN
    -- Criar transação de entrada se necessário
    IF p_valor_entrada > 0 AND NOT v_tem_entrada THEN
      INSERT INTO financeiro_transacoes (
        id, descricao, valor, tipo, status,
        data_transacao, categoria, user_id,
        evento_id, sync_id, criado_em, atualizado_em
      )
      VALUES (
        gen_random_uuid(),
        'Entrada - Evento',
        p_valor_entrada,
        'receita',
        'recebido',
        CURRENT_TIMESTAMP,
        'Entrada de Evento',
        p_user_id,
        p_evento_id,
        v_sync_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
    END IF;
    
    -- Criar transação de valor restante se necessário
    IF p_valor_restante > 0 AND NOT v_tem_restante THEN
      INSERT INTO financeiro_transacoes (
        id, descricao, valor, tipo, status,
        data_transacao, categoria, user_id,
        evento_id, sync_id, criado_em, atualizado_em
      )
      VALUES (
        gen_random_uuid(),
        'Restante - Evento',
        p_valor_restante,
        'receita',
        'pendente',
        CURRENT_TIMESTAMP,
        'Valor Restante',
        p_user_id,
        p_evento_id,
        v_sync_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
    END IF;
    
    RETURN QUERY SELECT true::boolean, 'Sincronização concluída com sucesso'::text;
  EXCEPTION
    WHEN OTHERS THEN
      -- Em caso de erro, fazer rollback
      ROLLBACK;
      RETURN QUERY SELECT false::boolean, 'Erro na sincronização: ' || SQLERRM::text;
  END;
END;
$$ LANGUAGE plpgsql; 