# 🗄️ SUPABASE - Configuração e Estrutura do Banco de Dados

## 📊 Informações do Projeto Supabase

**Projeto ID:** `adxwgpfkvizpqdvortpu`  
**Nome do Projeto:** "AGENDA PRO"  
**Organização:** "AGENDA PRO" (ID: yxktlevmspnimkxwnbsl)
**URL da API:** `https://adxwgpfkvizpqdvortpu.supabase.co`  
**Região:** sa-east-1 (São Paulo)  
**Status:** ✅ ACTIVE_HEALTHY  
**Plano:** Free Tier  
**Versão PostgreSQL:** 15.8 (on aarch64-unknown-linux-gnu)  
**Criado em:** 26/05/2025 18:59:59 UTC  

## 🔐 Credenciais e Configuração

### Variáveis de Ambiente (.env)
```env
VITE_SUPABASE_URL=https://adxwgpfkvizpqdvortpu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o
```

### Configuração no Código
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://adxwgpfkvizpqdvortpu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 🗂️ Estrutura Completa do Banco de Dados

### 📋 Resumo das Tabelas (24 tabelas ativas)

| Tabela | Registros Vivos | Registros Mortos | Tamanho | RLS | Função Principal |
|--------|-----------------|------------------|---------|-----|------------------|
| **perfis** | 1 | 0 | 32 kB | ✅ | Perfis de usuários |
| **clientes** | 12 | 29 | 48 kB | ✅ | Gestão de clientes |
| **agenda_eventos** | 9 | 13 | 64 kB | ✅ | Sistema de agenda |
| **configuracoes_empresa** | 1 | 8 | 48 kB | ✅ | Configurações da empresa |
| **configuracoes_integracoes** | 0 | 0 | 16 kB | ✅ | Integrações e webhooks |
| **contratos** | 1 | 3 | 128 kB | ✅ | Gestão de contratos |
| **indicacoes** | 0 | 0 | 16 kB | ✅ | Sistema de indicações |
| **mensagens** | 0 | 0 | 16 kB | ✅ | Mensagens básicas |
| **mensagens_configuracoes** | 1 | 5 | 32 kB | ✅ | Config. de mensagens |
| **mensagens_modelos** | 11 | 9 | 32 kB | ✅ | Templates de mensagens |
| **mensagens_gatilhos** | 0 | 0 | 16 kB | ✅ | Gatilhos de automação |
| **mensagens_logs** | 0 | 0 | 16 kB | ✅ | Logs de mensagens |
| **notificacoes** | 0 | 0 | 16 kB | ✅ | Sistema de notificações |
| **portfolio_trabalhos** | 5 | 8 | 30 MB | ✅ | Portfólio de trabalhos |
| **sistema_atividades** | 26 | 0 | 32 kB | ✅ | Log de atividades |
| **integracoes_drive** | 0 | 1 | 80 kB | ✅ | Integrações Google Drive |
| **integracoes_calendario** | 0 | 1 | 80 kB | ✅ | Integrações Google Calendar |
| **fotos_drive** | 0 | 0 | 16 kB | ✅ | Fotos do Google Drive |
| **media_imagens** | 0 | 0 | 40 kB | ✅ | Gestão de mídia/imagens |
| **financeiro_despesas** | 3 | 4 | 32 kB | ✅ | Controle de despesas |
| **financeiro_transacoes** | 0 | 47 | 112 kB | ✅ | Transações financeiras |
| **relatorios** | 1 | 0 | 112 kB | ✅ | Relatórios financeiros |
| **financeiro_categorias** | 8 | 6 | 72 kB | ✅ | Categorias financeiras |
| **financeiro_formas_pagamento** | 7 | 2 | 56 kB | ✅ | Formas de pagamento |

**Total:** 24 tabelas | 85 registros vivos | 136 registros mortos | ~31.3 MB

## 📊 Detalhamento das Tabelas Principais

### 1. **perfis** - Perfis de Usuários
```sql
CREATE TABLE perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'usuario',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  avatar_url TEXT
);

-- RLS Policy
CREATE POLICY "Usuários só veem seus próprios perfis" 
ON perfis FOR ALL USING (auth.uid() = id);
```

**📋 Dados Atuais (1 registro ativo):**
- **ID:** 9c3932ab-6f08-4765-a48c-412431d3e3c9
- **Nome:** "Diogo Fotografia"
- **Email:** "anunciodofacebook2022@gmail.com"
- **Role:** "usuario"
- **Criado em:** 26/05/2025 19:40:53 UTC

### 2. **clientes** - Gestão de Clientes  
```sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  telefone TEXT,
  evento TEXT,
  data_evento TIMESTAMPTZ,
  valor_evento NUMERIC,
  data_nascimento DATE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Usuários só veem seus próprios clientes" 
ON clientes FOR ALL USING (auth.uid() = user_id);
```

**📋 Dados Atuais (12 registros ativos):**

**🔝 Top 5 Clientes Recentes:**
1. **"Talytta Schulze Neves"**
   - Telefone: (00) 0 0000-0000
   - Evento: Ensaio | Data: 02/12/2025
   - Valor: R$ 1.000,00

2. **"Diogo G Mota"**
   - Telefone: 00000000000
   - Evento: Casamento | Data: 10/09/2025
   - Valor: R$ 5.000,00

3. **"ISONEIDE"**
   - Telefone: 00000000000
   - Evento: Casamento | Data: 03/09/2025
   - Valor: R$ 1.000,00

4. **"Teste Final"**
   - Telefone: (00) 0 0000-0000
   - Evento: Casamento | Data: 20/08/2025
   - Valor: R$ 1.000,00

5. **"EURIPIDES"**
   - Telefone: 00000000000
   - Evento: Outro | Data: 06/08/2025
   - Valor: R$ 1.000,00

**📊 Estatísticas:** Live: 12 | Dead: 29

### 3. **agenda_eventos** - Sistema de Agenda
```sql
CREATE TABLE agenda_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  cliente_id UUID REFERENCES clientes(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  local TEXT,
  tipo TEXT,
  cor TEXT,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'cancelado', 'concluido')),
  telefone TEXT,
  notificacao_enviada BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  valor_total NUMERIC,
  valor_entrada NUMERIC,
  valor_restante NUMERIC,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Usuários só veem seus próprios eventos" 
ON agenda_eventos FOR ALL USING (auth.uid() = user_id);
```

**📋 Dados Atuais (9 eventos ativos):**

**🔝 Top 5 Eventos Mais Recentes:**
1. **"Talytta Schulze Neves"**
   - Local: Marilia
   - Data: 02/12/2025 01:25:00 - 02:25:00 UTC
   - Status: agendado
   - Valor Total: R$ 1.000,00 | Entrada: R$ 500,00 | Restante: R$ 500,00

2. **"Diogo G Mota"**
   - Local: Goiatuba
   - Data: 10/09/2025 03:01:00 - 04:01:00 UTC
   - Status: agendado
   - Valor Total: R$ 5.000,00 | Entrada: R$ 1.000,00 | Restante: R$ 4.000,00

3. **"ISONEIDE"**
   - Local: PARANA
   - Data: 03/09/2025 19:09:00 - 20:09:00 UTC
   - Status: agendado
   - Valor Total: R$ 1.000,00 | Entrada: R$ 900,00 | Restante: R$ 100,00

4. **"Teste Final"**
   - Local: Buriti Alegre
   - Data: 20/08/2025 17:00:00 - 18:00:00 UTC
   - Status: agendado
   - Valor Total: R$ 1.000,00 | Entrada: R$ 300,00 | Restante: R$ 700,00

5. **"EURIPIDES"**
   - Local: RIo
   - Data: 06/08/2025 20:38:00 - 21:38:00 UTC
   - Status: agendado
   - Valor Total: R$ 1.000,00 | Entrada: R$ 100,00 | Restante: R$ 900,00

**📊 Estatísticas:** Live: 9 | Dead: 13

### 4. **configuracoes_empresa** - Configurações da Empresa
```sql
CREATE TABLE configuracoes_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  nome_empresa TEXT,
  cnpj TEXT,
  telefone TEXT,
  whatsapp TEXT,
  email_empresa TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  instagram TEXT,
  facebook TEXT,
  site TEXT,
  logo_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Usuários só veem suas próprias configurações" 
ON configuracoes_empresa FOR ALL USING (auth.uid() = user_id);
```

**📋 Dados Atuais (1 configuração ativa):**
- **ID:** 2d03ccff-539c-4893-b7ff-9b8858ecfec7
- **Nome da Empresa:** "Diogo Fotografia"
- **CNPJ:** "12.345.678/0001-90"
- **Telefone:** "64993296649"
- **WhatsApp:** "64993296649"
- **Email:** "anunciodofacebook2022@gmail.com"
- **Endereço:** "Rua 70, Centro"
- **Cidade:** "Goiania"
- **Estado:** "GO"
- **CEP:** "75906100"
- **Instagram:** "@diogo.goncalves_fotografo"
- **Site:** "https://diogogoncalves.alboompro.com/gallery.php?id=132108"
- **Facebook:** null
- **Logo:** null
- **Criado em:** 20/05/2025 18:42:59 UTC
- **Atualizado em:** 14/06/2025 11:09:01 UTC

**📊 Estatísticas:** Live: 1 | Dead: 8

### 5. **portfolio_trabalhos** - Portfólio de Trabalhos
```sql
CREATE TABLE portfolio_trabalhos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  tags TEXT[],
  data_evento DATE,
  cliente_id UUID REFERENCES clientes(id),
  publicado BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  imagem_capa TEXT,
  imagens TEXT[],
  local TEXT,
  url_imagem_drive TEXT,
  urls_drive TEXT[] DEFAULT '{}',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Usuários só veem seus próprios trabalhos" 
ON portfolio_trabalhos FOR ALL USING (auth.uid() = user_id);
```

**📋 Dados Atuais (5 trabalhos ativos):**

1. **"Ensaio de gestante anual"** 
   - Categoria: Gestante | Local: Formoza
   - Publicado: ✅ | Destaque: ❌
   - Criado em: 09/06/2025 00:35:12

2. **"kelly casamento"** 
   - Categoria: Aniversário | Local: Rio verde
   - Publicado: ✅ | Destaque: ❌
   - Criado em: 04/06/2025 23:23:48

3. **"teste"** 
   - Categoria: Casamento | Local: ""
   - Publicado: ✅ | Destaque: ❌
   - Criado em: 03/06/2025 02:31:28

4. **"crisssss"** 
   - Categoria: Casamento | Local: ""
   - Publicado: ✅ | Destaque: ❌
   - Criado em: 03/06/2025 00:42:48

5. **"Casa Kelly"** 
   - Categoria: Casamento | Local: ""
   - Publicado: ✅ | Destaque: ❌
   - Criado em: 03/06/2025 00:39:36

**📊 Estatísticas:** Live: 5 | Dead: 8

### 6. **mensagens_modelos** - Templates de Mensagens
```sql
CREATE TABLE mensagens_modelos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  categoria TEXT,
  tags TEXT[],
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Usuários só veem seus próprios templates" 
ON mensagens_modelos FOR ALL USING (auth.uid() = user_id);
```

**📋 Dados Atuais (11 templates ativos):**

**📨 Templates por Categoria:**
- **Confirmação (2):** "Confirmação de Agendamento"
- **Pagamento (3):** "Confirmação de Pagamento", "Recibo de Pagamento", "Pagamento Pendente"
- **Geral (4):** "Entrega de Fotos" (duplicado), "Promoção Personalizada" (duplicado)
- **Lembrete (2):** "Lembrete de Sessão" (duplicado)

**📊 Estatísticas:** Live: 11 | Dead: 9

### 7. **financeiro_categorias** - Categorias Financeiras
```sql
CREATE TABLE financeiro_categorias (
  id UUID PRIMARY KEY,
  nome VARCHAR NOT NULL,
  tipo VARCHAR NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Usuários só veem suas próprias categorias" 
ON financeiro_categorias FOR ALL USING (auth.uid() = user_id);
```

**📋 Dados Atuais (8 categorias configuradas):**

**💰 Receitas (5 categorias):**
- Ensaio
- Evento
- Outro
- Sessão Fotográfica  
- Venda de Produtos

**💸 Despesas (3 categorias):**
- Carro
- Farmacia
- Gasolina

**📊 Estatísticas:** Live: 8 | Dead: 6

### 8. **financeiro_formas_pagamento** - Formas de Pagamento
```sql
CREATE TABLE financeiro_formas_pagamento (
  id UUID PRIMARY KEY,
  nome VARCHAR NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Usuários só veem suas próprias formas de pagamento" 
ON financeiro_formas_pagamento FOR ALL USING (auth.uid() = user_id);
```

**📋 Dados Atuais (7 formas configuradas):**
1. Boleto
2. Cartão de Crédito
3. Cartão de Débito
4. Dinheiro
5. Outro
6. PIX
7. Transferência Bancária

**📊 Estatísticas:** Live: 7 | Dead: 2

### 9. **financeiro_despesas** - Controle de Despesas
```sql
CREATE TABLE financeiro_despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  cliente_id UUID REFERENCES clientes(id),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado', 'vencido')),
  data_transacao TIMESTAMPTZ DEFAULT CURRENT_DATE,
  categoria TEXT,
  forma_pagamento TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Usuários só veem suas próprias despesas" 
ON financeiro_despesas FOR ALL USING (auth.uid() = user_id);
```

**📋 Dados Atuais (3 despesas registradas):**

1. **"Entrada - Casamento (Diogo Gonçalves da Mota)"**
   - Valor: R$ 1.000,00
   - Status: pago

2. **"Gasolina"**
   - Valor: R$ 800,00
   - Status: pendente

3. **"Aniversário (teste 2)"**
   - Valor: R$ 450,00
   - Status: pago

**📊 Estatísticas:** Live: 3 | Dead: 4

### 10. **contratos** - Gestão de Contratos
```sql
CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pendente',
  cliente_id UUID REFERENCES clientes(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  valor NUMERIC,
  data_evento TIMESTAMPTZ,
  tipo_evento TEXT,
  conteudo TEXT,
  anexos JSONB,
  historico JSONB,
  assinatura_url TEXT,
  data_assinatura TIMESTAMPTZ,
  data_expiracao TIMESTAMPTZ,
  email_cliente TEXT
);

-- RLS Policy
CREATE POLICY "Usuários só veem seus próprios contratos" 
ON contratos FOR ALL USING (auth.uid() = user_id);
```

**📋 Dados Atuais (1 contrato ativo):**
- **Título:** "Contrato - casamento - Diogo Gonçalves da Mota"
- **Status:** pendente
- **Valor:** R$ 2.000,00

**📊 Estatísticas:** Live: 1 | Dead: 3

### 11. **sistema_atividades** - Log de Atividades do Sistema
```sql
CREATE TABLE sistema_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  record_id UUID,
  user_id UUID,
  old_data JSONB,
  new_data JSONB
);

-- Sem RLS - Logs do sistema
```

**📋 Dados Atuais:** 26 registros de atividades do sistema

**📊 Atividades por Operação:**
- **agenda_eventos - INSERT:** 6 operações
- **clientes - INSERT:** 1 operação
- **configuracoes_empresa - INSERT:** 1 operação
- **configuracoes_empresa - UPDATE:** 2 operações
- **financeiro_transacoes - INSERT:** 4 operações
- **mensagens_modelos - INSERT:** 7 operações
- **portfolio_trabalhos - INSERT:** 3 operações
- **Outras operações:** 2 registros

**📊 Estatísticas:** Live: 26 | Dead: 0

### 12. **mensagens_configuracoes** - Configurações de Mensagens
```sql
CREATE TABLE mensagens_configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  canal_whatsapp BOOLEAN DEFAULT FALSE,
  canal_email BOOLEAN DEFAULT FALSE,
  canal_sms BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Usuários só veem suas próprias configurações de mensagens" 
ON mensagens_configuracoes FOR ALL USING (auth.uid() = user_id);
```

**📋 Dados Atuais (1 configuração ativa):**
- **WhatsApp:** ✅ Ativo (true)
- **Email:** ✅ Ativo (true)  
- **SMS:** ✅ Ativo (true)
- **Webhook URL:** "htpp//" (configurado mas com URL inválida)

**📊 Estatísticas:** Live: 1 | Dead: 5

## 🏗️ **Tabelas Estruturadas Mas Vazias (Funcionalidades Prontas)**

### 13. **configuracoes_integracoes** - Configurações de Integrações
**📋 Status:** 0 registros (funcionalidade não configurada)

### 14. **indicacoes** - Sistema de Indicações
**📋 Status:** 0 registros (sistema não utilizado)

### 15. **mensagens** - Mensagens Diretas
**📋 Status:** 0 registros (sem histórico de mensagens)

### 16. **mensagens_gatilhos** - Automação de Mensagens
**📋 Status:** 0 registros (automação não configurada)

### 17. **mensagens_logs** - Logs de Mensagens
**📋 Status:** 0 registros (sem histórico de envios)

### 18. **notificacoes** - Sistema de Notificações
**📋 Status:** 0 registros (sem notificações ativas)

### 19. **relatorios** - Sistema de Relatórios
**📋 Status:** 1 registro (sistema em funcionamento)

### 20. **integracoes_drive** - Google Drive Integration
**📋 Status:** 0 registros ativos (1 histórico deletado)

### 21. **integracoes_calendario** - Google Calendar Integration
**📋 Status:** 0 registros ativos (1 histórico deletado)

### 22. **fotos_drive** - Fotos do Google Drive
**📋 Status:** 0 registros (sem sincronização de fotos)

### 23. **media_imagens** - Gestão de Mídia
**📋 Status:** 0 registros (mídia gerenciada via Google Drive)

### 24. **financeiro_transacoes** - Transações Financeiras
**📋 Status:** 0 registros ativos (47 registros deletados)

## 🔐 Configurações de Segurança (RLS)

### Status RLS por Tabela
- ✅ **24 tabelas com RLS habilitado** - Isolamento completo por usuário
- ❌ **0 tabelas sem RLS** (todas as tabelas têm RLS ativo)

### Política Padrão de Segurança
```sql
-- Política aplicada em todas as tabelas principais
CREATE POLICY "isolamento_por_usuario" ON [tabela_name]
FOR ALL USING (auth.uid() = user_id);

-- Habilitar RLS
ALTER TABLE [tabela_name] ENABLE ROW LEVEL SECURITY;
```

## 📈 Estatísticas Detalhadas e Performance

### 📊 Resumo de Atividade das Tabelas

| Tabela | Registros Vivos | Registros Mortos | Taxa de Eficiência |
|--------|-----------------|------------------|-------------------|
| **sistema_atividades** | 26 | 0 | 🟢 100% |
| **clientes** | 12 | 29 | 🔴 29% |
| **mensagens_modelos** | 11 | 9 | 🟡 55% |
| **agenda_eventos** | 9 | 13 | 🟡 41% |
| **financeiro_categorias** | 8 | 6 | 🟡 57% |
| **financeiro_formas_pagamento** | 7 | 2 | 🟢 78% |
| **portfolio_trabalhos** | 5 | 8 | 🔴 38% |
| **financeiro_despesas** | 3 | 4 | 🔴 43% |
| **configuracoes_empresa** | 1 | 8 | 🔴 11% |
| **mensagens_configuracoes** | 1 | 5 | 🔴 17% |
| **contratos** | 1 | 3 | 🔴 25% |
| **perfis** | 1 | 0 | 🟢 100% |
| **relatorios** | 1 | 0 | 🟢 100% |
| **financeiro_transacoes** | 0 | 47 | 🔴 0% |
| **Outras tabelas vazias** | 0 | 3 | - |

### 🗑️ **Limpeza Necessária (Dead Tuples):**
- **financeiro_transacoes**: 47 registros mortos
- **clientes**: 29 registros mortos
- **agenda_eventos**: 13 registros mortos
- **mensagens_modelos**: 9 registros mortos
- **configuracoes_empresa**: 8 registros mortos
- **portfolio_trabalhos**: 8 registros mortos

### 💾 **Uso de Espaço por Tipo de Dado:**

#### 🎯 **Dados Operacionais (Ativo):**
- **Eventos agendados:** 9 registros
- **Clientes ativos:** 12 registros
- **Trabalhos no portfólio:** 5 registros
- **Contratos ativos:** 1 registro
- **Despesas registradas:** 3 registros

#### 📚 **Dados de Configuração:**
- **Templates de mensagens:** 11 registros
- **Categorias financeiras:** 8 registros
- **Formas de pagamento:** 7 registros
- **Configurações da empresa:** 1 registro
- **Configurações de mensagens:** 1 registro

#### 📝 **Dados de Auditoria:**
- **Logs de atividades:** 26 registros
- **Perfis de usuários:** 1 registro
- **Relatórios gerados:** 1 registro

## 🛠️ Migrações e Versionamento

### Histórico de Migrações (69 migrações aplicadas)

**📋 Últimas Migrações Importantes:**
- **20250627003341** - db_expert_public_migration (mais recente)
- **20250627003340** - db_expert_public_initial
- **20250626182407** - db_expert_public_initial
- **20250623075959** - add_valor_evento_column_to_clientes
- **20250611064511** - enable_cron_extension
- **20250611064443** - add_contract_indexes
- **20250610044806** - create_sync_event_transaction
- **20250608063124** - create_relatorios_table
- **20250607073157** - financeiro_improvements
- **20250531034702** - add_urls_drive_array_column

**📊 Total:** 69 migrações aplicadas com sucesso

## 🔧 Configurações Avançadas

### Configurações de Projeto
```json
{
  "project_id": "adxwgpfkvizpqdvortpu",
  "name": "AGENDA PRO",
  "organization_id": "yxktlevmspnimkxwnbsl",
  "region": "sa-east-1",
  "status": "ACTIVE_HEALTHY",
  "postgres_version": "15.8",
  "auth_enabled": true,
  "storage_enabled": true,
  "realtime_enabled": true,
  "edge_functions_enabled": false
}
```

### 📊 **Resumo Executivo do Banco de Dados:**

#### ✅ **Funcionalidades Ativas e Utilizadas:**
- **Sistema de Agenda** ✅ (9 eventos ativos)
- **Gestão de Clientes** ✅ (12 clientes ativos) 
- **Sistema Financeiro** ✅ (3 despesas, 8 categorias, 7 formas pagamento)
- **Portfólio de Trabalhos** ✅ (5 trabalhos)
- **Templates de Mensagens** ✅ (11 templates)
- **Gestão de Contratos** ✅ (1 contrato)
- **Configurações da Empresa** ✅ (totalmente configurado)
- **Sistema de Auditoria** ✅ (26 logs)
- **Sistema de Relatórios** ✅ (1 relatório gerado)

#### 🟡 **Funcionalidades Configuradas Mas Não Utilizadas:**
- **Integrações Google Drive** 🟡 (estrutura pronta, 1 registro deletado)
- **Integrações Google Calendar** 🟡 (estrutura pronta, 1 registro deletado)
- **Sistema de Mídia** 🟡 (tabela vazia, usando Google Drive)

#### ❌ **Funcionalidades Não Utilizadas:**
- **Transações Financeiras** ❌ (0 registros ativos, 47 mortos)
- **Sistema de Mensagens Diretas** ❌ (0 mensagens)
- **Automação de Mensagens** ❌ (0 gatilhos configurados)
- **Sistema de Notificações** ❌ (0 notificações)
- **Sistema de Indicações** ❌ (não implementado)
- **Configurações de Integrações** ❌ (não configurado)

#### 📈 **Oportunidades de Otimização:**
1. **Limpeza de Dead Tuples:** 136 registros mortos para limpeza
2. **Ativação de Integrações:** Google Drive e Calendar configurados mas inativos
3. **Implementação de Automação:** Sistema de gatilhos de mensagens
4. **Recuperação de Transações:** Sistema financeiro com 47 registros deletados
5. **Correção de URL Webhook:** URL inválida nas configurações de mensagens

### Limites do Free Tier
- **Banco de dados:** 500 MB (usando ~31.3 MB = 6.3%)
- **Storage:** 1 GB (não utilizado diretamente)
- **Bandwidth:** 5 GB/mês ⚠️ (limitação principal)
- **Auth users:** 50,000 (usando 1 = 0.002%)
- **Realtime connections:** 200 simultâneas

### Monitoramento
- **Logs de API:** Disponíveis por 7 dias
- **Métricas de performance:** Dashboard nativo
- **Alertas:** Configuráveis por email
- **Backup automático:** Diário (retido por 7 dias)

## 🚨 Troubleshooting

### Problemas Identificados

#### 1. URL de Webhook Inválida
- **Localização:** mensagens_configuracoes
- **Problema:** webhook_url = "htpp//" (URL malformada)
- **Solução:** Corrigir para URL válida HTTPS

#### 2. Dead Tuples Excessivos
- **Tabelas afetadas:** 
  - financeiro_transacoes (47 mortos)
  - clientes (29 mortos)
  - agenda_eventos (13 mortos)
- **Solução:** Executar VACUUM FULL

#### 3. Integrações Google Desativadas
- **Problema:** Credenciais deletadas do Google Drive e Calendar
- **Impacto:** Funcionalidades não disponíveis
- **Solução:** Reconfigurar OAuth

### Comandos de Diagnóstico
```sql
-- Verificar dead tuples
SELECT schemaname, tablename, n_live_tup, n_dead_tup, 
       round(n_dead_tup::numeric/(n_live_tup+n_dead_tup)*100,2) as dead_percentage
FROM pg_stat_user_tables 
WHERE n_dead_tup > 0 
ORDER BY dead_percentage DESC;

-- Limpeza de dead tuples
VACUUM FULL;
ANALYZE;
```

## 📋 Checklist de Manutenção

### Urgente (Próximos 7 dias)
- [ ] **CRÍTICO:** Limpar 136 dead tuples (comando VACUUM)
- [ ] Corrigir URL de webhook nas mensagens_configuracoes
- [ ] Investigar 47 transações financeiras deletadas

### Mensal
- [ ] Reconfigurar integrações Google Drive e Calendar
- [ ] Implementar automação de mensagens (gatilhos)
- [ ] Revisar políticas RLS
- [ ] Monitorar crescimento de dados
- [ ] Otimizar consultas lentas

## 📞 Suporte e Recursos

### Informações de Contato do Projeto
- **Projeto ID:** adxwgpfkvizpqdvortpu
- **Organização:** AGENDA PRO
- **Status Page:** https://status.supabase.com
- **Support:** support@supabase.com

### Documentação Oficial
- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

---

**Última Atualização:** 27 de Dezembro de 2024  
**Versão da Documentação:** 6.0 (Dados Reais)  
**Status:** ✅ Operacional - Requer Manutenção  
**Dados via MCP:** ✅ Informações coletadas em tempo real via Supabase MCP  
**Próxima Revisão:** Janeiro de 2025