-- Script para corrigir o erro de evento_id na tabela contratos
-- Execute este script no SQL Editor do painel do Supabase

-- 1. Adicionar coluna evento_id à tabela contratos
ALTER TABLE public.contratos 
ADD COLUMN IF NOT EXISTS evento_id UUID;

-- 2. Adicionar foreign key constraint para referenciar agenda_eventos
ALTER TABLE public.contratos 
ADD CONSTRAINT contratos_evento_id_fkey 
FOREIGN KEY (evento_id) REFERENCES public.agenda_eventos(id) ON DELETE SET NULL;

-- 3. Criar índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_contratos_evento_id ON public.contratos(evento_id);

-- 4. Comentário explicativo
COMMENT ON COLUMN public.contratos.evento_id IS 'Referência ao evento da agenda relacionado ao contrato';

-- Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contratos' 
AND table_schema = 'public'
ORDER BY ordinal_position;