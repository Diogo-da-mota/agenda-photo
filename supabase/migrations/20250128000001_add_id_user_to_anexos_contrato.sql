-- Migração: Adicionar coluna id_user à tabela anexos_contrato e corrigir políticas RLS
-- Data: 2025-01-28
-- Descrição: Adiciona coluna id_user para melhor isolamento de dados e políticas RLS mais eficientes

-- ETAPA 1: Adicionar a coluna id_user
ALTER TABLE public.anexos_contrato 
ADD COLUMN IF NOT EXISTS id_user UUID;

-- ETAPA 2: Preencher a coluna id_user com base no user_id da tabela contratos
UPDATE public.anexos_contrato 
SET id_user = c.user_id 
FROM public.contratos c 
WHERE anexos_contrato.id_contrato = c.id
AND anexos_contrato.id_user IS NULL;

-- ETAPA 3: Tornar a coluna id_user obrigatória
ALTER TABLE public.anexos_contrato 
ALTER COLUMN id_user SET NOT NULL;

-- ETAPA 4: Adicionar foreign key para garantir integridade
-- Primeiro, remover a constraint se ela já existir
ALTER TABLE public.anexos_contrato 
DROP CONSTRAINT IF EXISTS fk_anexos_contrato_user;

-- Agora adicionar a constraint
ALTER TABLE public.anexos_contrato 
ADD CONSTRAINT fk_anexos_contrato_user 
FOREIGN KEY (id_user) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ETAPA 5: Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_anexos_contrato_user_id 
ON public.anexos_contrato(id_user);

-- ETAPA 6: Remover políticas RLS antigas (se existirem)
DROP POLICY IF EXISTS "Fotógrafos podem ver anexos de seus contratos" ON public.anexos_contrato;
DROP POLICY IF EXISTS "Fotógrafos podem inserir anexos em seus contratos" ON public.anexos_contrato;
DROP POLICY IF EXISTS "Fotógrafos podem atualizar anexos de seus contratos" ON public.anexos_contrato;
DROP POLICY IF EXISTS "Fotógrafos podem deletar anexos de seus contratos" ON public.anexos_contrato;

-- ETAPA 7: Criar novas políticas RLS usando id_user diretamente
-- Política para SELECT (visualizar)
CREATE POLICY "Usuários podem ver seus próprios anexos"
ON public.anexos_contrato
FOR SELECT
USING (auth.uid() = id_user);

-- Política para INSERT (inserir)
CREATE POLICY "Usuários podem inserir seus próprios anexos"
ON public.anexos_contrato
FOR INSERT
WITH CHECK (auth.uid() = id_user);

-- Política para UPDATE (atualizar)
CREATE POLICY "Usuários podem atualizar seus próprios anexos"
ON public.anexos_contrato
FOR UPDATE
USING (auth.uid() = id_user)
WITH CHECK (auth.uid() = id_user);

-- Política para DELETE (deletar)
CREATE POLICY "Usuários podem deletar seus próprios anexos"
ON public.anexos_contrato
FOR DELETE
USING (auth.uid() = id_user);

-- ETAPA 8: Garantir que RLS está habilitado
ALTER TABLE public.anexos_contrato ENABLE ROW LEVEL SECURITY;