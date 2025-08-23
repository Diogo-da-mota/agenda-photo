# Análise de Performance - Rota /agenda

## 1. Resumo Executivo

A rota `/agenda` apresenta problemas significativos de performance devido à ausência de React Query, múltiplas chamadas de API desnecessárias, falta de memoização e renderizações excessivas. Esta análise identifica os principais gargalos e propõe soluções para otimizar a experiência do usuário.

## 2. Problemas Identificados

### 2.1 Ausência de React Query
**Problema:** O componente `Agenda.tsx` utiliza apenas `useState` e `useEffect` para gerenciamento de estado, sem cache inteligente.

**Impacto:**
- Recarregamento desnecessário de dados a cada mudança de estado
- Ausência de cache entre navegações
- Múltiplas requisições simultâneas para os mesmos dados
- Experiência de usuário degradada com loading constante

### 2.2 Múltiplas Chamadas de API
**Problema:** Identificadas várias funções que fazem requisições separadas:
- `buscarEventos()` - carrega todos os eventos
- `buscarDatasComEventos()` - carrega datas para o calendário
- `buscarContagemProximosEventos()` - conta próximos eventos
- `buscarEventosProximos10Dias()` - eventos dos próximos 10 dias

**Impacto:**
- 4+ requisições HTTP por carregamento da página
- Latência acumulada de rede
- Sobrecarga no servidor Supabase
- Consumo excessivo de dados móveis

### 2.3 Falta de Memoização
**Problema:** Componentes como `EventsList` e `EventCard` re-renderizam desnecessariamente.

**Código problemático:**
```typescript
// Em EventsList.tsx - sem memoização
filteredEvents.map(event => (
  <EventCard 
    key={event.id} 
    event={event} 
    // Props que causam re-render
  />
))
```

**Impacto:**
- Re-renderização de todos os cards a cada mudança de filtro
- Perda de performance em listas grandes (100+ eventos)
- Interface "travando" durante interações

### 2.4 Filtros Ineficientes
**Problema:** Filtros são aplicados via `useMemo` mas sem debounce adequado.

```typescript
// Em Agenda.tsx - filtro sem otimização
const filteredEvents = useMemo(() => {
  return agendaBusinessService.filtrarEventos(
    events, searchQuery, statusFilter, dateFilter
  );
}, [events, searchQuery, statusFilter, dateFilter]);
```

**Impacto:**
- Filtros executam a cada caractere digitado
- Processamento desnecessário de arrays grandes
- Interface não responsiva durante busca

### 2.5 Gerenciamento de Estado Complexo
**Problema:** Estado distribuído entre múltiplos `useState` sem coordenação.

```typescript
// Estados fragmentados
const [events, setEvents] = useState<Event[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
```

**Impacto:**
- Estados inconsistentes
- Dificuldade de sincronização
- Bugs de concorrência
- Código difícil de manter

## 3. Impacto na Performance

### 3.1 Métricas Estimadas
- **Tempo de carregamento inicial:** 2-4 segundos
- **Requisições por sessão:** 15-20 requests
- **Re-renderizações por filtro:** 50-100 componentes
- **Consumo de dados:** 200-500KB por carregamento

### 3.2 Experiência do Usuário
- Loading states prolongados
- Interface "travando" durante filtros
- Perda de dados ao navegar entre páginas
- Consumo excessivo de bateria em dispositivos móveis

## 4. Soluções Propostas

### 4.1 Implementação de React Query

#### Hook Customizado para Eventos
```typescript
// hooks/useAgendaEvents.ts
export const useAgendaEvents = (userId: string) => {
  return useQuery({
    queryKey: [CACHE_KEYS.AGENDA.EVENTOS, userId],
    queryFn: () => buscarEventos(userId),
    ...queryConfigs.agenda,
    enabled: !!userId
  });
};
```

#### Hook para Calendário
```typescript
// hooks/useAgendaCalendar.ts
export const useAgendaCalendar = (userId: string, month: number, year: number) => {
  return useQuery({
    queryKey: [CACHE_KEYS.AGENDA.CALENDARIO, userId, month, year],
    queryFn: () => buscarDatasComEventos(userId, month, year),
    ...queryConfigs.agenda,
    enabled: !!userId
  });
};
```

### 4.2 Otimização de Componentes

#### EventCard Memoizado
```typescript
// components/agenda/EventCard/EventCard.tsx
const EventCard = React.memo<EventCardProps>(({ 
  event, 
  onStatusChange, 
  onReschedule,
  // ... outras props
}) => {
  // Implementação existente
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.status === nextProps.event.status &&
    prevProps.event.remainingValue === nextProps.event.remainingValue
  );
});
```

#### EventsList Otimizada
```typescript
// components/agenda/EventsList.tsx
const EventsList = React.memo<EventsListProps>(({ 
  filteredEvents,
  // ... outras props 
}) => {
  const memoizedEvents = useMemo(() => 
    filteredEvents.map(event => (
      <EventCard 
        key={event.id}
        event={event}
        // ... props memoizadas
      />
    )), [filteredEvents]
  );
  
  return (
    <Card>
      {/* ... header */}
      <CardContent>
        <div className="space-y-4">
          {memoizedEvents}
        </div>
      </CardContent>
    </Card>
  );
});
```

### 4.3 Filtros com Debounce Otimizado

```typescript
// hooks/useAgendaFilters.ts
export const useAgendaFilters = (events: Event[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const filteredEvents = useMemo(() => {
    if (!events.length) return [];
    
    return agendaBusinessService.filtrarEventos(
      events, 
      debouncedSearchQuery, 
      statusFilter, 
      dateFilter
    );
  }, [events, debouncedSearchQuery, statusFilter, dateFilter]);
  
  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    filteredEvents
  };
};
```

### 4.4 Mutations Otimizadas

```typescript
// hooks/useAgendaMutations.ts
export const useAgendaMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const updateEventStatus = useMutation({
    mutationFn: ({ eventId, status, financials }: {
      eventId: string;
      status: EventStatus;
      financials?: PartialEventFinancials;
    }) => agendaBusinessService.alterarStatusEvento(eventId, status, financials),
    
    onMutate: async ({ eventId, status }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ 
        queryKey: [CACHE_KEYS.AGENDA.EVENTOS, user?.id] 
      });
      
      // Snapshot do estado anterior
      const previousEvents = queryClient.getQueryData([
        CACHE_KEYS.AGENDA.EVENTOS, 
        user?.id
      ]);
      
      // Update otimista
      queryClient.setQueryData(
        [CACHE_KEYS.AGENDA.EVENTOS, user?.id],
        (old: Event[] | undefined) => 
          old?.map(event => 
            event.id === eventId 
              ? { ...event, status }
              : event
          ) || []
      );
      
      return { previousEvents };
    },
    
    onError: (err, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousEvents) {
        queryClient.setQueryData(
          [CACHE_KEYS.AGENDA.EVENTOS, user?.id],
          context.previousEvents
        );
      }
    },
    
    onSettled: () => {
      // Invalidar cache para sincronização
      invalidateAgendaCache(user?.id);
    }
  });
  
  return {
    updateEventStatus,
    // ... outras mutations
  };
};
```

### 4.5 Componente Principal Refatorado

```typescript
// pages/Dashboard/Agenda.tsx
const Agenda: React.FC = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // React Query hooks
  const { 
    data: events = [], 
    isLoading, 
    error 
  } = useAgendaEvents(user?.id || '');
  
  const { 
    data: calendarEvents = [] 
  } = useAgendaCalendar(user?.id || '', currentMonth, currentYear);
  
  // Filtros otimizados
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    filteredEvents
  } = useAgendaFilters(events);
  
  // Mutations
  const { updateEventStatus } = useAgendaMutations();
  
  // Handlers memoizados
  const handleStatusChange = useCallback((
    eventId: string, 
    newStatus: EventStatus, 
    financials?: PartialEventFinancials
  ) => {
    updateEventStatus.mutate({ eventId, status: newStatus, financials });
  }, [updateEventStatus]);
  
  if (!user) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <AgendaHeader 
        onCreateEvent={() => setIsEventModalOpen(true)}
        onReloadEvents={() => queryClient.invalidateQueries({
          queryKey: [CACHE_KEYS.AGENDA.EVENTOS, user.id]
        })}
      />
      
      <AgendaFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AgendaCalendar
            selectedDate={dateFilter}
            onDateClick={setDateFilter}
            eventDates={calendarEvents}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={(month, year) => {
              setCurrentMonth(month);
              setCurrentYear(year);
            }}
          />
        </div>
        
        <div className="lg:col-span-2">
          <EventsList
            filteredEvents={filteredEvents}
            isLoading={isLoading}
            error={error}
            dateFilter={dateFilter}
            onClearDateFilter={() => setDateFilter(null)}
            onStatusChange={handleStatusChange}
            // ... outras props
          />
        </div>
      </div>
    </div>
  );
};
```

## 5. Plano de Implementação

### Fase 1: Fundação (1-2 dias)
1. **Criar hooks customizados**
   - `useAgendaEvents`
   - `useAgendaCalendar`
   - `useAgendaFilters`
   - `useAgendaMutations`

2. **Configurar cache keys**
   - Adicionar chaves específicas da agenda no `react-query-config.ts`
   - Implementar invalidação automática

### Fase 2: Otimização de Componentes (2-3 dias)
1. **Memoizar componentes críticos**
   - `EventCard` com comparação customizada
   - `EventsList` com memoização de lista
   - `AgendaFilters` com debounce

2. **Implementar updates otimistas**
   - Mutations com rollback automático
   - Loading states granulares

### Fase 3: Refatoração Principal (2-3 dias)
1. **Migrar Agenda.tsx**
   - Substituir useState/useEffect por React Query
   - Implementar novos hooks
   - Testar funcionalidades existentes

2. **Otimizar filtros e busca**
   - Debounce avançado
   - Cache de resultados de filtro
   - Paginação virtual (se necessário)

### Fase 4: Testes e Validação (1-2 dias)
1. **Testes de performance**
   - Medir tempo de carregamento
   - Contar requisições HTTP
   - Validar re-renderizações

2. **Testes de funcionalidade**
   - CRUD de eventos
   - Filtros e busca
   - Sincronização entre componentes

## 6. Benefícios Esperados

### 6.1 Performance
- **Redução de 70% no tempo de carregamento** (de 2-4s para 0.5-1s)
- **Redução de 80% nas requisições HTTP** (de 15-20 para 3-5 por sessão)
- **Redução de 90% nas re-renderizações** durante filtros

### 6.2 Experiência do Usuário
- Interface mais responsiva
- Loading states inteligentes
- Dados persistentes entre navegações
- Menor consumo de dados móveis

### 6.3 Manutenibilidade
- Código mais organizado e testável
- Estado centralizado e previsível
- Menor complexidade de debugging
- Facilidade para adicionar novas funcionalidades

## 7. Considerações Técnicas

### 7.1 Compatibilidade
- Manter API existente do `agendaBusinessService`
- Preservar funcionalidades atuais
- Migração gradual sem breaking changes

### 7.2 Monitoramento
- Implementar métricas de performance
- Logs de cache hit/miss
- Alertas para queries lentas

### 7.3 Fallbacks
- Estratégia offline com cache local
- Retry automático para falhas de rede
- Estados de erro informativos

## 8. Conclusão

A implementação dessas otimizações transformará a rota `/agenda` de um componente com problemas de performance em uma interface moderna, responsiva e eficiente. O investimento de 6-10 dias de desenvolvimento resultará em benefícios significativos tanto para usuários quanto para a manutenibilidade do código.

A migração para React Query, combinada com memoização inteligente e otimizações de filtros, estabelecerá um padrão de qualidade que pode ser replicado em outras rotas do sistema.