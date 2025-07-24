-- Adicionar coluna valor_evento na tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS valor_evento DECIMAL(10,2);

-- Comentário da coluna
COMMENT ON COLUMN public.clientes.valor_evento IS 'Valor do serviço/evento do cliente'; 