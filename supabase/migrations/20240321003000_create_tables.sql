-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (fotógrafos)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nome TEXT,
    telefone TEXT,
    papel TEXT NOT NULL DEFAULT 'usuario' CHECK (papel IN ('admin', 'usuario')),
    empresa TEXT,
    logo_url TEXT,
    site_url TEXT,
    instagram TEXT,
    facebook TEXT,
    whatsapp TEXT,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    data_nascimento DATE,
    empresa TEXT,
    instagram TEXT,
    facebook TEXT,
    whatsapp TEXT,
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_cliente UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ NOT NULL,
    local TEXT,
    tipo_servico TEXT NOT NULL,
    valor DECIMAL(10,2),
    sinal DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'concluido')),
    notas TEXT,
    lembrete_enviado BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de contratos
CREATE TABLE IF NOT EXISTS public.contratos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_cliente UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    id_agendamento UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_sinal DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'assinado', 'expirado', 'cancelado')),
    data_expiracao TIMESTAMPTZ,
    data_assinatura TIMESTAMPTZ,
    assinado_por TEXT,
    assinatura_url TEXT,
    ip_assinatura TEXT,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de modelos de contrato
CREATE TABLE IF NOT EXISTS public.modelos_contrato (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    padrao BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de anexos de contrato
CREATE TABLE IF NOT EXISTS public.anexos_contrato (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_contrato UUID REFERENCES public.contratos(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    url TEXT NOT NULL,
    tipo TEXT NOT NULL,
    tamanho INTEGER NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS public.mensagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_cliente UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    assunto TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de histórico de atividades
CREATE TABLE IF NOT EXISTS public.historico_atividades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    dados JSONB,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de serviços/pacotes
CREATE TABLE IF NOT EXISTS public.servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2) NOT NULL,
    duracao_minutos INTEGER,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de portfólio
CREATE TABLE IF NOT EXISTS public.portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT NOT NULL,
    url_imagem TEXT NOT NULL,
    ordem INTEGER,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de indicações
CREATE TABLE IF NOT EXISTS public.indicacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome_indicado TEXT NOT NULL,
    email_indicado TEXT NOT NULL,
    telefone_indicado TEXT,
    nome_indicador TEXT NOT NULL,
    email_indicador TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'contatado', 'convertido', 'perdido')),
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelos_contrato ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos_contrato ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança básicas
-- Usuários podem ver e gerenciar apenas seus próprios dados
CREATE POLICY "Usuários gerenciam seus próprios dados" ON public.usuarios
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Fotógrafos podem ver e gerenciar apenas seus próprios clientes
CREATE POLICY "Fotógrafos gerenciam seus clientes" ON public.clientes
    USING (auth.uid() = id_fotografo)
    WITH CHECK (auth.uid() = id_fotografo);

-- Fotógrafos podem ver e gerenciar apenas seus próprios agendamentos
CREATE POLICY "Fotógrafos gerenciam seus agendamentos" ON public.agendamentos
    USING (auth.uid() = id_fotografo)
    WITH CHECK (auth.uid() = id_fotografo);

-- Fotógrafos podem ver e gerenciar apenas seus próprios contratos
CREATE POLICY "Fotógrafos gerenciam seus contratos" ON public.contratos
    USING (auth.uid() = id_fotografo)
    WITH CHECK (auth.uid() = id_fotografo);

-- Fotógrafos podem ver e gerenciar apenas seus próprios modelos de contrato
CREATE POLICY "Fotógrafos gerenciam seus modelos" ON public.modelos_contrato
    USING (auth.uid() = id_fotografo)
    WITH CHECK (auth.uid() = id_fotografo);

-- Anexos são visíveis apenas para o fotógrafo dono do contrato
CREATE POLICY "Fotógrafos veem anexos de seus contratos" ON public.anexos_contrato
    USING (EXISTS (
        SELECT 1 FROM public.contratos
        WHERE contratos.id = anexos_contrato.id_contrato
        AND contratos.id_fotografo = auth.uid()
    ));

-- Fotógrafos podem ver e gerenciar apenas suas próprias mensagens
CREATE POLICY "Fotógrafos gerenciam suas mensagens" ON public.mensagens
    USING (auth.uid() = id_fotografo)
    WITH CHECK (auth.uid() = id_fotografo);

-- Fotógrafos podem ver e gerenciar apenas seu próprio histórico
CREATE POLICY "Fotógrafos veem seu histórico" ON public.historico_atividades
    USING (auth.uid() = id_fotografo)
    WITH CHECK (auth.uid() = id_fotografo);

-- Fotógrafos podem ver e gerenciar apenas seus próprios serviços
CREATE POLICY "Fotógrafos gerenciam seus serviços" ON public.servicos
    USING (auth.uid() = id_fotografo)
    WITH CHECK (auth.uid() = id_fotografo);

-- Fotógrafos podem ver e gerenciar apenas seu próprio portfólio
CREATE POLICY "Fotógrafos gerenciam seu portfólio" ON public.portfolio
    USING (auth.uid() = id_fotografo)
    WITH CHECK (auth.uid() = id_fotografo);

-- Fotógrafos podem ver e gerenciar apenas suas próprias indicações
CREATE POLICY "Fotógrafos gerenciam suas indicações" ON public.indicacoes
    USING (auth.uid() = id_fotografo)
    WITH CHECK (auth.uid() = id_fotografo);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_fotografo ON public.clientes(id_fotografo);
CREATE INDEX IF NOT EXISTS idx_agendamentos_fotografo ON public.agendamentos(id_fotografo);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON public.agendamentos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_contratos_fotografo ON public.contratos(id_fotografo);
CREATE INDEX IF NOT EXISTS idx_contratos_cliente ON public.contratos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_mensagens_fotografo ON public.mensagens(id_fotografo);
CREATE INDEX IF NOT EXISTS idx_mensagens_cliente ON public.mensagens(id_cliente);
CREATE INDEX IF NOT EXISTS idx_historico_fotografo ON public.historico_atividades(id_fotografo);
CREATE INDEX IF NOT EXISTS idx_servicos_fotografo ON public.servicos(id_fotografo);
CREATE INDEX IF NOT EXISTS idx_portfolio_fotografo ON public.portfolio(id_fotografo);
CREATE INDEX IF NOT EXISTS idx_indicacoes_fotografo ON public.indicacoes(id_fotografo); 