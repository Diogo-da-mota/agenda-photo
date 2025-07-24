# 🗺️ FLUXOGRAMA COMPLETO DO SISTEMA BRIGHT SPARK WELCOME

Este documento serve como um **raio-X completo** do sistema, permitindo compreender toda a arquitetura e facilitar a manutenção futura.

---

## 📊 FLUXOGRAMA DE NAVEGAÇÃO DO SISTEMA

### 🌐 Fluxo Público (Rotas Não Protegidas):
```
[Página Inicial (/)] 
   ↓
   ├─→ [Funcionalidades (/funcionalidades)] → [Informações do Sistema]
   ├─→ [Sobre Nós (/sobre-nos)] → [História da Empresa]
   ├─→ [Blog (/blog)] → [Artigos e Novidades]
   ├─→ [Contato (/contact)] → [Formulário de Contato]
   ├─→ [Carreiras (/carreiras)] → [Oportunidades de Trabalho]
   │
   ├─→ [Páginas Legais]
   │   ├─→ [Termos (/terms)]
   │   ├─→ [Privacidade (/privacy)]
   │   ├─→ [Cookies (/cookies)]
   │   └─→ [LGPD (/lgpd)]
   │
   ├─→ [Portfólio Público]
   │   ├─→ [Galeria (/portfolio/galeria)] → [Visualizar Trabalhos]
   │   └─→ [Trabalho Específico (/portfolio/galeria/:id)] → [Detalhes do Trabalho]
   │
   ├─→ [Entrega de Fotos Pública (/entrega-fotos/:slug)] → [Galeria de Fotos do Cliente]
   ├─→ [Contrato Público (/contrato/:slug)] → [Visualizar/Assinar Contrato]
   ├─→ [Indicação (/r/:code)] → [Página de Indicação]
   │
   └─→ [Login/Cadastro] → [Autenticação] → [Verificação de Perfil]
                                          ↓
                                    [Cliente] → [Portal do Cliente]
                                          ↓
                                    [Fotógrafo] → [Dashboard Principal]
```

### 🏠 Fluxo Principal do Fotógrafo (Dashboard):
```
[Dashboard Principal (/dashboard)]
   ↓
   ├─→ [Agenda (/agenda)] → [Layout Específico sem Cabeçalho]
   │                      → [Modal: Novo Evento] → [Formulário do Evento]
   │                      → [Clique em Evento] → [Modal: Detalhes] → [Editar/Excluir]
   │
   ├─→ [Clientes (/clientes)] → [Botão: Novo Cliente] → [Formulário de Cliente]
   │                          → [Clique em Cliente] → [Perfil do Cliente] → [Histórico/Editar/Excluir]
   │                          → [Versão Simples (/clientes-simples)] → [Interface Simplificada]
   │
   ├─→ [Financeiro (/financeiro)] → [Nova Transação] → [Formulário de Transação]
   │                              → [Filtros] → [Relatórios] → [Exportar]
   │                              → [Integração com Agenda] → [Sincronização Automática]
   │
   ├─→ [Portfólio (/portfolio)] → [Gerenciar Trabalhos]
   │   ├─→ [Novo Trabalho (/portfolio/novo)] → [Formulário de Trabalho]
   │   ├─→ [Detalhes (/portfolio/:id)] → [Editar/Excluir Trabalho]
   │   ├─→ [Design (/portfolio/design)] → [Personalizar Aparência]
   │   ├─→ [Integrações (/portfolio/integracoes)] → [Conectar Serviços]
   │   └─→ [Domínio (/portfolio/dominio)] → [Configurar Domínio Personalizado]
   │
   ├─→ [Mensagens (/mensagens)] → [Sistema de Comunicação]
   │                            → [Nova Mensagem] → [Selecionar Template] → [Enviar]
   │                            → [Configurar Templates] → [Editor de Templates]
   │                            → [Histórico de Mensagens] → [Filtrar/Buscar]
   │
   ├─→ [Contratos (/contratos)] → [Gerenciamento de Contratos]
   │                            → [Novo Contrato] → [Editor de Contrato]
   │                            → [Detalhes (/contratos/:slug)] → [Editar/Enviar/Status]
   │                            → [Templates] → [Modelos Personalizados]
   │
   └─→ [Configurações] → [Redirecionamento para /configuracoes-empresa]
        ↓
        ├─→ [Empresa (/configuracoes-empresa)] → [Dados da Empresa] → [Upload de Logo]
        ├─→ [Preferências (/configuracoes-preferencias)] → [Configurações Pessoais]
        ├─→ [Integrações (/configuracoes-integracoes)] → [APIs e Webhooks]
        ├─→ [Imagens (/configuracoes-imagens)] → [Configurações de Upload]
        └─→ [Segurança (/configuracoes-seguranca)] → [2FA] → [Sessões Ativas]
```

### 🔧 Fluxo Administrativo (ADMIN ONLY):
```
[Dashboard Principal] (Admin)
   ↓
   ├─→ [Roadmap (/roadmap)] → [Visualizar Novidades Futuras] → [Planejamento]
   │
   ├─→ [Entrega de Fotos (/entrega-fotos)] → [Gerenciar Galerias]
   │   ├─→ [Administração (/entrega-fotos/admin)] → [Painel Administrativo]
   │   ├─→ [Escolher Album (/escolher-album)] → [Seleção de Fotos]
   │   └─→ [Sistema Automático] → [Expiração] → [Limpeza] → [Backup]
   │
   ├─→ [Portal do Cliente] → [Navegação por Abas]
   │   ├─→ [Dashboard (/cliente)] → [Visão Geral do Cliente]
   │   ├─→ [Agenda (/cliente/agenda)] → [Compromissos do Cliente]
   │   ├─→ [Pagamentos (/cliente/pagamentos)] → [Faturas e Pagamentos]
   │   ├─→ [Orçamento (/cliente/orcamento)] → [Solicitar Orçamento]
   │   ├─→ [Contratos (/cliente/contratos)] → [Lista de Contratos]
   │   ├─→ [Contrato (/cliente/contrato/:slug)] → [Detalhes do Contrato]
   │   └─→ [Notificações (/cliente/notificacoes)] → [Alertas do Cliente]
   │
   └─→ [Diagnóstico (/diagnostico-supabase)] → [Verificar Tabelas] → [Resolver Problemas]
```

### 📊 Fluxo de Relatórios e Atividades:
```
[Dashboard Principal]
   ↓
   ├─→ [Relatórios (/relatorios)] → [Selecionar Período] → [Gerar Relatório] → [Exportar]
   │                              → [Relatórios Financeiros] → [Gráficos e Métricas]
   │
   ├─→ [Atividades] → [Redirecionamento para /atividades-linha-do-tempo]
   │   ├─→ [Linha do Tempo (/atividades-linha-do-tempo)] → [Histórico Cronológico]
   │   ├─→ [Notificações (/atividades-notificacoes)] → [Alertas do Sistema]
   │   └─→ [Filtros (/atividades-filtros)] → [Filtrar por Data/Tipo/Usuário]
   │
   ├─→ [Indicações (/indique-ganhe)] → [Sistema de Indicações]
   │                                 → [Nova Indicação] → [Formulário de Indicação]
   │                                 → [Acompanhar Status] → [Comissões]
   │
   └─→ [Informações (/info)] → [Dados do Sistema] → [Versão] → [Suporte]
```

### 👤 Fluxo do Portal do Cliente (Acesso Direto):
```
[Login Cliente] → [Verificação de Perfil]
   ↓
[Portal do Cliente] → [Interface Simplificada]
   ↓
   ├─→ [Minha Agenda] → [Visualizar Compromissos] → [Solicitar Reagendamento]
   │
   ├─→ [Meus Pagamentos] → [Visualizar Faturas] → [Realizar Pagamento Online]
   │                     → [Histórico de Pagamentos] → [Comprovantes]
   │
   ├─→ [Meus Contratos] → [Visualizar Contratos] → [Status de Assinatura]
   │                    → [Assinar Contrato] → [Download PDF]
   │
   ├─→ [Solicitar Orçamento] → [Formulário Detalhado] → [Envio Automático]
   │
   ├─→ [Galeria de Fotos] → [Fotos Entregues] → [Download Individual/Lote]
   │
   └─→ [Notificações] → [Alertas Personalizados] → [Lembretes de Eventos]
```

### 🔄 Fluxo de Integração e Automação:
```
[Configurações] → [Integrações]
   ↓
   ├─→ [WhatsApp Business] → [Configurar Webhook] → [Testar Conexão] → [Mensagens Automáticas]
   │
   ├─→ [Google Drive] → [Autorizar Acesso] → [Configurar Pasta] → [Backup Automático]
   │
   ├─→ [Google Calendar] → [Sincronização Bidirecional] → [Eventos Automáticos]
   │
   ├─→ [Email/SMTP] → [Configurar Servidor] → [Testar Envio] → [Templates de Email]
   │
   ├─→ [Pagamentos] → [Gateway de Pagamento] → [PIX] → [Cartão] → [Boleto]
   │
   └─→ [Backup Automático] → [Supabase Storage] → [Limpeza Programada] → [Relatórios]
```

### 🔒 Fluxo de Segurança e Autenticação:
```
[Acesso ao Sistema]
   ↓
[Login] → [Verificação de Credenciais]
   ↓
   ├─→ [2FA Ativado?] → [Sim] → [Código 2FA] → [Verificação]
   │                  → [Não] → [Login Direto]
   ↓
[Verificação de Dispositivo]
   ↓
   ├─→ [Dispositivo Conhecido] → [Acesso Liberado]
   │
   └─→ [Novo Dispositivo] → [Alerta por Email] → [Confirmar Dispositivo]
                          → [Bloquear Acesso] → [Investigação]
   ↓
[Monitoramento Contínuo]
   ↓
   ├─→ [Atividade Suspeita] → [Alerta de Segurança] → [Bloqueio Temporário]
   │
   ├─→ [Múltiplas Sessões] → [Gerenciar Sessões] → [Revogar Acesso]
   │
   └─→ [Alteração de Senha] → [Confirmação por Email] → [Logout de Todas as Sessões]
```

### 🧪 Fluxo de Desenvolvimento e Testes:
```
[Dashboard] → [Área de Desenvolvimento]
   ↓
   ├─→ [Testes (/dashboard/testes)] → [Ambiente de Testes] → [Funcionalidades Beta]
   │
   ├─→ [Teste Supabase (/dashboard/teste-supabase)] → [Verificar Conexões] → [Upload Test]
   │
   ├─→ [Teste Bug Templates (/teste-bug-templates)] → [Correção de Bugs] → [Validação]
   │
   └─→ [Agenda Cliente (/agenda/cliente)] → [Acesso Direto sem Auth] → [Testes Públicos]
```

### 📱 Fluxo Responsivo e Performance:
```
[Acesso ao Sistema]
   ↓
[Detecção de Dispositivo]
   ↓
   ├─→ [Desktop] → [Interface Completa] → [Todas as Funcionalidades]
   │
   ├─→ [Tablet] → [Interface Adaptada] → [Navegação Touch-Friendly]
   │
   └─→ [Mobile] → [Interface Simplificada] → [Funcionalidades Essenciais]
                → [PWA] → [Instalação] → [Offline Mode]
   ↓
[Otimização de Performance]
   ↓
   ├─→ [Lazy Loading] → [Carregamento Sob Demanda] → [Melhor UX]
   │
   ├─→ [Cache Inteligente] → [Service Worker] → [Offline First]
   │
   └─→ [Compressão de Imagens] → [WebP] → [Responsive Images]
```

---

## 🎯 PONTOS DE ENTRADA PRINCIPAIS

### 🌐 **Públicos (Sem Autenticação)**
- **/** - Landing Page principal
- **/portfolio/galeria** - Vitrine pública de trabalhos
- **/entrega-fotos/:slug** - Galeria de fotos para clientes
- **/contrato/:slug** - Visualização/assinatura de contratos
- **/r/:code** - Páginas de indicação

### 🔐 **Protegidos (Com Autenticação)**
- **/dashboard** - Painel principal do fotógrafo
- **/agenda** - Agenda com layout específico
- **/cliente** - Portal do cliente (Admin only)

### ⚙️ **Administrativos (Admin Only)**
- **/roadmap** - Planejamento futuro
- **/entrega-fotos** - Gerenciamento de galerias
- **/diagnostico-supabase** - Ferramentas de diagnóstico

---

## 🔄 REDIRECIONAMENTOS AUTOMÁTICOS

- **/configuracoes** → **/configuracoes-empresa**
- **/atividades** → **/atividades-linha-do-tempo**
- **/indicacoes** → **/indique-ganhe**

---

## 📊 MÉTRICAS DE NAVEGAÇÃO

- **Total de Rotas**: 45+ rotas definidas
- **Rotas Públicas**: 15 rotas
- **Rotas Protegidas**: 25+ rotas
- **Rotas Admin**: 8 rotas
- **Layouts Especiais**: 4 layouts (Dashboard, Client, Agenda, ClientTab)