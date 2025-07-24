-- =====================================================
-- BACKUP ESTRUTURA - AGENDA PRO
-- Data: $(date)
-- Projeto Supabase ID: suoddfvhzjsklbpdptje
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: perfis
-- =====================================================
CREATE TABLE IF NOT EXISTS public.perfis (
    id uuid NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'usuario'::text,
    criado_em timestamp with time zone DEFAULT now(),
    avatar_url text,
    CONSTRAINT perfis_pkey PRIMARY KEY (id),
    CONSTRAINT perfis_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: clientes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clientes (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    nome text NOT NULL,
    email text,
    telefone text,
    observacoes text,
    user_id uuid,
    criado_em timestamp with time zone DEFAULT now(),
    empresa text,
    CONSTRAINT clientes_pkey PRIMARY KEY (id),
    CONSTRAINT clientes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: agenda_eventos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agenda_eventos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    cliente_id uuid,
    titulo text NOT NULL,
    descricao text,
    data_inicio timestamp with time zone NOT NULL,
    data_fim timestamp with time zone NOT NULL,
    local text,
    tipo text,
    cor text,
    status text DEFAULT 'agendado'::text,
    notificacao_enviada boolean DEFAULT false,
    observacoes text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    telefone text,
    CONSTRAINT eventos_pkey PRIMARY KEY (id),
    CONSTRAINT eventos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT eventos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL,
    CONSTRAINT eventos_status_check CHECK (status IN ('agendado', 'confirmado', 'cancelado', 'concluido'))
);

-- =====================================================
-- TABELA: configuracoes_empresa
-- =====================================================
CREATE TABLE IF NOT EXISTS public.configuracoes_empresa (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    nome_empresa text,
    cnpj text,
    telefone text,
    whatsapp text,
    email_empresa text,
    endereco text,
    cidade text,
    estado text,
    cep text,
    instagram text,
    facebook text,
    site text,
    logo_url text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT configuracoes_empresa_pkey PRIMARY KEY (id),
    CONSTRAINT configuracoes_empresa_user_id_key UNIQUE (user_id),
    CONSTRAINT configuracoes_empresa_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: configuracoes_integracoes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.configuracoes_integracoes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    webhook_enabled boolean DEFAULT false,
    custom_domain text,
    company_logo text,
    logo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    webhook_url text,
    CONSTRAINT user_integrations_pkey PRIMARY KEY (id),
    CONSTRAINT user_integrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: contratos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contratos (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    titulo text NOT NULL,
    descricao text,
    status text DEFAULT 'pendente'::text,
    cliente_id uuid,
    user_id uuid,
    criado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT contratos_pkey PRIMARY KEY (id),
    CONSTRAINT contratos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL,
    CONSTRAINT contratos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: financeiro_pagamentos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.financeiro_pagamentos (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    cliente_id uuid,
    valor numeric NOT NULL,
    status text DEFAULT 'pendente'::text,
    forma text,
    vencimento date,
    user_id uuid,
    criado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT pagamentos_pkey PRIMARY KEY (id),
    CONSTRAINT pagamentos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL,
    CONSTRAINT pagamentos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: financeiro_transacoes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.financeiro_transacoes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    cliente_id uuid,
    descricao text NOT NULL,
    valor numeric NOT NULL,
    tipo text NOT NULL,
    categoria text,
    status text NOT NULL DEFAULT 'pendente'::text,
    data_transacao timestamp with time zone NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento date,
    data_pagamento date,
    forma_pagamento text,
    observacoes text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    clientename text,
    data_evento timestamp with time zone,
    CONSTRAINT transacoes_pkey PRIMARY KEY (id),
    CONSTRAINT transacoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT transacoes_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL,
    CONSTRAINT transacoes_tipo_check CHECK (tipo IN ('receita', 'despesa')),
    CONSTRAINT financeiro_transacoes_status_check CHECK (status IN ('pendente', 'pago', 'cancelado', 'vencido'))
);

-- =====================================================
-- TABELA: indicacoes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.indicacoes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    cliente_indicador_id uuid,
    cliente_indicado_id uuid,
    nome_indicado text,
    email_indicado text,
    telefone_indicado text,
    status text DEFAULT 'pendente'::text,
    data_indicacao date DEFAULT CURRENT_DATE,
    data_conversao date,
    observacoes text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT indicacoes_pkey PRIMARY KEY (id),
    CONSTRAINT indicacoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT indicacoes_cliente_indicador_id_fkey FOREIGN KEY (cliente_indicador_id) REFERENCES public.clientes(id) ON DELETE SET NULL,
    CONSTRAINT indicacoes_cliente_indicado_id_fkey FOREIGN KEY (cliente_indicado_id) REFERENCES public.clientes(id) ON DELETE SET NULL,
    CONSTRAINT indicacoes_status_check CHECK (status IN ('pendente', 'convertido', 'rejeitado'))
);

-- =====================================================
-- TABELA: media_imagens
-- =====================================================
CREATE TABLE IF NOT EXISTS public.media_imagens (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    url text NOT NULL,
    tipo text,
    referencia_id uuid,
    user_id uuid,
    criado_em timestamp with time zone DEFAULT now(),
    filesize integer,
    filename text,
    mimetype text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT imagens_pkey PRIMARY KEY (id),
    CONSTRAINT imagens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: mensagens
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mensagens (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    conteudo text NOT NULL,
    cliente_id uuid,
    user_id uuid,
    criado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT mensagens_pkey PRIMARY KEY (id),
    CONSTRAINT mensagens_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL,
    CONSTRAINT mensagens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: mensagens_configuracoes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mensagens_configuracoes (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    canal_whatsapp boolean DEFAULT false,
    canal_email boolean DEFAULT false,
    canal_sms boolean DEFAULT false,
    webhook_url text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT mensagens_configuracoes_pkey PRIMARY KEY (id),
    CONSTRAINT mensagens_configuracoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: mensagens_modelos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mensagens_modelos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    titulo text NOT NULL,
    conteudo text NOT NULL,
    categoria text,
    tags text[],
    ativo boolean DEFAULT true,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT templates_mensagens_pkey PRIMARY KEY (id),
    CONSTRAINT templates_mensagens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: mensagens_gatilhos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mensagens_gatilhos (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    trigger text NOT NULL,
    template_id uuid NOT NULL,
    antecedencia interval,
    frequencia interval,
    ativo boolean DEFAULT true,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT mensagens_gatilhos_pkey PRIMARY KEY (id),
    CONSTRAINT mensagens_gatilhos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT mensagens_gatilhos_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.mensagens_modelos(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: mensagens_logs
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mensagens_logs (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    gatilho_id uuid NOT NULL,
    template_id uuid NOT NULL,
    canal text NOT NULL,
    status text NOT NULL,
    erro text,
    enviado_em timestamp with time zone,
    criado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT mensagens_logs_pkey PRIMARY KEY (id),
    CONSTRAINT mensagens_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT mensagens_logs_gatilho_id_fkey FOREIGN KEY (gatilho_id) REFERENCES public.mensagens_gatilhos(id) ON DELETE CASCADE,
    CONSTRAINT mensagens_logs_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.mensagens_modelos(id) ON DELETE CASCADE,
    CONSTRAINT mensagens_logs_canal_check CHECK (canal IN ('whatsapp', 'email', 'sms')),
    CONSTRAINT mensagens_logs_status_check CHECK (status IN ('enviado', 'erro', 'pendente'))
);

-- =====================================================
-- TABELA: mensagens_templates
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mensagens_templates (
    id uuid,
    user_id uuid,
    nome text,
    conteudo text,
    tipo text,
    tags text[],
    criado_em timestamp with time zone,
    atualizado_em timestamp with time zone
);

-- =====================================================
-- TABELA: notificacoes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    titulo text,
    corpo text,
    lida boolean DEFAULT false,
    user_id uuid,
    criado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT notificacoes_pkey PRIMARY KEY (id),
    CONSTRAINT notificacoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: orcamentos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orcamentos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    cliente_id uuid,
    titulo text NOT NULL,
    descricao text,
    valor_total numeric NOT NULL,
    data_validade date,
    status text DEFAULT 'pendente'::text,
    observacoes text,
    itens jsonb,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT orcamentos_pkey PRIMARY KEY (id),
    CONSTRAINT orcamentos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT orcamentos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL,
    CONSTRAINT orcamentos_status_check CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'expirado'))
);

-- =====================================================
-- TABELA: portfolio
-- =====================================================
CREATE TABLE IF NOT EXISTS public.portfolio (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    titulo text NOT NULL,
    descricao text,
    categoria text,
    tags text[],
    data_evento date,
    cliente_id uuid,
    publicado boolean DEFAULT true,
    destaque boolean DEFAULT false,
    imagem_capa text,
    imagens text[],
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT portfolio_pkey PRIMARY KEY (id),
    CONSTRAINT portfolio_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT portfolio_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA: portfolio_trabalhos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.portfolio_trabalhos (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    titulo text NOT NULL,
    categoria text,
    local text,
    descricao text,
    tags text[] DEFAULT '{}'::text[],
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    url_imagem_drive text,
    CONSTRAINT portfolio_trabalhos_pkey PRIMARY KEY (id),
    CONSTRAINT portfolio_trabalhos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: sistema_atividades
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sistema_atividades (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    operation text NOT NULL,
    timestamp timestamp with time zone NOT NULL DEFAULT now(),
    record_id uuid,
    user_id uuid,
    old_data jsonb,
    new_data jsonb,
    CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);

-- =====================================================
-- TABELA: clientes_completo_obsoleto (OBSOLETA)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clientes_completo_obsoleto (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    nome text,
    email text,
    telefone text,
    empresa text,
    nascimento date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT clientes_completo_pkey PRIMARY KEY (id),
    CONSTRAINT clientes_completo_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índices para agenda_eventos
CREATE INDEX IF NOT EXISTS idx_agenda_eventos_data_inicio ON public.agenda_eventos USING btree (data_inicio);
CREATE INDEX IF NOT EXISTS idx_agenda_eventos_status ON public.agenda_eventos USING btree (status);
CREATE INDEX IF NOT EXISTS idx_agenda_eventos_user_data ON public.agenda_eventos USING btree (user_id, data_inicio);

-- Índices para mensagens_gatilhos
CREATE INDEX IF NOT EXISTS idx_mensagens_gatilhos_ativo ON public.mensagens_gatilhos USING btree (ativo);
CREATE INDEX IF NOT EXISTS idx_mensagens_gatilhos_template_id ON public.mensagens_gatilhos USING btree (template_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_gatilhos_user_id ON public.mensagens_gatilhos USING btree (user_id);

-- Índices para mensagens_logs
CREATE INDEX IF NOT EXISTS idx_mensagens_logs_canal ON public.mensagens_logs USING btree (canal);
CREATE INDEX IF NOT EXISTS idx_mensagens_logs_criado_em ON public.mensagens_logs USING btree (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_mensagens_logs_enviado_em ON public.mensagens_logs USING btree (enviado_em DESC);
CREATE INDEX IF NOT EXISTS idx_mensagens_logs_gatilho_id ON public.mensagens_logs USING btree (gatilho_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_logs_status ON public.mensagens_logs USING btree (status);
CREATE INDEX IF NOT EXISTS idx_mensagens_logs_template_id ON public.mensagens_logs USING btree (template_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_logs_user_id ON public.mensagens_logs USING btree (user_id);

-- Índices para portfolio_trabalhos
CREATE INDEX IF NOT EXISTS idx_portfolio_criado_em_desc ON public.portfolio_trabalhos USING btree (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_trabalhos_categoria ON public.portfolio_trabalhos USING btree (categoria);
CREATE INDEX IF NOT EXISTS idx_portfolio_trabalhos_criado_em ON public.portfolio_trabalhos USING btree (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_trabalhos_criado_em_desc ON public.portfolio_trabalhos USING btree (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_trabalhos_public_optimized ON public.portfolio_trabalhos USING btree (criado_em DESC, id);
CREATE INDEX IF NOT EXISTS idx_portfolio_trabalhos_public_pagination ON public.portfolio_trabalhos USING btree (criado_em DESC, id);
CREATE INDEX IF NOT EXISTS idx_portfolio_trabalhos_user_id ON public.portfolio_trabalhos USING btree (user_id);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_integracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_gatilhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_trabalhos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIM DO BACKUP ESTRUTURA
-- ===================================================== 