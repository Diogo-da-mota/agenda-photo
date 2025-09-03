-- Criar tabela para armazenar informações de rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    user_id UUID,
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(ip, endpoint, window_start)
);

-- Criar índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON public.rate_limits(ip);
CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON public.rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON public.rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits(window_start);

-- Adicionar políticas RLS para a tabela rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Apenas serviço (service role) pode ler/escrever na tabela de rate limits
CREATE POLICY "Service role pode gerenciar rate limits" 
ON public.rate_limits
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Criar função para verificar e incrementar rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_ip TEXT,
    p_endpoint TEXT,
    p_user_id UUID DEFAULT NULL,
    p_max_requests INTEGER DEFAULT 60,
    p_window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMP WITH TIME ZONE;
    v_rec RECORD;
BEGIN
    -- Calcular início da janela de tempo atual
    v_window_start := date_trunc('minute', NOW()) - 
                     (INTERVAL '1 minute' * (EXTRACT(MINUTE FROM NOW()) % p_window_minutes));
    
    -- Verificar se já existe um registro para esta janela
    SELECT * INTO v_rec
    FROM public.rate_limits
    WHERE ip = p_ip 
      AND endpoint = p_endpoint
      AND window_start = v_window_start;
      
    IF FOUND THEN
        -- Já existe um registro, verificar se excedeu o limite
        IF v_rec.request_count >= p_max_requests THEN
            -- Excedeu o limite
            RETURN FALSE;
        ELSE
            -- Incrementar contador
            UPDATE public.rate_limits
            SET request_count = request_count + 1
            WHERE id = v_rec.id;
            RETURN TRUE;
        END IF;
    ELSE
        -- Não existe registro para esta janela, criar um novo
        INSERT INTO public.rate_limits (
            ip, endpoint, user_id, request_count, window_start
        ) VALUES (
            p_ip, p_endpoint, p_user_id, 1, v_window_start
        );
        RETURN TRUE;
    END IF;
END;
$$;

-- Conceder permissão para a função
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, UUID, INTEGER, INTEGER) TO service_role;

-- Criar função para limpar registros antigos de rate limiting (manutenção)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits(
    p_max_age_hours INTEGER DEFAULT 24
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.rate_limits
    WHERE window_start < NOW() - (INTERVAL '1 hour' * p_max_age_hours)
    RETURNING COUNT(*) INTO v_deleted_count;
    
    RETURN v_deleted_count;
END;
$$;

-- Conceder permissão para a função
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limits(INTEGER) TO service_role; 