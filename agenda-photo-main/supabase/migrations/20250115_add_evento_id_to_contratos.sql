-- Adicionar coluna evento_id à tabela contratos
ALTER TABLE public.contratos 
ADD COLUMN IF NOT EXISTS evento_id UUID;

-- Adicionar foreign key constraint para referenciar agenda_eventos
ALTER TABLE public.contratos 
ADD CONSTRAINT contratos_evento_id_fkey 
FOREIGN KEY (evento_id) REFERENCES public.agenda_eventos(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_contratos_evento_id ON public.contratos(evento_id);

-- Comentário explicativo
COMMENT ON COLUMN public.contratos.evento_id IS 'Referência ao evento da agenda relacionado ao contrato';