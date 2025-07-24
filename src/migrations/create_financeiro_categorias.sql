-- Criação da tabela financeiro_categorias
CREATE TABLE IF NOT EXISTS financeiro_categorias (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Garantir que não existam categorias duplicadas por usuário
  UNIQUE(user_id, tipo, nome)
);

-- Adicionar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_financeiro_categorias_user_id ON financeiro_categorias(user_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_categorias_tipo ON financeiro_categorias(tipo);

-- Políticas de segurança RLS
ALTER TABLE financeiro_categorias ENABLE ROW LEVEL SECURITY;

-- Política para inserção (apenas próprio usuário)
CREATE POLICY insert_own_categorias ON financeiro_categorias
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para seleção (apenas próprio usuário)
CREATE POLICY select_own_categorias ON financeiro_categorias
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para atualização (apenas próprio usuário)
CREATE POLICY update_own_categorias ON financeiro_categorias
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para exclusão (apenas próprio usuário)
CREATE POLICY delete_own_categorias ON financeiro_categorias
  FOR DELETE
  USING (auth.uid() = user_id);

-- Inserir categorias padrão para despesas
INSERT INTO financeiro_categorias (id, nome, tipo, user_id, criado_em, atualizado_em)
VALUES 
  (gen_random_uuid(), 'Equipamento', 'despesa', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Software', 'despesa', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Marketing', 'despesa', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Transporte', 'despesa', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Alimentação', 'despesa', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Locação', 'despesa', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Impostos', 'despesa', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Outro', 'despesa', '00000000-0000-0000-0000-000000000000', NOW(), NOW());

-- Inserir categorias padrão para receitas
INSERT INTO financeiro_categorias (id, nome, tipo, user_id, criado_em, atualizado_em)
VALUES 
  (gen_random_uuid(), 'Sessão Fotográfica', 'receita', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Ensaio', 'receita', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Evento', 'receita', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Venda de Produtos', 'receita', '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
  (gen_random_uuid(), 'Outro', 'receita', '00000000-0000-0000-0000-000000000000', NOW(), NOW()); 