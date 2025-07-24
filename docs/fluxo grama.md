Este documento serve como um **raio-X completo** do sistema, permitindo compreender toda a arquitetura e facilitar a manutenção futura.

---

## 📊 FLUXOGRAMA DE NAVEGAÇÃO DO SISTEMA

### Fluxo Público e Autenticação:
```
[Página Inicial (/)] 
   ↓
[Login/Cadastro] ⟷ [Esqueci Senha]
   ↓                     ↑
   ├─→ [Autenticação de dois fatores] (se ativado)
   ↓                     ↑
[Verificação de Sessão] → [Portal do Cliente] (se perfil = cliente)
   ↓
[Dashboard Principal (/dashboard)] (se perfil = fotógrafo)
```

### Fluxo Principal do Fotógrafo:
```
[Dashboard Principal (/dashboard)]
   ↓
   ├─→ [Agenda (/agenda)] → [Modal: Novo Evento] → [Formulário do Evento]
   │                      → [Clique em Evento] → [Modal: Detalhes do Evento] → [Editar/Excluir]
   │
   ├─→ [Clientes (/clientes)] → [Botão: Novo Cliente] → [Formulário de Cliente]
   │                          → [Clique em Cliente] → [Perfil do Cliente] → [Histórico/Editar/Excluir]
   │                          → [Botão: Versão Simples] → [Clientes Simples (/clientes-simples)]
   │
   ├─→ [Financeiro (/financeiro)] → [Nova Transação] → [Formulário de Transação]
   │                              → [Filtros] → [Relatórios] → [Exportar]
   │
   ├─→ [Portfólio (/portfolio)] → [Novo Trabalho (/portfolio/novo)] → [Formulário de Trabalho]
   │                            → [Clique em Trabalho] → [Detalhes (/portfolio/:id)] → [Editar/Excluir]
   │                            → [Botão: Ver Galeria] → [Galeria Pública (/portfolio/galeria)]
   │
   ├─→ [Mensagens (/mensagens)] → [Nova Mensagem] → [Selecionar Modelo] → [Enviar]
   │                            → [Configurar Modelos] → [Editor de Modelos]
   │
   ├─→ [Contratos (/contratos)] → [Novo Contrato] → [Editor de Contrato]
   │                            → [Clique em Contrato] → [Detalhes (/contratos/:id)] → [Editar/Enviar]
   │
   ├─→ [Indicações (/indique-ganhe)] → [Nova Indicação] → [Formulário de Indicação]
   │
   └─→ [Configurações (/configuracoes)]
        ↓
        ├─→ [Aba: Perfil] → [Editar Dados Pessoais]
        │                 → [Alterar Senha] 
        │                 → [Configurar 2FA] → [Scan QR Code] → [Confirmar Código]
        │
        ├─→ [Aba: Empresa] → [Formulário Dados da Empresa]
        │                  → [Upload de Logo]
        │
        ├─→ [Aba: Segurança] → [Sessões Ativas] → [Botão: Revogar Sessão]
        │                    → [Alertas de Segurança] → [Resolver Alerta]
        │
        └─→ [Aba: Integrações] → [Configurar Webhooks]
                              → [Integrações com Terceiros]
```

### Fluxo Secundário do Fotógrafo:
```
[Dashboard Principal]
   ↓
   ├─→ [Notificações (/notificacoes)] → [Clique em Notificação] → [Navegar para contexto]
   │
   ├─→ [Relatórios (/relatorios)] → [Selecionar Período] → [Gerar Relatório] → [Exportar]
   │
   ├─→ [Atividades (/atividades)] → [Histórico de Ações] → [Filtrar por Data/Tipo]
   │
   ├─→ [Site (/site)] → [Configurar Aparência] → [Publicar Alterações]
   │
   ├─→ [Roadmap (/roadmap)] → [Visualizar Novidades Futuras]
   │
   └─→ [Diagnóstico (/diagnostico-supabase)] → [Verificar Tabelas] → [Resolver Problemas]
```

### Fluxo do Portal do Cliente:
```
[Login Cliente]
   ↓
[Portal do Cliente (/cliente)]
   ↓
   ├─→ [Minha Agenda (/cliente/agenda)] → [Visualizar Compromissos]
   │                                    → [Solicitar Novo Horário]
   │
   ├─→ [Pagamentos (/cliente/pagamentos)] → [Visualizar Faturas]
   │                                      → [Realizar Pagamento]
   │
   ├─→ [Contratos (/cliente/contratos)] → [Visualizar Contratos]
   │                                    → [Assinar Contrato (/cliente/contrato/:id)]
   │
   ├─→ [Solicitar Orçamento (/cliente/orcamento)] → [Formulário de Orçamento]
   │
   └─→ [Notificações (/cliente/notificacoes)] → [Visualizar Notificações]
```

### Fluxo de Integração:
```
[Dashboard] → [Configurações] → [Integrações]
   ↓
   ├─→ [WhatsApp] → [Configurar Webhook] → [Testar Conexão]
   │
   ├─→ [Google Drive] → [Autorizar Acesso] → [Configurar Pasta]
   │
   ├─→ [Calendário] → [Sincronizar com Google Calendar]
   │
   └─→ [Email] → [Configurar SMTP] → [Testar Envio]
```

### Fluxo de Segurança:
```
[Login] → [2FA (se ativado)] → [Verificação de Dispositivo]
   ↓
[Detecção de Novo Dispositivo] → [Alerta por Email] → [Confirmar Dispositivo]
   ↓
[Monitoramento de Atividades Suspeitas] → [Alerta de Segurança] → [Verificação]
   ↓
[Configurações] → [Segurança] → [Sessões Ativas] → [Revogar Acesso]
   ↓
[Alteração de Senha] → [Confirmação por Email] → [Revogar Sessões Anteriores]
```