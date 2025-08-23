# Guia de Implementação - Otimizações da Agenda

## 1. Estrutura de Arquivos Proposta

```
src/
├── hooks/
│   ├── agenda/
│   │   ├── useAgendaEvents.ts
│   │   ├── useAgendaCalendar.ts
│   │   ├── useAgendaFilters.ts
│   │   ├── useAgendaMutations.ts
│   │   └── index.ts
│   └── ...
├── pages/Dashboard/
│   ├── Agenda.tsx (refatorado)
│   └── components/Agenda/
│       ├── AgendaHeader.tsx
│       ├── AgendaFilters.tsx
│       ├── AgendaCalendar.tsx
│       └── EventsList.tsx (otimizado)
└── components/agenda/
    └── EventCard/
        └── EventCard.tsx (memoizado)
```

## 2. Implementação Detalhada dos Hooks

### 2.1 useAgendaEvents.ts

```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { buscarEventos } from '@/services/agendaService';
import { Event } from '@/components/agenda/types';
import { CACHE_KEYS, queryConfigs } from '@/lib/react-query-config';

export interface UseAgendaEventsOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

export const useAgendaEvents = (
  options: UseAgendaEventsOptions = {}
): UseQueryResult<Event[], Error> => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [CACHE_KEYS.AGENDA.EVENTOS, user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }
      return buscarEventos(user.id);
    },
    enabled: !!user?.id && (options.enabled ?? true),
    ...queryConfigs.agenda,
    ...(options.staleTime && { staleTime: options.staleTime }),
    ...(options.refetchInterval && { refetchInterval: options.refetchInterval }),
    meta: {
      errorMessage: 'Erro ao carregar eventos da agenda'
    }
  });
};

// Hook para eventos com auto-refresh (útil para dashboards)
export const useAgendaEventsLive = () => {
  return useAgendaEvents({
    refetchInterval: 30000, // 30 segundos
    staleTime: 1000 * 60 * 2 // 2 minutos
  });
};

// Hook para eventos com cache longo (útil para relatórios)
export const useAgendaEventsCached = () => {
  return useAgendaEvents({
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: true
  });
};
```

### 2.2 useAgendaCalendar.ts

```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { buscarDatasComEventos } from '@/services/agendaService';
import { EventoCalendario } from '@/services/agendaService';
import { CACHE_KEYS, queryConfigs } from '@/lib/react-query-config';

export const useAgendaCalendar = (
  month: number,
  year: number
): UseQueryResult<EventoCalendario[], Error> => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [CACHE_KEYS.AGENDA.CALENDARIO, user?.id, month, year],
    queryFn: () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }
      return buscarDatasComEventos(user.id, month, year);
    },
    enabled: !!user?.id,
    ...queryConfigs.agenda,
    // Cache mais longo para dados do calendário
    staleTime: 1000 * 60 * 5, // 5 minutos
    meta: {
      errorMessage: 'Erro ao carregar dados do calendário'
    }
  });
};

// Hook para pré-carregar meses adjacentes
export const useAgendaCalendarPrefetch = (currentMonth: number, currentYear: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!user?.id) return;
    
    // Pré-carregar mês anterior
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    queryClient.prefetchQuery({
      queryKey: [CACHE_KEYS.AGENDA.CALENDARIO, user.id, prevMonth, prevYear],
      queryFn: () => buscarDatasComEventos(user.id, prevMonth, prevYear),
      staleTime: 1000 * 60 * 5
    });
    
    // Pré-carregar próximo mês
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    queryClient.prefetchQuery({
      queryKey: [CACHE_KEYS.AGENDA.CALENDARIO, user.id, nextMonth, nextYear],
      queryFn: () => buscarDatasComEventos(user.id, nextMonth, nextYear),
      staleTime: 1000 * 60 * 5
    });
  }, [currentMonth, currentYear, user?.id, queryClient]);
};
```

### 2.3 useAgendaFilters.ts

```typescript
import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Event, EventStatus } from '@/components/agenda/types';
import { agendaBusinessService } from '@/services/agendaBusinessService';

export interface AgendaFilters {
  searchQuery: string;
  statusFilter: EventStatus | 'all';
  dateFilter: Date | null;
  sortBy: 'date' | 'client' | 'value';
  sortOrder: 'asc' | 'desc';
}

export interface UseAgendaFiltersReturn {
  filters: AgendaFilters;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: EventStatus | 'all') => void;
  setDateFilter: (date: Date | null) => void;
  setSortBy: (sort: AgendaFilters['sortBy']) => void;
  setSortOrder: (order: AgendaFilters['sortOrder']) => void;
  clearFilters: () => void;
  filteredEvents: Event[];
  isFiltering: boolean;
}

const DEFAULT_FILTERS: AgendaFilters = {
  searchQuery: '',
  statusFilter: 'all',
  dateFilter: null,
  sortBy: 'date',
  sortOrder: 'asc'
};

export const useAgendaFilters = (events: Event[]): UseAgendaFiltersReturn => {
  const [filters, setFilters] = useState<AgendaFilters>(DEFAULT_FILTERS);
  
  // Debounce da busca para evitar filtros excessivos
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);
  
  // Indicador se está filtrando (útil para loading states)
  const isFiltering = filters.searchQuery !== debouncedSearchQuery;
  
  // Filtros memoizados para performance
  const filteredEvents = useMemo(() => {
    if (!events.length) return [];
    
    let result = agendaBusinessService.filtrarEventos(
      events,
      debouncedSearchQuery,
      filters.statusFilter,
      filters.dateFilter
    );
    
    // Aplicar ordenação
    result = result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'client':
          comparison = a.clientName.localeCompare(b.clientName);
          break;
        case 'value':
          comparison = a.totalValue - b.totalValue;
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return result;
  }, [events, debouncedSearchQuery, filters.statusFilter, filters.dateFilter, filters.sortBy, filters.sortOrder]);
  
  // Setters otimizados
  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);
  
  const setStatusFilter = useCallback((status: EventStatus | 'all') => {
    setFilters(prev => ({ ...prev, statusFilter: status }));
  }, []);
  
  const setDateFilter = useCallback((date: Date | null) => {
    setFilters(prev => ({ ...prev, dateFilter: date }));
  }, []);
  
  const setSortBy = useCallback((sort: AgendaFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy: sort }));
  }, []);
  
  const setSortOrder = useCallback((order: AgendaFilters['sortOrder']) => {
    setFilters(prev => ({ ...prev, sortOrder: order }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);
  
  return {
    filters,
    setSearchQuery,
    setStatusFilter,
    setDateFilter,
    setSortBy,
    setSortOrder,
    clearFilters,
    filteredEvents,
    isFiltering
  };
};
```

### 2.4 useAgendaMutations.ts

```typescript
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Event, EventStatus, PartialEventFinancials } from '@/components/agenda/types';
import { agendaBusinessService } from '@/services/agendaBusinessService';
import { CACHE_KEYS, invalidateAgendaCache } from '@/lib/react-query-config';
import { logger } from '@/utils/logger';

export interface UseAgendaMutationsReturn {
  updateEventStatus: UseMutationResult<Event, Error, {
    eventId: string;
    status: EventStatus;
    financials?: PartialEventFinancials;
  }>;
  rescheduleEvent: UseMutationResult<Event, Error, {
    eventId: string;
    newDate: Date;
  }>;
  deleteEvent: UseMutationResult<void, Error, string>;
  sendReminder: UseMutationResult<void, Error, string>;
  generateReceipt: UseMutationResult<void, Error, string>;
}

export const useAgendaMutations = (): UseAgendaMutationsReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mutation para alterar status do evento
  const updateEventStatus = useMutation({
    mutationFn: async ({ eventId, status, financials }: {
      eventId: string;
      status: EventStatus;
      financials?: PartialEventFinancials;
    }) => {
      logger.debug(`[useAgendaMutations] Alterando status do evento ${eventId} para ${status}`);
      return agendaBusinessService.alterarStatusEvento(eventId, status, financials);
    },
    
    onMutate: async ({ eventId, status }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ 
        queryKey: [CACHE_KEYS.AGENDA.EVENTOS, user?.id] 
      });
      
      // Snapshot do estado anterior
      const previousEvents = queryClient.getQueryData<Event[]>([
        CACHE_KEYS.AGENDA.EVENTOS, 
        user?.id
      ]);
      
      // Update otimista
      queryClient.setQueryData<Event[]>(
        [CACHE_KEYS.AGENDA.EVENTOS, user?.id],
        (old) => 
          old?.map(event => 
            event.id === eventId 
              ? { ...event, status }
              : event
          ) || []
      );
      
      return { previousEvents };
    },
    
    onError: (error, variables, context) => {
      logger.error(`[useAgendaMutations] Erro ao alterar status:`, error);
      
      // Rollback em caso de erro
      if (context?.previousEvents) {
        queryClient.setQueryData(
          [CACHE_KEYS.AGENDA.EVENTOS, user?.id],
          context.previousEvents
        );
      }
      
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do evento. Tente novamente.",
        variant: "destructive"
      });
    },
    
    onSuccess: (updatedEvent) => {
      logger.debug(`[useAgendaMutations] Status alterado com sucesso`);
      
      toast({
        title: "Status alterado",
        description: `Status do evento alterado para ${updatedEvent.status}.`
      });
    },
    
    onSettled: () => {
      // Invalidar cache para sincronização
      invalidateAgendaCache(user?.id);
    }
  });
  
  // Mutation para reagendar evento
  const rescheduleEvent = useMutation({
    mutationFn: async ({ eventId, newDate }: {
      eventId: string;
      newDate: Date;
    }) => {
      logger.debug(`[useAgendaMutations] Reagendando evento ${eventId}`);
      return agendaBusinessService.reagendarEvento(eventId, newDate);
    },
    
    onSuccess: () => {
      toast({
        title: "Evento reagendado",
        description: "O evento foi reagendado com sucesso."
      });
    },
    
    onError: (error) => {
      logger.error(`[useAgendaMutations] Erro ao reagendar:`, error);
      
      toast({
        title: "Erro ao reagendar",
        description: "Não foi possível reagendar o evento. Tente novamente.",
        variant: "destructive"
      });
    },
    
    onSettled: () => {
      invalidateAgendaCache(user?.id);
    }
  });
  
  // Mutation para excluir evento
  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      logger.debug(`[useAgendaMutations] Excluindo evento ${eventId}`);
      return agendaBusinessService.excluirEvento(eventId);
    },
    
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ 
        queryKey: [CACHE_KEYS.AGENDA.EVENTOS, user?.id] 
      });
      
      const previousEvents = queryClient.getQueryData<Event[]>([
        CACHE_KEYS.AGENDA.EVENTOS, 
        user?.id
      ]);
      
      // Remover otimisticamente
      queryClient.setQueryData<Event[]>(
        [CACHE_KEYS.AGENDA.EVENTOS, user?.id],
        (old) => old?.filter(event => event.id !== eventId) || []
      );
      
      return { previousEvents };
    },
    
    onError: (error, eventId, context) => {
      logger.error(`[useAgendaMutations] Erro ao excluir:`, error);
      
      if (context?.previousEvents) {
        queryClient.setQueryData(
          [CACHE_KEYS.AGENDA.EVENTOS, user?.id],
          context.previousEvents
        );
      }
      
      toast({
        title: "Erro ao excluir evento",
        description: "Não foi possível excluir o evento. Tente novamente.",
        variant: "destructive"
      });
    },
    
    onSuccess: () => {
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso."
      });
    },
    
    onSettled: () => {
      invalidateAgendaCache(user?.id);
    }
  });
  
  // Mutation para enviar lembrete
  const sendReminder = useMutation({
    mutationFn: async (eventId: string) => {
      logger.debug(`[useAgendaMutations] Enviando lembrete para evento ${eventId}`);
      return agendaBusinessService.enviarLembrete(eventId);
    },
    
    onSuccess: () => {
      toast({
        title: "Lembrete enviado",
        description: "O lembrete foi enviado com sucesso."
      });
    },
    
    onError: (error) => {
      logger.error(`[useAgendaMutations] Erro ao enviar lembrete:`, error);
      
      toast({
        title: "Erro ao enviar lembrete",
        description: "Não foi possível enviar o lembrete. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation para gerar recibo
  const generateReceipt = useMutation({
    mutationFn: async (eventId: string) => {
      logger.debug(`[useAgendaMutations] Gerando recibo para evento ${eventId}`);
      return agendaBusinessService.gerarRecibo(eventId);
    },
    
    onSuccess: () => {
      toast({
        title: "Recibo gerado",
        description: "O recibo foi gerado com sucesso."
      });
    },
    
    onError: (error) => {
      logger.error(`[useAgendaMutations] Erro ao gerar recibo:`, error);
      
      toast({
        title: "Erro ao gerar recibo",
        description: "Não foi possível gerar o recibo. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  return {
    updateEventStatus,
    rescheduleEvent,
    deleteEvent,
    sendReminder,
    generateReceipt
  };
};
```

## 3. Métricas de Monitoramento

### 3.1 Hook para Métricas de Performance

```typescript
// hooks/usePerformanceMetrics.ts
import { useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';

export interface PerformanceMetrics {
  loadTime: number;
  renderCount: number;
  queryCount: number;
  cacheHitRate: number;
}

export const usePerformanceMetrics = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());
  const queryCount = useRef(0);
  const cacheHits = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
  });
  
  const trackQuery = (fromCache: boolean = false) => {
    queryCount.current += 1;
    if (fromCache) {
      cacheHits.current += 1;
    }
  };
  
  const getMetrics = (): PerformanceMetrics => {
    const loadTime = Date.now() - startTime.current;
    const cacheHitRate = queryCount.current > 0 
      ? (cacheHits.current / queryCount.current) * 100 
      : 0;
    
    return {
      loadTime,
      renderCount: renderCount.current,
      queryCount: queryCount.current,
      cacheHitRate
    };
  };
  
  const logMetrics = () => {
    const metrics = getMetrics();
    logger.info(`[Performance] ${componentName}:`, metrics);
  };
  
  return {
    trackQuery,
    getMetrics,
    logMetrics
  };
};
```

### 3.2 Componente de Debug de Performance

```typescript
// components/debug/PerformanceDebugger.tsx
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PerformanceDebuggerProps {
  componentName: string;
  visible?: boolean;
}

export const PerformanceDebugger: React.FC<PerformanceDebuggerProps> = ({
  componentName,
  visible = process.env.NODE_ENV === 'development'
}) => {
  const queryClient = useQueryClient();
  
  if (!visible) return null;
  
  const queryCache = queryClient.getQueryCache();
  const queries = queryCache.getAll();
  
  const agendaQueries = queries.filter(query => 
    query.queryKey.some(key => 
      typeof key === 'string' && key.includes('agenda')
    )
  );
  
  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-black/90 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          🔍 Performance Debug - {componentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Total Queries:</span>
          <Badge variant="secondary">{queries.length}</Badge>
        </div>
        <div className="flex justify-between">
          <span>Agenda Queries:</span>
          <Badge variant="secondary">{agendaQueries.length}</Badge>
        </div>
        <div className="space-y-1">
          <span className="font-semibold">Cache Status:</span>
          {agendaQueries.map((query, index) => {
            const key = query.queryKey.join('-');
            const status = query.state.status;
            const isFetching = query.state.isFetching;
            
            return (
              <div key={index} className="flex justify-between text-xs">
                <span className="truncate max-w-40">{key}</span>
                <div className="flex gap-1">
                  <Badge 
                    variant={status === 'success' ? 'default' : 'destructive'}
                    className="text-xs px-1 py-0"
                  >
                    {status}
                  </Badge>
                  {isFetching && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      fetching
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
```

## 4. Testes de Performance

### 4.1 Teste de Carga de Eventos

```typescript
// tests/performance/agenda-load.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAgendaEvents } from '@/hooks/agenda/useAgendaEvents';
import { mockEvents } from '@/tests/mocks/events';

describe('Agenda Performance Tests', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });
  
  it('should load 1000 events in under 2 seconds', async () => {
    const startTime = Date.now();
    
    const { result } = renderHook(
      () => useAgendaEvents(),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )
      }
    );
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
    expect(result.current.data).toHaveLength(1000);
  });
  
  it('should use cache on subsequent calls', async () => {
    const { result, rerender } = renderHook(
      () => useAgendaEvents(),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )
      }
    );
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    const firstCallTime = Date.now();
    rerender();
    
    // Segunda chamada deve ser instantânea (cache)
    const secondCallTime = Date.now() - firstCallTime;
    expect(secondCallTime).toBeLessThan(50);
  });
});
```

## 5. Checklist de Implementação

### ✅ Fase 1: Fundação

* [ ] Criar `hooks/agenda/useAgendaEvents.ts`

* [ ] Criar `hooks/agenda/useAgendaCalendar.ts`

* [ ] Criar `hooks/agenda/useAgendaFilters.ts`

* [ ] Criar `hooks/agenda/useAgendaMutations.ts`

* [ ] Atualizar `CACHE_KEYS` em `react-query-config.ts`

* [ ] Testar hooks individualmente

### ✅ Fase 2: Otimização de Componentes

* [ ] Memoizar `EventCard` com `React.memo`

* [ ] Otimizar `EventsList` com memoização de lista

* [ ] Implementar debounce em `AgendaFilters`

* [ ] Adicionar updates otimistas nas mutations

* [ ] Testar re-renderizações com React DevTools

### ✅ Fase 3: Refatoração Principal

* [ ] Refatorar `Agenda.tsx` para usar novos hooks

* [ ] Remover `useState`/`useEffect` antigos

* [ ] Implementar loading states granulares

* [ ] Adicionar tratamento de erros melhorado

* [ ] Testar todas as funcionalidades existentes

### ✅ Fase 4: Testes e Validação

* [ ] Implementar testes de performance

* [ ] Medir tempo de carregamento antes/depois

* [ ] Contar requisições HTTP

* [ ] Validar cache hit rate

* [ ] Testar em dispositivos móveis

* [ ] Documentar melhorias alcançadas

## 6. Comandos Úteis para Monitoramento

```bash
# Analisar bundle size
npm run build:analyze

# Executar testes de performance
npm run test:performance

# Monitorar queries em tempo real
# (adicionar React Query Devtools)
npm install @tanstack/react-query-devtools

# Lighthouse CI para métricas de performance
npm install -g @lhci/cli
lhci autorun
```

Esta implementação garantirá uma agenda
