-- Adiciona constraint única para evitar duplicação de transações
ALTER TABLE financeiro_transacoes
ADD CONSTRAINT unique_evento_transacao 
UNIQUE (evento_id, tipo, valor, user_id);

-- Adiciona índice para melhorar performance das consultas
CREATE INDEX idx_financeiro_transacoes_evento 
ON financeiro_transacoes(evento_id, user_id, tipo, valor);

-- Adiciona coluna para rastreamento de sincronização
ALTER TABLE financeiro_transacoes
ADD COLUMN sync_id uuid,
ADD COLUMN sync_timestamp timestamptz DEFAULT CURRENT_TIMESTAMP; 