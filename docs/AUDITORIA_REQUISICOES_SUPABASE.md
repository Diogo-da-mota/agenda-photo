# 🎯 PLANO DE AÇÃO SEGMENTADO - CACHE NO CLIENTE (SUPABASE)

## 📋 **ESTRATÉGIA DE IMPLEMENTAÇÃO SEGURA**

### 🛡️ **PRINCÍPIOS DE SEGURANÇA**
- ✅ **Alterações pontuais** em arquivos específicos
- ✅ **Uma mudança por vez** com validação
- ✅ **Preservar toda funcionalidade existente**
- ✅ **Manter visual/UX inalterados**
- ✅ **Backup mental** antes de cada alteração

---

## 🔍 **AUDITORIA DO ESTADO ATUAL**

### **✅ JÁ IMPLEMENTADO (NÃO REPETIR):**
- [x] React Query configurado globalmente
- [x] `refetchOnWindowFocus: false` 
- [x] `staleTime: 5 minutos` (melhor que sugestão Supabase de 1min)
- [x] Hooks customizados para queries
- [x] Real-time subscriptions SQL habilitadas
- [x] Colunas atualizadas (imagem_capa, imagens)

### **❌ AINDA NÃO IMPLEMENTADO:**
- [ ] Real-time subscriptions no código React
- [ ] Prefetching inteligente
- [ ] Optimistic updates
- [ ] Invalidação específica por mudanças
- [ ] Infinite queries (se necessário)

---

## 🎯 **PARTE 1: REAL-TIME SUBSCRIPTIONS (MAIOR IMPACTO)**
**Redução estimada:** 40% das requisições restantes

### **1.1 - Criar Hook Central de Subscriptions**
**Arquivo:** `src/hooks/useSupabaseRealtime.ts` (CRIAR NOVO)

#### **🔍 O QUE FAZER:**
```typescript
// ✅ CRIAR ARQUIVO NOVO:
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useSupabaseRealtime = (userId: string) => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    if (!userId) return
    
    const subscriptions = [
      // Financeiro
      supabase.channel(`financeiro_${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'financeiro_transacoes',
          filter: `user_id=eq.${userId}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['financeiro-resumo', userId] })
          queryClient.invalidateQueries({ queryKey: ['financeiro-transacoes', userId] })
        }),
        
      // Agenda
      supabase.channel(`agenda_${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'agenda_eventos', 
          filter: `user_id=eq.${userId}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['agenda-eventos', userId] })
        }),
        
      // Clientes
      supabase.channel(`clientes_${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'clientes',
          filter: `user_id=eq.${userId}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['clientes', userId] })
        })
    ]
    
    subscriptions.forEach(sub => sub.subscribe())
    
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
    }
  }, [userId, queryClient])
}
```

#### **🛡️ VALIDAÇÃO:**
- [ ] Arquivo criado sem erros
- [ ] Imports corretos
- [ ] TypeScript sem warnings

---

### **1.2 - Integrar Hook no App Principal**
**Arquivo:** `src/App.tsx` ou `src/layouts/DashboardLayout.tsx`

#### **🔍 O QUE FAZER:**
```typescript
// ✅ ADICIONAR import:
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'

// ✅ DENTRO do componente principal (onde tem acesso ao userId):
function DashboardLayout() {
  const { user } = useAuth()
  
  // ✅ ADICIONAR esta linha:
  useSupabaseRealtime(user?.id)
  
  // ... resto do componente
}
```

#### **🛡️ VALIDAÇÃO:**
- [ ] Hook executado sem erros
- [ ] Subscriptions ativas (verificar no Supabase Dashboard)
- [ ] Invalidações funcionando quando dados mudam

---

## 🎯 **PARTE 2: PREFETCHING INTELIGENTE (MÉDIO IMPACTO)**
**Melhoria estimada:** 30% na percepção de velocidade

### **2.1 - Dashboard: Prefetch ao Hover**
**Arquivo:** `src/pages/Dashboard/Dashboard.tsx`

#### **🔍 O QUE FAZER:**
```typescript
// ✅ ADICIONAR no componente Dashboard:
const queryClient = useQueryClient()

const prefetchFinanceiro = () => {
  queryClient.prefetchQuery({
    queryKey: ['financeiro-detalhes', user?.id],
    queryFn: () => buscarFinanceiroDetalhado(user?.id),
    staleTime: 1000 * 60 * 5 // 5 minutos
  })
}

const prefetchAgenda = () => {
  queryClient.prefetchQuery({
    queryKey: ['agenda-proximos-eventos', user?.id],
    queryFn: () => buscarProximosEventos(user?.id),
    staleTime: 1000 * 60 * 5
  })
}

// ✅ NO JSX, adicionar aos cards:
<Card onMouseEnter={prefetchFinanceiro}>
  <h3>Financeiro</h3>
  {/* conteúdo do card */}
</Card>

<Card onMouseEnter={prefetchAgenda}>
  <h3>Agenda</h3>
  {/* conteúdo do card */}
</Card>
```

#### **🛡️ VALIDAÇÃO:**
- [ ] Hover dispara prefetch (verificar no DevTools)
- [ ] Navegação para página fica instantânea
- [ ] Não há erros de rede

---

### **2.2 - Listas: Prefetch de Detalhes**
**Arquivo:** `src/components/clientes/ClientesList.tsx` (ou similar)

#### **🔍 O QUE FAZER:**
```typescript
// ✅ ADICIONAR prefetch aos itens da lista:
const prefetchCliente = (clienteId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => buscarClienteDetalhes(clienteId),
    staleTime: 1000 * 60 * 10 // 10 minutos
  })
}

// ✅ NO JSX dos itens da lista:
<div 
  key={cliente.id}
  onMouseEnter={() => prefetchCliente(cliente.id)}
>
  {cliente.nome}
</div>
```

#### **🛡️ VALIDAÇÃO:**
- [ ] Hover em item dispara prefetch
- [ ] Clique no item carrega instantaneamente
- [ ] Performance da lista não afetada

---

## 🎯 **PARTE 3: OPTIMISTIC UPDATES (MÉDIO IMPACTO)**
**Melhoria estimada:** Interface mais responsiva

### **3.1 - Financeiro: Optimistic para Transações**
**Arquivo:** `src/hooks/financeiro/useFinanceiroMutations.ts`

#### **🔍 O QUE FAZER:**
```typescript
// ✅ ATUALIZAR mutation existente:
export const useAdicionarTransacao = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: adicionarTransacao,
    
    // ✅ ADICIONAR optimistic update:
    onMutate: async (novaTransacao) => {
      await queryClient.cancelQueries({ queryKey: ['financeiro-transacoes'] })
      
      const previousTransacoes = queryClient.getQueryData(['financeiro-transacoes'])
      
      queryClient.setQueryData(['financeiro-transacoes'], old => [
        { ...novaTransacao, id: 'temp-' + Date.now() },
        ...(old || [])
      ])
      
      return { previousTransacoes }
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(['financeiro-transacoes'], context.previousTransacoes)
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['financeiro-transacoes'] })
      queryClient.invalidateQueries({ queryKey: ['financeiro-resumo'] })
    }
  })
}
```

#### **🛡️ VALIDAÇÃO:**
- [ ] Transação aparece instantaneamente na lista
- [ ] Se erro, transação é removida
- [ ] Dados corretos após confirmação do servidor

---

### **3.2 - Clientes: Optimistic Updates**
**Arquivo:** `src/hooks/clientes/useClientesMutations.ts`

#### **🔍 APLICAR MESMO PADRÃO** da etapa 3.1 para:
- Adicionar cliente
- Editar cliente
- Deletar cliente

---

## 🎯 **PARTE 4: INFINITE QUERIES (BAIXO IMPACTO)**
**Para listas muito grandes (>100 itens)**

### **4.1 - Avaliar Necessidade**
**Arquivos:** Componentes de lista principais

#### **🔍 O QUE VERIFICAR:**
- Quantos clientes o usuário médio tem?
- Quantas transações por página?
- Há performance issues com listas atuais?

#### **✅ SE NECESSÁRIO, implementar:**
```typescript
// ✅ APENAS se listas >100 itens:
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['clientes-infinite', userId],
  queryFn: ({ pageParam = 0 }) => buscarClientes(userId, pageParam),
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length === 20 ? allPages.length * 20 : undefined
  },
  staleTime: 1000 * 60 * 10
})
```

#### **🛡️ VALIDAÇÃO:**
- [ ] Scroll infinito funciona suavemente
- [ ] Performance melhor que paginação
- [ ] Memória não cresce excessivamente

---

## 🎯 **PARTE 5: OTIMIZAÇÃO DE CONFIGURAÇÕES**
**Ajustes finos baseados nas recomendações Supabase**

### **5.1 - Atualizar Configuração Global**
**Arquivo:** `src/lib/react-query-config.ts`

#### **🔍 O QUE FAZER:**
```typescript
// ✅ VERIFICAR se já temos (não duplicar):
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // ✅ Manter 5min (melhor que Supabase)
      gcTime: 15 * 60 * 1000,        // ✅ Adicionar se não existe
      refetchOnWindowFocus: false,    // ✅ Já implementado
      retry: 3,                       // ✅ Confirmar se está configurado
      refetchOnReconnect: true,       // ✅ Adicionar para conexão perdida
    },
  },
})
```

#### **🛡️ VALIDAÇÃO:**
- [ ] Configurações aplicadas globalmente
- [ ] Cache persiste conforme esperado
- [ ] Reconexão funciona adequadamente

---

## 📋 **CHECKLIST DE EXECUÇÃO SEGURA**

### **✅ ANTES DE CADA PARTE:**
- [ ] Confirmar que parte anterior funciona
- [ ] Identificar arquivos exatos
- [ ] Ter backup mental do estado atual
- [ ] Não há erros no console

### **✅ DURANTE CADA ALTERAÇÃO:**
- [ ] Alterar apenas código específico
- [ ] Não mexer em outros arquivos
- [ ] Manter funcionalidade existente
- [ ] Preservar visual

### **✅ APÓS CADA PARTE:**
- [ ] Testar funcionalidade afetada
- [ ] Verificar React Query DevTools
- [ ] Confirmar que real-time funciona
- [ ] Validar performance

### **✅ SINAIS DE ALERTA (PARAR IMEDIATAMENTE):**
- 🚨 Erro no console
- 🚨 Dados não carregam
- 🚨 Interface travada
- 🚨 Subscriptions não funcionam

---

## 🎯 **ORDEM DE EXECUÇÃO RECOMENDADA**

### **SEMANA 1: FOUNDATION**
1. **Parte 1.1** - Criar hook de real-time (maior impacto)
2. **Parte 1.2** - Integrar no app principal
3. **Validar** que subscriptions funcionam

### **SEMANA 2: PERFORMANCE**  
4. **Parte 2.1** - Prefetch no dashboard
5. **Parte 3.1** - Optimistic updates financeiro
6. **Validar** melhoria na responsividade

### **SEMANA 3: POLISH**
7. **Parte 2.2** - Prefetch em listas
8. **Parte 5.1** - Otimizar configurações
9. **Auditoria final**

---

## 🔍 **TEMPLATE PARA CADA EXECUÇÃO**

```
CURSOR: Vou executar PARTE [X.X] do plano de cache no cliente.

📁 ARQUIVO: [nome do arquivo]
🎯 OBJETIVO: [implementar real-time/prefetch/etc]

✅ VOU ADICIONAR:
[código novo específico]

🛡️ GARANTIAS:
- Não vou alterar funcionalidade existente
- Não vou mexer em outros arquivos
- Vou preservar toda lógica atual
- Visual permanecerá idêntico

📊 RESULTADO ESPERADO:
[o que deve melhorar]

Pode prosseguir?
```

---

## 🏆 **AUDITORIA FINAL OBRIGATÓRIA**

### **📊 MÉTRICAS PARA VALIDAR:**
- [ ] **Real-time:** Mudanças refletem automaticamente
- [ ] **Prefetch:** Navegação instantânea em páginas principais
- [ ] **Optimistic:** Interface responsiva em operações CRUD
- [ ] **Performance:** Carregamento igual ou melhor
- [ ] **Funcionalidade:** Todas as features funcionam igual

### **📋 CHECKLIST DE CONFORMIDADE:**
- [ ] ❌ **Não mudei nenhuma funcionalidade** ✅
- [ ] ❌ **Não criei arquivos desnecessários** ✅  
- [ ] ❌ **Não alterei lógica de negócio** ✅
- [ ] ❌ **Não mudei visual do site** ✅
- [ ] ❌ **Não modifiquei arquivos não relacionados** ✅

**Está pronto para começar com a PARTE 1.1?**