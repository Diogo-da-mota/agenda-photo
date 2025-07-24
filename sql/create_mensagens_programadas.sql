-- =====================================================
-- TABELA: mensagens_programadas
-- Descrição: Armazena mensagens programadas para envio futuro
-- Data: $(date)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mensagens_programadas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    cliente_id uuid,
    template_id uuid,
    titulo text NOT NULL,
    conteudo text NOT NULL,
    telefone text NOT NULL,
    data_programada timestamp with time zone NOT NULL,
    data_criacao timestamp with time zone DEFAULT now(),
    status text NOT NULL DEFAULT 'pendente',
    tentativas integer DEFAULT 0,
    max_tentativas integer DEFAULT 3,
    erro_ultimo text,
    enviado_em timestamp with time zone,
    cancelado_em timestamp with time zone,
    cancelado_por uuid,
    metadata jsonb DEFAULT '{}',
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    
    CONSTRAINT mensagens_programadas_pkey PRIMARY KEY (id),
    CONSTRAINT mensagens_programadas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT mensagens_programadas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL,
    CONSTRAINT mensagens_programadas_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.mensagens_modelos(id) ON DELETE SET NULL,
    CONSTRAINT mensagens_programadas_cancelado_por_fkey FOREIGN KEY (cancelado_por) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT mensagens_programadas_status_check CHECK (status IN ('pendente', 'enviado', 'erro', 'cancelado')),
    CONSTRAINT mensagens_programadas_telefone_check CHECK (telefone ~ '^[0-9+\-\s()]+$'),
    CONSTRAINT mensagens_programadas_data_programada_check CHECK (data_programada > now())
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para buscar mensagens por usuário
CREATE INDEX IF NOT EXISTS idx_mensagens_programadas_user_id 
ON public.mensagens_programadas(user_id);

-- Índice para buscar mensagens por status
CREATE INDEX IF NOT EXISTS idx_mensagens_programadas_status 
ON public.mensagens_programadas(status);

-- Índice para buscar mensagens por data programada (importante para processamento)
CREATE INDEX IF NOT EXISTS idx_mensagens_programadas_data_programada 
ON public.mensagens_programadas(data_programada) 
WHERE status = 'pendente';

-- Índice composto para buscar mensagens pendentes por usuário
CREATE INDEX IF NOT EXISTS idx_mensagens_programadas_user_status_data 
ON public.mensagens_programadas(user_id, status, data_programada);

-- =====================================================
-- TRIGGER PARA ATUALIZAR TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_mensagens_programadas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mensagens_programadas_updated_at
    BEFORE UPDATE ON public.mensagens_programadas
    FOR EACH ROW
    EXECUTE FUNCTION update_mensagens_programadas_updated_at();

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.mensagens_programadas ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários só podem ver suas próprias mensagens
CREATE POLICY "Usuários podem ver suas próprias mensagens programadas" 
ON public.mensagens_programadas FOR SELECT 
USING (auth.uid() = user_id);

-- Política para INSERT: usuários só podem criar mensagens para si mesmos
CREATE POLICY "Usuários podem criar suas próprias mensagens programadas" 
ON public.mensagens_programadas FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários só podem atualizar suas próprias mensagens
CREATE POLICY "Usuários podem atualizar suas próprias mensagens programadas" 
ON public.mensagens_programadas FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para DELETE: usuários só podem deletar suas próprias mensagens
CREATE POLICY "Usuários podem deletar suas próprias mensagens programadas" 
ON public.mensagens_programadas FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.mensagens_programadas IS 'Tabela para armazenar mensagens programadas para envio futuro';
COMMENT ON COLUMN public.mensagens_programadas.id IS 'Identificador único da mensagem programada';
COMMENT ON COLUMN public.mensagens_programadas.user_id IS 'ID do usuário que criou a mensagem';
COMMENT ON COLUMN public.mensagens_programadas.cliente_id IS 'ID do cliente destinatário (opcional)';
COMMENT ON COLUMN public.mensagens_programadas.template_id IS 'ID do template usado (opcional)';
COMMENT ON COLUMN public.mensagens_programadas.titulo IS 'Título/assunto da mensagem';
COMMENT ON COLUMN public.mensagens_programadas.conteudo IS 'Conteúdo da mensagem (já processado com variáveis)';
COMMENT ON COLUMN public.mensagens_programadas.telefone IS 'Número de telefone do destinatário';
COMMENT ON COLUMN public.mensagens_programadas.data_programada IS 'Data e hora programada para envio';
COMMENT ON COLUMN public.mensagens_programadas.status IS 'Status da mensagem: pendente, enviado, erro, cancelado';
COMMENT ON COLUMN public.mensagens_programadas.tentativas IS 'Número de tentativas de envio realizadas';
COMMENT ON COLUMN public.mensagens_programadas.max_tentativas IS 'Número máximo de tentativas permitidas';
COMMENT ON COLUMN public.mensagens_programadas.erro_ultimo IS 'Último erro ocorrido durante o envio';
COMMENT ON COLUMN public.mensagens_programadas.enviado_em IS 'Data e hora do envio bem-sucedido';
COMMENT ON COLUMN public.mensagens_programadas.cancelado_em IS 'Data e hora do cancelamento';
COMMENT ON COLUMN public.mensagens_programadas.cancelado_por IS 'ID do usuário que cancelou a mensagem';
COMMENT ON COLUMN public.mensagens_programadas.metadata IS 'Dados adicionais em formato JSON';