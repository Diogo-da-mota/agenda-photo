-- Primeiro, criar a tabela de usuários se ainda não existir
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    papel TEXT NOT NULL DEFAULT 'usuario' CHECK (papel IN ('admin', 'usuario')),
    nome TEXT,
    telefone TEXT,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS na tabela usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para usuarios
CREATE POLICY "Usuários podem gerenciar seus próprios dados"
ON public.usuarios
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_cliente UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'concluido')),
    tipo_servico TEXT,
    valor DECIMAL(10,2),
    local TEXT,
    notas TEXT,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de serviços/pacotes oferecidos
CREATE TABLE IF NOT EXISTS public.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2),
    duracao_minutos INTEGER,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de contratos
CREATE TABLE IF NOT EXISTS public.contratos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_cliente UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    valor_total DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'assinado', 'cancelado')),
    data_criacao TIMESTAMPTZ DEFAULT now(),
    data_assinatura TIMESTAMPTZ,
    data_validade TIMESTAMPTZ,
    termos TEXT,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS public.pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_cliente UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    id_contrato UUID REFERENCES public.contratos(id) ON DELETE SET NULL,
    valor DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado', 'reembolsado')),
    metodo_pagamento TEXT,
    data_vencimento DATE,
    data_pagamento TIMESTAMPTZ,
    comprovante_url TEXT,
    notas TEXT,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de portfólio
CREATE TABLE IF NOT EXISTS public.portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT,
    data_evento DATE,
    capa_url TEXT,
    publicado BOOLEAN DEFAULT false,
    ordem INTEGER,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de imagens do portfólio
CREATE TABLE IF NOT EXISTS public.portfolio_imagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_portfolio UUID REFERENCES public.portfolio(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    legenda TEXT,
    ordem INTEGER,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de mensagens/comunicações
CREATE TABLE IF NOT EXISTS public.mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_fotografo UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_cliente UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    assunto TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('email', 'sms', 'whatsapp', 'sistema')),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'erro', 'lido')),
    data_envio TIMESTAMPTZ,
    data_leitura TIMESTAMPTZ,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para agendamentos
CREATE POLICY "Usuários podem gerenciar seus próprios agendamentos"
ON public.agendamentos
USING (auth.uid() = id_fotografo)
WITH CHECK (auth.uid() = id_fotografo);

-- Políticas RLS para serviços
CREATE POLICY "Usuários podem gerenciar seus próprios serviços"
ON public.servicos
USING (auth.uid() = id_fotografo)
WITH CHECK (auth.uid() = id_fotografo);

-- Políticas RLS para contratos
CREATE POLICY "Usuários podem gerenciar seus próprios contratos"
ON public.contratos
USING (auth.uid() = id_fotografo)
WITH CHECK (auth.uid() = id_fotografo);

-- Políticas RLS para pagamentos
CREATE POLICY "Usuários podem gerenciar seus próprios pagamentos"
ON public.pagamentos
USING (auth.uid() = id_fotografo)
WITH CHECK (auth.uid() = id_fotografo);

-- Políticas RLS para portfólio
CREATE POLICY "Usuários podem gerenciar seu próprio portfólio"
ON public.portfolio
USING (auth.uid() = id_fotografo)
WITH CHECK (auth.uid() = id_fotografo);

-- Políticas RLS para imagens do portfólio
CREATE POLICY "Usuários podem gerenciar imagens através do id_portfolio"
ON public.portfolio_imagens
USING (EXISTS (
    SELECT 1 FROM public.portfolio
    WHERE id = portfolio_imagens.id_portfolio
    AND id_fotografo = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.portfolio
    WHERE id = portfolio_imagens.id_portfolio
    AND id_fotografo = auth.uid()
));

-- Políticas RLS para mensagens
CREATE POLICY "Usuários podem gerenciar suas próprias mensagens"
ON public.mensagens
USING (auth.uid() = id_fotografo)
WITH CHECK (auth.uid() = id_fotografo);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_fotografo_data ON agendamentos(id_fotografo, data_inicio);
CREATE INDEX IF NOT EXISTS idx_pagamentos_fotografo_status ON pagamentos(id_fotografo, status);
CREATE INDEX IF NOT EXISTS idx_contratos_fotografo_status ON contratos(id_fotografo, status);
CREATE INDEX IF NOT EXISTS idx_portfolio_fotografo_publicado ON portfolio(id_fotografo, publicado); 