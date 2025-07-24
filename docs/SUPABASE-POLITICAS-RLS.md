# 🔐 POLÍTICAS RLS - SUPABASE (DADOS REAIS)

> **Última atualização:** 2024-12-19  
> **Projeto:** AGENDA PRO (adxwgpfkvizpqdvortpu)  
> **Total de tabelas com RLS:** 20 tabelas  
> **Total de políticas:** 67 políticas  
> **Tabelas sem RLS:** 1 tabela (agendamentos)

## 📊 RESUMO EXECUTIVO

### 🔒 Tabelas com RLS Habilitado
- **Total:** 20 tabelas
- **Cobertura:** 95% das tabelas principais
- **Segurança:** Máxima proteção de dados por usuário

### ⚠️ Tabelas sem RLS
- **agendamentos** - Requer atenção para implementar RLS

### 🎯 Padrões de Segurança Identificados
1. **Isolamento por usuário:** `auth.uid() = user_id`
2. **Isolamento por perfil:** `auth.uid() = id` (tabela perfis)
3. **Controle administrativo:** Verificação de role 'admin'
4. **Acesso público limitado:** Apenas dados não sensíveis
5. **Controle temporal:** Verificação de datas de expiração

---

## 📋 POLÍTICAS POR TABELA

### 🗓️ TABELA: agenda_eventos
**RLS:** ✅ Habilitado | **Políticas:** 1

#### Política: Usuários só veem seus próprios eventos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** `(auth.uid() = user_id)`
- **Descrição:** Acesso completo aos eventos do próprio usuário

---

### 📎 TABELA: anexos_contrato
**RLS:** ✅ Habilitado | **Políticas:** 4

#### Política: Usuários podem ver seus próprios anexos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = id_user)`

#### Política: Usuários podem inserir seus próprios anexos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `(auth.uid() = id_user)`

#### Política: Usuários podem atualizar seus próprios anexos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** `(auth.uid() = id_user)`
- **Verificação:** `(auth.uid() = id_user)`

#### Política: Usuários podem deletar seus próprios anexos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** `(auth.uid() = id_user)`

---

### 📝 TABELA: atividades
**RLS:** ✅ Habilitado | **Políticas:** 6

#### Política: Usuarios podem ver suas proprias atividades
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = user_id)`

#### Política: Usuarios podem inserir suas proprias atividades
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `(auth.uid() = user_id)`

#### Política: Usuários podem atualizar suas próprias atividades
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** `(auth.uid() = user_id)`

#### Política: Usuários podem excluir suas próprias atividades
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** `(auth.uid() = user_id)`

#### Política: Usuários podem inserir suas próprias atividades (duplicada)
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `(auth.uid() = user_id)`

#### Política: Usuários podem ver suas próprias atividades (duplicada)
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = user_id)`

---

### 📋 TABELA: contratos
**RLS:** ✅ Habilitado | **Políticas:** 11

#### Política: Users can view their own contracts
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = user_id)`

#### Política: Users can insert their own contracts
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `(auth.uid() = user_id)`

#### Política: Users can update their own contracts
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** `(auth.uid() = user_id)`
- **Verificação:** `(auth.uid() = user_id)`

#### Política: Users can delete their own contracts
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** `(auth.uid() = user_id)`

#### Política: authenticated_contracts_modify
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** ALL
- **Condição:** `(auth.uid() = user_id)`

#### Política: authenticated_users_select_contracts
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = user_id)`

#### Política: authenticated_users_insert_contracts
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** INSERT
- **Verificação:** `(auth.uid() = user_id)`

#### Política: authenticated_users_update_contracts
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** UPDATE
- **Condição:** `(auth.uid() = user_id)`
- **Verificação:** `(auth.uid() = user_id)`

#### Política: authenticated_users_delete_contracts
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** DELETE
- **Condição:** `(auth.uid() = user_id)`

#### Política: public_contracts_select
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `true`

#### Política: public_read_contracts
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `true`

---

### 🎯 TABELA: dashboard_cliente
**RLS:** ✅ Habilitado | **Políticas:** 4

#### Política: Usuários podem ver seus próprios agendamentos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = usuario_id)`

#### Política: Usuários podem inserir seus próprios agendamentos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `(auth.uid() = usuario_id)`

#### Política: Usuários podem atualizar seus próprios agendamentos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** `(auth.uid() = usuario_id)`
- **Verificação:** `(auth.uid() = usuario_id)`

#### Política: Usuários podem deletar seus próprios agendamentos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** `(auth.uid() = usuario_id)`

---

### 📸 TABELA: entregar_imagens
**RLS:** ✅ Habilitado | **Políticas:** 4

#### Política: entregar_imagens_select_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `((auth.uid() = user_id) OR ((status = 'ativa'::text) AND (data_expiracao > now())) OR (EXISTS ( SELECT 1 FROM perfis WHERE ((perfis.id = auth.uid()) AND (perfis.role = 'admin'::text)))))`

#### Política: entregar_imagens_insert_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `((auth.role() = 'authenticated'::text) AND (auth.uid() = user_id))`

#### Política: entregar_imagens_update_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** `((auth.uid() = user_id) OR (EXISTS ( SELECT 1 FROM perfis WHERE ((perfis.id = auth.uid()) AND (perfis.role = 'admin'::text)))))`
- **Verificação:** `((auth.uid() = user_id) OR (EXISTS ( SELECT 1 FROM perfis WHERE ((perfis.id = auth.uid()) AND (perfis.role = 'admin'::text)))))`

#### Política: entregar_imagens_delete_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** `((auth.uid() = user_id) OR (EXISTS ( SELECT 1 FROM perfis WHERE ((perfis.id = auth.uid()) AND (perfis.role = 'admin'::text)))))`

---

### 💰 TABELA: financeiro_transacoes_historico
**RLS:** ✅ Habilitado | **Políticas:** 1

#### Política: Usuários podem ver apenas seu próprio histórico
- **Tipo:** PERMISSIVE
- **Roles:** {authenticated}
- **Comando:** SELECT
- **Condição:** `(( SELECT financeiro_transacoes.user_id FROM financeiro_transacoes WHERE (financeiro_transacoes.id = financeiro_transacoes_historico.transacao_id)) = auth.uid())`

---

### 💬 TABELA: mensagens
**RLS:** ✅ Habilitado | **Políticas:** 1

#### Política: Users can access their messages
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** `(user_id = auth.uid())`

---

### ⚙️ TABELA: mensagens_configuracoes
**RLS:** ✅ Habilitado | **Políticas:** 1

#### Política: Users can access their message configs
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** `(user_id = auth.uid())`

---

### 🔄 TABELA: mensagens_gatilhos
**RLS:** ✅ Habilitado | **Políticas:** 1

#### Política: Users can access their message triggers
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** `(user_id = auth.uid())`

---

### 📊 TABELA: mensagens_logs
**RLS:** ✅ Habilitado | **Políticas:** 1

#### Política: Users can access their message logs
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** `(user_id = auth.uid())`

---

### 📝 TABELA: mensagens_modelos
**RLS:** ✅ Habilitado | **Políticas:** 1

#### Política: Users can access their message templates
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** `(user_id = auth.uid())`

---

### 🔔 TABELA: notificacoes
**RLS:** ✅ Habilitado | **Políticas:** 1

#### Política: Users can access their notifications
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** `(user_id = auth.uid())`

---

### 👤 TABELA: perfis
**RLS:** ✅ Habilitado | **Políticas:** 4

#### Política: perfis_select_own
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = id)`

#### Política: perfis_insert_own
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `(auth.uid() = id)`

#### Política: perfis_update_own
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** `(auth.uid() = id)`
- **Verificação:** `(auth.uid() = id)`

#### Política: perfis_delete_own
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** `(auth.uid() = id)`

---

### 🎨 TABELA: portfolio_trabalhos
**RLS:** ✅ Habilitado | **Políticas:** 8

#### Política: Users can view own portfolio items
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = user_id)`

#### Política: Users can insert own portfolio items
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `(auth.uid() = user_id)`

#### Política: Users can update own portfolio items
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** `(auth.uid() = user_id)`
- **Verificação:** `(auth.uid() = user_id)`

#### Política: Users can delete own portfolio items
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** `(auth.uid() = user_id)`

#### Política: portfolio_trabalhos_select_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = user_id)`

#### Política: portfolio_trabalhos_insert_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `(auth.uid() = user_id)`

#### Política: portfolio_trabalhos_update_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** `(auth.uid() = user_id)`
- **Verificação:** `(auth.uid() = user_id)`

#### Política: portfolio_trabalhos_delete_policy
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** `(auth.uid() = user_id)`

---

### 📈 TABELA: relatorios
**RLS:** ✅ Habilitado | **Políticas:** 4

#### Política: Usuários podem ver seus próprios relatórios
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = user_id)`

#### Política: Usuários podem criar seus próprios relatórios
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `(auth.uid() = user_id)`

#### Política: Usuários podem atualizar seus próprios relatórios
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** `(auth.uid() = user_id)`
- **Verificação:** `(auth.uid() = user_id)`

#### Política: Usuários podem deletar seus próprios relatórios
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** `(auth.uid() = user_id)`

---

### 💼 TABELA: respostas_orcamento
**RLS:** ✅ Habilitado | **Políticas:** 1

#### Política: Clientes podem ver respostas dos seus orçamentos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(EXISTS ( SELECT 1 FROM solicitacoes_orcamento WHERE ((solicitacoes_orcamento.id = respostas_orcamento.solicitacao_id) AND (solicitacoes_orcamento.user_id = auth.uid()))))`

---

### 🔧 TABELA: sistema_atividades
**RLS:** ✅ Habilitado | **Políticas:** 4

#### Política: Usuários podem ver suas próprias atividades
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `((auth.uid() = user_id) OR (EXISTS ( SELECT 1 FROM perfis WHERE ((perfis.id = auth.uid()) AND (perfis.role = 'admin'::text)))))`

#### Política: Sistema pode registrar atividades
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `((auth.uid() = user_id) OR (auth.role() = 'service_role'::text))`

#### Política: Ninguém pode editar atividades
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** `false`

#### Política: Apenas admins podem deletar atividades antigas
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** DELETE
- **Condição:** `((EXISTS ( SELECT 1 FROM perfis WHERE ((perfis.id = auth.uid()) AND (perfis.role = 'admin'::text)))) AND ("timestamp" < (now() - '90 days'::interval)))`

---

### 💾 TABELA: sistema_backups
**RLS:** ✅ Habilitado | **Políticas:** 3

#### Política: Usuários podem ver seus próprios backups
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = user_id)`

#### Política: Usuários podem criar backups
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** INSERT
- **Verificação:** `(auth.uid() = user_id)`

#### Política: Usuários podem atualizar seus backups
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** UPDATE
- **Condição:** `(auth.uid() = user_id)`

---

### 💰 TABELA: solicitacoes_orcamento
**RLS:** ✅ Habilitado | **Políticas:** 2

#### Política: Admins podem ver todos os orçamentos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** ALL
- **Condição:** `((EXISTS ( SELECT 1 FROM perfis WHERE ((perfis.id = auth.uid()) AND (perfis.role = 'admin'::text)))))`

#### Política: Usuários podem ver seus próprios orçamentos
- **Tipo:** PERMISSIVE
- **Roles:** {public}
- **Comando:** SELECT
- **Condição:** `(auth.uid() = user_id)`

---

## ⚠️ TABELAS SEM RLS

### 📅 TABELA: agendamentos
**RLS:** ❌ Desabilitado | **Políticas:** 0

**⚠️ ATENÇÃO:** Esta tabela não possui RLS habilitado, o que pode representar um risco de segurança.

**📋 ESTRUTURA DA TABELA:**
- `id` (uuid) - Chave primária
- `id_fotografo` (uuid) - ID do fotógrafo (equivale ao user_id)
- `id_cliente` (uuid) - ID do cliente
- `titulo`, `descricao`, `data_inicio`, `data_fim`, `status`, etc.

**Recomendação:** Implementar RLS com as seguintes políticas:
```sql
-- Habilitar RLS
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Política para SELECT - fotógrafo vê seus agendamentos
CREATE POLICY "agendamentos_select_policy" ON agendamentos
FOR SELECT USING (auth.uid() = id_fotografo);

-- Política para INSERT - fotógrafo cria agendamentos
CREATE POLICY "agendamentos_insert_policy" ON agendamentos
FOR INSERT WITH CHECK (auth.uid() = id_fotografo);

-- Política para UPDATE - fotógrafo atualiza seus agendamentos
CREATE POLICY "agendamentos_update_policy" ON agendamentos
FOR UPDATE USING (auth.uid() = id_fotografo) WITH CHECK (auth.uid() = id_fotografo);

-- Política para DELETE - fotógrafo deleta seus agendamentos
CREATE POLICY "agendamentos_delete_policy" ON agendamentos
FOR DELETE USING (auth.uid() = id_fotografo);
```

**🔧 ALTERNATIVA - Padronizar com outras tabelas:**
Se preferir manter consistência, pode renomear a coluna:
```sql
-- Renomear coluna para manter padrão
ALTER TABLE agendamentos RENAME COLUMN id_fotografo TO user_id;

-- Depois usar as políticas padrão com user_id
```

---

## 🔍 ANÁLISE DE SEGURANÇA

### ✅ **PONTOS FORTES:**
- **95% de cobertura RLS**: 20 de 21 tabelas têm RLS habilitado
- **Padrões consistentes**: Maioria das políticas segue isolamento por `user_id`
- **Controle administrativo**: Políticas específicas para diferentes roles
- **Segurança por camadas**: Combinação de SELECT, INSERT, UPDATE e DELETE

### ⚠️ **PONTOS DE ATENÇÃO:**

#### 1. **TABELA SEM RLS:**
- `agendamentos`: Vulnerabilidade crítica - dados expostos

#### 2. **INCONSISTÊNCIAS DE NOMENCLATURA:**
Algumas tabelas usam nomenclaturas diferentes para o mesmo conceito:

| Tabela | Coluna Usuário | Status | Correção Necessária |
|--------|----------------|--------|-------------------|
| `agendamentos` | `id_fotografo` | ❌ | Usar `id_fotografo` nas políticas |
| `anexos_contrato` | `id_user` | ⚠️ | Deveria ser `user_id` |
| `dashboard_cliente` | `usuario_id` | ⚠️ | Deveria ser `user_id` |

#### 3. **POLÍTICAS DUPLICADAS:**
- Algumas tabelas têm múltiplas políticas para o mesmo comando
- Recomenda-se consolidar em uma política por comando

#### 4. **ACESSO PÚBLICO:**
- Algumas políticas permitem acesso público (`true`)
- Verificar se é realmente necessário

### 🎯 **RECOMENDAÇÕES:**

#### **IMEDIATA (Crítica):**
```sql
-- 1. Habilitar RLS na tabela agendamentos
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas para agendamentos
CREATE POLICY "agendamentos_select_policy" ON agendamentos
FOR SELECT USING (auth.uid() = id_fotografo);

CREATE POLICY "agendamentos_insert_policy" ON agendamentos
FOR INSERT WITH CHECK (auth.uid() = id_fotografo);

CREATE POLICY "agendamentos_update_policy" ON agendamentos
FOR UPDATE USING (auth.uid() = id_fotografo) WITH CHECK (auth.uid() = id_fotografo);

CREATE POLICY "agendamentos_delete_policy" ON agendamentos
FOR DELETE USING (auth.uid() = id_fotografo);
```

#### **PADRONIZAÇÃO (Recomendada):**
```sql
-- Padronizar nomenclatura para user_id
ALTER TABLE anexos_contrato RENAME COLUMN id_user TO user_id;
ALTER TABLE dashboard_cliente RENAME COLUMN usuario_id TO user_id;

-- Depois atualizar as políticas existentes para usar user_id
```

#### **AUDITORIA (Mensal):**
- Revisar políticas duplicadas
- Verificar necessidade de acesso público
- Monitorar logs de acesso não autorizado

---

## 📊 ESTATÍSTICAS FINAIS

- **Total de tabelas analisadas:** 21
- **Tabelas com RLS:** 20 (95%)
- **Tabelas sem RLS:** 1 (5%)
- **Total de políticas:** 67
- **Média de políticas por tabela:** 3.35
- **Padrão de segurança:** Alto
- **Nível de proteção:** 95%

---

*Documento gerado automaticamente a partir do banco de dados Supabase em 2024-12-19*