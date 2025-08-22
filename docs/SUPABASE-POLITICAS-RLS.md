# POLÍTICAS RLS - SUPABASE

## TABELA: agenda_eventos

### Política: Users can access their events
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (user_id = auth.uid())

## TABELA: clientes

### Política: Users can access their clients
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (user_id = auth.uid())

## TABELA: configuracoes_empresa

### Política: Users can access their company configs
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (user_id = auth.uid())

## TABELA: configuracoes_integracoes

### Política: Users can access their integration configs
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (user_id = auth.uid())

## TABELA: contratos

### Política: Usuários podem ler seus próprios contratos
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** SELECT
- **Condição:** (auth.uid() = user_id)

### Política: Usuários podem criar contratos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** (auth.uid() = user_id)

### Política: Usuários podem atualizar seus próprios contratos
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** UPDATE
- **Condição:** (auth.uid() = user_id)
- **Verificação:** (auth.uid() = user_id)

### Política: Usuários podem deletar seus próprios contratos
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** DELETE
- **Condição:** (auth.uid() = user_id)

## TABELA: financeiro_categorias

### Política: select_own_categorias
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** (auth.uid() = user_id)

### Política: insert_own_categorias
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** (auth.uid() = user_id)

### Política: update_own_categorias
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** (auth.uid() = user_id)

### Política: delete_own_categorias
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** (auth.uid() = user_id)

## TABELA: financeiro_despesas

### Política: financeiro_despesas_select_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** (auth.uid() = user_id)

### Política: financeiro_despesas_insert_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** (auth.uid() = user_id)

### Política: financeiro_despesas_update_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** (auth.uid() = user_id)

### Política: financeiro_despesas_delete_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** (auth.uid() = user_id)

## TABELA: financeiro_formas_pagamento

### Política: select_own_formas_pagamento
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** (auth.uid() = user_id)

### Política: insert_own_formas_pagamento
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** (auth.uid() = user_id)

### Política: update_own_formas_pagamento
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** (auth.uid() = user_id)

### Política: delete_own_formas_pagamento
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** (auth.uid() = user_id)

## TABELA: financeiro_transacoes

### Política: Usuários podem ver apenas suas próprias transações
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** SELECT
- **Condição:** (auth.uid() = user_id)

### Política: Usuários podem inserir apenas suas próprias transações
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** (auth.uid() = user_id)

### Política: Usuários podem atualizar apenas suas próprias transações
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** UPDATE
- **Condição:** (auth.uid() = user_id)
- **Verificação:** (auth.uid() = user_id)

### Política: Usuários podem deletar apenas suas próprias transações
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** DELETE
- **Condição:** (auth.uid() = user_id)

## TABELA: fotos_drive

### Política: Usuário só vê suas fotos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** (auth.uid() = user_id)

### Política: fotos_drive_all_operations
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (auth.uid() = user_id)
- **Verificação:** (auth.uid() = user_id)

## TABELA: indicacoes

### Política: Users can access their referrals
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (user_id = auth.uid())

## TABELA: integracoes_calendario

### Política: Usuário pode gerenciar suas integrações calendar
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (usuario_id = auth.uid())

## TABELA: mensagens

### Política: Users can access their messages
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (user_id = auth.uid())

## TABELA: mensagens_configuracoes

### Política: Users can access their message configs
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (user_id = auth.uid())

## TABELA: mensagens_gatilhos

### Política: Users can access their message triggers
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (user_id = auth.uid())

## TABELA: mensagens_logs

### Política: Users can access their message logs
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (user_id = auth.uid())

## TABELA: mensagens_modelos

### Política: Users can access their message templates
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (user_id = auth.uid())

## TABELA: notificacoes

### Política: Users can access their notifications
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** (user_id = auth.uid())

## TABELA: perfis

### Política: perfis_select_own
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** (auth.uid() = id)

### Política: perfis_insert_own
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** (auth.uid() = id)

### Política: perfis_update_own
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** (auth.uid() = id)
- **Verificação:** (auth.uid() = id)

### Política: perfis_delete_own
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** (auth.uid() = id)

## TABELA: portfolio_trabalhos

### Política: Users can view own portfolio items
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** (auth.uid() = user_id)

### Política: Users can insert own portfolio items
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** (auth.uid() = user_id)

### Política: Users can update own portfolio items
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** (auth.uid() = user_id)
- **Verificação:** (auth.uid() = user_id)

### Política: Users can delete own portfolio items
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** (auth.uid() = user_id)

### Política: portfolio_trabalhos_select_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** (auth.uid() = user_id)

### Política: portfolio_trabalhos_insert_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** (auth.uid() = user_id)

### Política: portfolio_trabalhos_update_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** (auth.uid() = user_id)
- **Verificação:** (auth.uid() = user_id)

### Política: portfolio_trabalhos_delete_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** (auth.uid() = user_id)

## TABELA: relatorios

### Política: Usuários podem ver seus próprios relatórios
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** (auth.uid() = user_id)

### Política: Usuários podem criar seus próprios relatórios
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** (auth.uid() = user_id)

### Política: Usuários podem atualizar seus próprios relatórios
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** (auth.uid() = user_id)
- **Verificação:** (auth.uid() = user_id)

### Política: Usuários podem deletar seus próprios relatórios
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** (auth.uid() = user_id)

## TABELA: sistema_atividades

### Política: atividades_select_own
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** (auth.uid() = user_id)

### Política: atividades_insert_own
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** (auth.uid() = user_id)

## TABELA: usuarios

### Política: Usuários podem ver seus próprios dados
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** (auth.uid() = id)

## RESUMO POR TIPO DE OPERAÇÃO

### POLÍTICAS SELECT (Leitura)
- **Total:** 18 políticas
- **Padrão:** Usuários só veem seus próprios dados
- **Condição comum:** (auth.uid() = user_id) ou (auth.uid() = id)

### POLÍTICAS INSERT (Criação)
- **Total:** 16 políticas
- **Padrão:** Usuários só criam dados para si mesmos
- **Verificação comum:** (auth.uid() = user_id) ou (auth.uid() = id)

### POLÍTICAS UPDATE (Atualização)
- **Total:** 13 políticas
- **Padrão:** Usuários só atualizam seus próprios dados
- **Condição + Verificação:** (auth.uid() = user_id)

### POLÍTICAS DELETE (Exclusão)
- **Total:** 11 políticas
- **Padrão:** Usuários só deletam seus próprios dados
- **Condição comum:** (auth.uid() = user_id) ou (auth.uid() = id)

### POLÍTICAS ALL (Todas operações)
- **Total:** 11 políticas
- **Padrão:** Acesso completo aos próprios dados
- **Condição comum:** (user_id = auth.uid())

## TOTAL DE POLÍTICAS: 51 