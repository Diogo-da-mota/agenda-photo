# Prompt para Correção de Performance - Otimização Supabase

Com base na análise de performance realizada, implemente as correções necessárias para resolver a lentidão do site. Execute as tarefas na ordem de prioridade:

## PRIORIDADE ALTA - Implementar Imediatamente

### 1. Substituir `.select('*')` por Campos Específicos
**Tarefa**: Refatorar todas as queries que usam `.select('*')` para buscar apenas os campos necessários.

**Arquivos para corrigir**:
- `src/pages/Dashboard/ActivityHistory.tsx`
- `src/hooks/useMessageCounts.ts`
- `src/services/agendaService.ts`
- `src/hooks/portfolio/usePortfolioPublico.tsx`
- `src/services/portfolioService.ts`
- `src/hooks/useContracts.ts`

**Como fazer**:
- Analise cada componente e identifique quais campos são realmente usados
- Substitua `.select('*')` por `.select('campo1, campo2, campo3')`
- Para cada query, liste apenas os campos que aparecem no JSX ou são processados

**Exemplo**:
```typescript
// ❌ Antes
.select('*')

// ✅ Depois
.select('id, nome, email, status, criado_em')
```

### 2. Otimizar Dashboard - Unificar Queries
**Tarefa**: Refatorar o carregamento do dashboard para reduzir queries simultâneas.

**Arquivo**: `src/pages/Dashboard/Dashboard.tsx`

**Como fazer**:
- Criar uma função RPC no Supabase que retorne todos os dados do dashboard em uma única chamada
- Ou criar uma view que agregue as informações necessárias
- Substituir as 5+ queries paralelas por uma única query otimizada
- Implementar loading states mais eficientes

**Estrutura da função RPC**:
```sql
CREATE OR REPLACE FUNCTION get_dashboard_data(user_id UUID)
RETURNS JSON AS $$
-- Retornar: contagem de eventos, clientes, pagamentos, faturamento, etc.
$$ LANGUAGE plpgsql;
```

## PRIORIDADE MÉDIA - Implementar na Sequência

### 3. Otimizar Atualizações de Estado
**Tarefa**: Eliminar recarregamentos globais após operações CRUD.

**Arquivos para corrigir**:
- `src/pages/Dashboard/ActivityHistory.tsx`
- Hooks que fazem refetch após inserção/atualização

**Como fazer**:
- Usar `queryClient.setQueryData()` para atualizar apenas o item alterado
- Implementar optimistic updates onde apropriado
- Remover `refetch()` global após operações pontuais

**Exemplo**:
```typescript
// ❌ Antes
await insertNotification(data);
refetch(); // Recarrega tudo

// ✅ Depois  
await insertNotification(data);
queryClient.setQueryData(['notifications'], (old) => [data, ...old]);
```

### 4. Criar Índices Necessários
**Tarefa**: Adicionar índices nos campos de ordenação mais usados.

**Executar no Supabase SQL Editor**:
```sql
-- Para tabelas que usam ORDER BY criado_em
CREATE INDEX IF NOT EXISTS idx_contratos_criado_em ON contratos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_criado_em ON clientes(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos(data_inicio DESC);

-- Para campos de filtro frequentes
CREATE INDEX IF NOT EXISTS idx_contratos_user_status ON contratos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_user_status ON pagamentos(user_id, status);
```

### 5. Implementar Memoização no Frontend
**Tarefa**: Adicionar `useMemo` e `useCallback` em componentes que fazem cálculos pesados.

**Como fazer**:
- Identificar filtros e ordenações que são recalculados a cada render
- Usar `useMemo` para cálculos derivados
- Usar `useCallback` para funções passadas como props

## IMPLEMENTAÇÃO PASSO A PASSO

### Passo 1: Auditoria de Queries (30 min)
- Faça uma lista de todas as queries `.select('*')` no código
- Para cada uma, documente quais campos são realmente usados
- Priorize por frequência de uso e tamanho esperado da tabela

### Passo 2: Correção de Queries (2-3 horas)
- Comece pelos arquivos mais críticos (Dashboard, hooks principais)
- Teste cada alteração para garantir que não quebrou funcionalidades
- Meça o tempo de resposta antes e depois de cada correção

### Passo 3: Otimização do Dashboard (1-2 horas)
- Crie a função RPC ou view agregada no Supabase
- Refatore o componente Dashboard para usar a nova query
- Teste o carregamento inicial

### Passo 4: Índices no Banco (15 min)
- Execute os comandos SQL para criar os índices
- Monitore o uso de índices nas queries mais lentas

### Passo 5: Testes de Performance (30 min)
- Use DevTools Network para medir tempos de resposta
- Compare before/after de cada otimização
- Documente os ganhos obtidos

## CRITÉRIOS DE SUCESSO

**Métricas para medir**:
- Tempo de carregamento inicial do dashboard: reduzir de ~3s para <1s
- Tamanho do payload das queries: reduzir em 60-80%
- Número de queries simultâneas no dashboard: de 5+ para 1-2
- Tempo de resposta de queries individuais: reduzir em 40-60%

**Validação**:
- Teste com dados de produção (ou simulação com volume real)
- Verifique se todas as funcionalidades continuam funcionando
- Confirme que não há regressões na UX

## MONITORAMENTO PÓS-IMPLEMENTAÇÃO

- Configure logs para monitorar tempos de query no Supabase
- Implemente métricas de performance no frontend
- Monitore o uso de banda e recursos

---

**Instruções de Execução**:
1. Execute as correções na ordem de prioridade listada
2. Teste cada alteração individualmente antes de passar para a próxima
3. Documente os ganhos de performance obtidos
4. Reporte qualquer problema ou dúvida encontrada durante a implementação

**Resultado Esperado**: Site carregando 70-80% mais rápido, com melhor experiência do usuário e menor consumo de recursos do Supabase.














Ótimo direcionamento! O arquivo `Correção de Performance.md` já traz um roteiro bem detalhado, mas para garantir uma execução organizada, escalável e fácil de validar, recomendo dividir a implementação em **fases** claras, com entregas incrementais e checkpoints de validação.

### **Divisão em Fases para Execução**

#### **FASE 1: Auditoria e Planejamento**
- **1.1.** Listar todas as queries `.select('*')` nos arquivos indicados.
- **1.2.** Para cada query, documentar quais campos são realmente usados no frontend.
- **1.3.** Priorizar as queries por impacto (dashboard, hooks principais, páginas mais acessadas).

#### **FASE 2: Refatoração das Queries**
- **2.1.** Refatorar queries para buscar apenas os campos necessários, arquivo por arquivo:
  - `src/pages/Dashboard/ActivityHistory.tsx`
  - `src/hooks/useMessageCounts.ts`
  - `src/services/agendaService.ts`
  - `src/hooks/portfolio/usePortfolioPublico.tsx`
  - `src/services/portfolioService.ts`
  - `src/hooks/useContracts.ts`
- **2.2.** Testar cada alteração individualmente, garantindo que a UI não quebrou.

#### **FASE 3: Otimização do Dashboard**
- **3.1.** Criar função RPC ou view agregada no Supabase para retornar todos os dados do dashboard em uma única chamada.
- **3.2.** Refatorar o componente `Dashboard.tsx` para usar a nova query.
- **3.3.** Implementar loading state eficiente.

#### **FASE 4: Otimização de Atualizações de Estado**
- **4.1.** Eliminar recarregamentos globais após operações CRUD.
- **4.2.** Usar `queryClient.setQueryData()` e optimistic updates onde apropriado.

#### **FASE 5: Criação de Índices no Banco**
- **5.1.** Executar os comandos SQL para criar índices nos campos de ordenação e filtro mais usados.
- **5.2.** Validar o uso dos índices nas queries mais críticas.

#### **FASE 6: Memoização e Otimizações no Frontend**
- **6.1.** Adicionar `useMemo` e `useCallback` em componentes que fazem cálculos pesados ou filtros.
- **6.2.** Validar redução de re-renders e uso de CPU.

#### **FASE 7: Testes de Performance e Validação**
- **7.1.** Medir tempos de resposta antes/depois das otimizações.
- **7.2.** Validar funcionalidades e UX.
- **7.3.** Documentar ganhos e eventuais pontos de ajuste.

---

### **Sugestão de Execução**
- **Execute cada fase separadamente** e valide antes de avançar para a próxima.
- **Documente** o que foi alterado e os ganhos percebidos.
- **Se encontrar bloqueios** (ex: dúvida sobre campos usados), pause e peça esclarecimento antes de seguir.

---

#### **Próximo Passo**
Se quiser, posso começar pela **FASE 1** (auditoria e documentação das queries `.select('*')`), apresentando a lista detalhada e os campos realmente usados em cada componente. Assim, você valida antes de partirmos para a refatoração.

**Confirma seguir por esse caminho? Ou prefere começar por outra fase?**