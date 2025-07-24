-- Criação da tabela entregar_fotos para o sistema de entrega de fotos
-- Data: 2025-01-21
-- Descrição: Tabela principal para galerias de entrega de fotos

-- =====================================================
-- 1. CRIAÇÃO DA TABELA ENTREGAR_FOTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.entregar_fotos (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Informações básicas
    titulo TEXT NOT NULL,
    descricao TEXT,
    slug TEXT NOT NULL UNIQUE,
    
    -- Relacionamentos
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    evento_id UUID REFERENCES public.agenda_eventos(id) ON DELETE SET NULL,
    
    -- Datas importantes
    data_evento DATE,
    data_entrega DATE DEFAULT CURRENT_DATE,
    data_expiracao TIMESTAMPTZ,
    
    -- Configurações de acesso
    senha_acesso TEXT,
    link_galeria TEXT,
    
    -- Status e controle
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'expirada', 'arquivada', 'inativa')),
    
    -- Estatísticas
    total_fotos INTEGER DEFAULT 0,
    total_acessos INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    ultimo_acesso TIMESTAMPTZ,
    
    -- Configurações adicionais
    permitir_download BOOLEAN DEFAULT true,
    permitir_compartilhamento BOOLEAN DEFAULT true,
    marca_dagua BOOLEAN DEFAULT false,
    
    -- Observações
    observacoes TEXT,
    
    -- Controle de usuário
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Timestamps
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT entregar_fotos_total_fotos_positivo CHECK (total_fotos >= 0),
    CONSTRAINT entregar_fotos_total_acessos_positivo CHECK (total_acessos >= 0),
    CONSTRAINT entregar_fotos_total_downloads_positivo CHECK (total_downloads >= 0),
    CONSTRAINT entregar_fotos_data_expiracao_futura CHECK (data_expiracao IS NULL OR data_expiracao > criado_em)
);

-- =====================================================
-- 2. CRIAÇÃO DE ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice único para slug (URL amigável)
CREATE UNIQUE INDEX IF NOT EXISTS idx_entregar_fotos_slug 
ON public.entregar_fotos(slug);

-- Índice por usuário
CREATE INDEX IF NOT EXISTS idx_entregar_fotos_user_id 
ON public.entregar_fotos(user_id);

-- Índice por status
CREATE INDEX IF NOT EXISTS idx_entregar_fotos_status 
ON public.entregar_fotos(status);

-- Índice por cliente
CREATE INDEX IF NOT EXISTS idx_entregar_fotos_cliente_id 
ON public.entregar_fotos(cliente_id);

-- Índice por data de expiração
CREATE INDEX IF NOT EXISTS idx_entregar_fotos_data_expiracao 
ON public.entregar_fotos(data_expiracao) 
WHERE data_expiracao IS NOT NULL;

-- Índice para busca por título
CREATE INDEX IF NOT EXISTS idx_entregar_fotos_titulo 
ON public.entregar_fotos USING gin(to_tsvector('portuguese', titulo));

-- =====================================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.entregar_fotos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CRIAÇÃO DE POLÍTICAS RLS
-- =====================================================

-- Política para SELECT: Usuários podem ver suas próprias galerias
CREATE POLICY "entregar_fotos_select_policy"
ON public.entregar_fotos
FOR SELECT
USING (user_id = auth.uid());

-- Política para INSERT: Usuários podem inserir suas próprias galerias
CREATE POLICY "entregar_fotos_insert_policy"
ON public.entregar_fotos
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Política para UPDATE: Usuários podem atualizar suas próprias galerias
CREATE POLICY "entregar_fotos_update_policy"
ON public.entregar_fotos
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política para DELETE: Usuários podem deletar suas próprias galerias
CREATE POLICY "entregar_fotos_delete_policy"
ON public.entregar_fotos
FOR DELETE
USING (user_id = auth.uid());

-- =====================================================
-- 5. CRIAÇÃO DE TRIGGERS
-- =====================================================

-- Trigger para atualizar automaticamente o campo atualizado_em
CREATE OR REPLACE FUNCTION update_entregar_fotos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_entregar_fotos_updated_at
    BEFORE UPDATE ON public.entregar_fotos
    FOR EACH ROW
    EXECUTE FUNCTION update_entregar_fotos_updated_at();

-- Trigger para gerar slug automaticamente
CREATE OR REPLACE FUNCTION generate_entregar_fotos_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Gerar slug base a partir do título
    base_slug := lower(trim(regexp_replace(NEW.titulo, '[^a-zA-Z0-9\s]', '', 'g')));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(base_slug, '-');
    
    -- Se o slug estiver vazio, usar um padrão
    IF base_slug = '' THEN
        base_slug := 'galeria-' || extract(epoch from now())::text;
    END IF;
    
    final_slug := base_slug;
    
    -- Verificar se o slug já existe e adicionar contador se necessário
    WHILE EXISTS (SELECT 1 FROM public.entregar_fotos WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
    
    -- Gerar link da galeria
    NEW.link_galeria := '/entrega-fotos/' || final_slug;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_entregar_fotos_generate_slug
    BEFORE INSERT OR UPDATE OF titulo ON public.entregar_fotos
    FOR EACH ROW
    EXECUTE FUNCTION generate_entregar_fotos_slug();

-- =====================================================
-- 6. CRIAÇÃO DE FUNÇÕES AUXILIARES
-- =====================================================

-- Função para incrementar contador de acessos
CREATE OR REPLACE FUNCTION incrementar_acesso_galeria(galeria_slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.entregar_fotos 
    SET total_acessos = total_acessos + 1,
        ultimo_acesso = now(),
        atualizado_em = now()
    WHERE slug = galeria_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar contador de downloads
CREATE OR REPLACE FUNCTION incrementar_download_galeria(galeria_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.entregar_fotos 
    SET total_downloads = total_downloads + 1,
        atualizado_em = now()
    WHERE id = galeria_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar contador de fotos
CREATE OR REPLACE FUNCTION atualizar_total_fotos_galeria(galeria_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.entregar_fotos 
    SET total_fotos = (
        SELECT COUNT(*) 
        FROM public.entregar_imagens 
        WHERE galeria_id = atualizar_total_fotos_galeria.galeria_id
    ),
    atualizado_em = now()
    WHERE id = galeria_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se galeria expirou
CREATE OR REPLACE FUNCTION verificar_expiracao_galeria(galeria_id UUID)
RETURNS boolean AS $$
DECLARE
    galeria_record RECORD;
BEGIN
    SELECT data_expiracao, status INTO galeria_record
    FROM public.entregar_fotos
    WHERE id = galeria_id;
    
    IF galeria_record.data_expiracao IS NOT NULL 
       AND galeria_record.data_expiracao < now() 
       AND galeria_record.status = 'ativa' THEN
        
        UPDATE public.entregar_fotos 
        SET status = 'expirada', atualizado_em = now()
        WHERE id = galeria_id;
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.entregar_fotos IS 'Tabela principal para galerias de entrega de fotos';
COMMENT ON COLUMN public.entregar_fotos.id IS 'Identificador único da galeria (UUID)';
COMMENT ON COLUMN public.entregar_fotos.titulo IS 'Título da galeria de fotos';
COMMENT ON COLUMN public.entregar_fotos.descricao IS 'Descrição da galeria';
COMMENT ON COLUMN public.entregar_fotos.slug IS 'URL amigável gerada automaticamente a partir do título';
COMMENT ON COLUMN public.entregar_fotos.cliente_id IS 'Referência ao cliente (opcional)';
COMMENT ON COLUMN public.entregar_fotos.evento_id IS 'Referência ao evento da agenda (opcional)';
COMMENT ON COLUMN public.entregar_fotos.data_evento IS 'Data do evento fotografado';
COMMENT ON COLUMN public.entregar_fotos.data_entrega IS 'Data de entrega das fotos';
COMMENT ON COLUMN public.entregar_fotos.data_expiracao IS 'Data de expiração do acesso à galeria';
COMMENT ON COLUMN public.entregar_fotos.senha_acesso IS 'Senha para acesso à galeria (opcional)';
COMMENT ON COLUMN public.entregar_fotos.link_galeria IS 'Link completo da galeria';
COMMENT ON COLUMN public.entregar_fotos.status IS 'Status da galeria (ativa, expirada, arquivada, inativa)';
COMMENT ON COLUMN public.entregar_fotos.total_fotos IS 'Contador total de fotos na galeria';
COMMENT ON COLUMN public.entregar_fotos.total_acessos IS 'Contador de acessos à galeria';
COMMENT ON COLUMN public.entregar_fotos.total_downloads IS 'Contador de downloads da galeria';
COMMENT ON COLUMN public.entregar_fotos.ultimo_acesso IS 'Data e hora do último acesso';

-- Log da migração
INSERT INTO public.sistema_atividades (table_name, operation, record_id, user_id, new_data)
VALUES (
    'entregar_fotos', 
    'CREATE_TABLE', 
    gen_random_uuid(), 
    NULL,
    '{"migration": "20250721013622_create_entregar_fotos_table", "description": "Criação da tabela principal entregar_fotos para sistema de entrega de fotos"}'::jsonb
) ON CONFLICT DO NOTHING;