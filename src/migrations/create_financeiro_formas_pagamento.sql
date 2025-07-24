-- Criação da tabela financeiro_formas_pagamento
CREATE TABLE IF NOT EXISTS financeiro_formas_pagamento (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Garantir que não existam formas de pagamento duplicadas por usuário
  UNIQUE(user_id, nome)
);

-- Adicionar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_financeiro_formas_pagamento_user_id ON financeiro_formas_pagamento(user_id);

-- Políticas de segurança RLS
ALTER TABLE financeiro_formas_pagamento ENABLE ROW LEVEL SECURITY;

-- Política para inserção (apenas próprio usuário)
CREATE POLICY insert_own_formas_pagamento ON financeiro_formas_pagamento
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para seleção (apenas próprio usuário)
CREATE POLICY select_own_formas_pagamento ON financeiro_formas_pagamento
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para atualização (apenas próprio usuário)
CREATE POLICY update_own_formas_pagamento ON financeiro_formas_pagamento
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para exclusão (apenas próprio usuário)
CREATE POLICY delete_own_formas_pagamento ON financeiro_formas_pagamento
  FOR DELETE
  USING (auth.uid() = user_id);

-- Inserir formas de pagamento padrão
INSERT INTO financeiro_formas_pagamento (id, nome, user_id, criado_em, atualizado_em)
VALUES 
  (gen_random_uuid(), 'Dinheiro', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Cartão de Crédito', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Cartão de Débito', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'PIX', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Transferência Bancária', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Boleto', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Outro', '00000000-0000-0000-0000-000000000000', NOW(), NOW()); 