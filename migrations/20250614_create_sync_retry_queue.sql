-- Criar tabela para fila de retry da sincronização automática
CREATE TABLE IF NOT EXISTS sync_retry_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tentativas INTEGER DEFAULT 0,
  ultimo_erro TEXT,
  proxima_tentativa TIMESTAMP WITH TIME ZONE NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para performance
  UNIQUE(evento_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sync_retry_queue_proxima_tentativa ON sync_retry_queue(proxima_tentativa);
CREATE INDEX IF NOT EXISTS idx_sync_retry_queue_user_id ON sync_retry_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_retry_queue_evento_id ON sync_retry_queue(evento_id);

-- RLS (Row Level Security)
ALTER TABLE sync_retry_queue ENABLE ROW LEVEL SECURITY;

-- Política para que usuários só vejam seus próprios registros de retry
CREATE POLICY "Usuários podem ver seus próprios registros de retry" ON sync_retry_queue
  FOR ALL USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE sync_retry_queue IS 'Fila de retry para sincronização automática entre agenda e financeiro';
COMMENT ON COLUMN sync_retry_queue.evento_id IS 'ID do evento que falhou na sincronização';
COMMENT ON COLUMN sync_retry_queue.user_id IS 'ID do usuário proprietário do evento';
COMMENT ON COLUMN sync_retry_queue.tentativas IS 'Número de tentativas de sincronização realizadas';
COMMENT ON COLUMN sync_retry_queue.ultimo_erro IS 'Último erro ocorrido na tentativa de sincronização';
COMMENT ON COLUMN sync_retry_queue.proxima_tentativa IS 'Timestamp da próxima tentativa de sincronização';
