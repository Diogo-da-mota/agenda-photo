# Soluções Técnicas: Correção de Erros TypeScript

## 1. Correções para agendaService.ts

### 1.1 Exports Faltantes

**Problema:** Funções implementadas mas não exportadas

**Solução:** Adicionar exports no final do arquivo

```typescript
// Adicionar no final do agendaService.ts
export {
  converterDoSupabase,
  registrarPagamentoParcial,
  gerarReciboEvento,
  sincronizarTodosEventosFinanceiro,
  registrarCallbackAtualizacaoFinanceiro,
  buscarEventosProximos10Dias,
  type EventoCalendario
};
```

### 1.2 Implementações Faltantes

**Se alguma função não existir, implementar:**

```typescript
// Exemplo para buscarEventosProximos10Dias
export const buscarEventosProximos10Dias = async (userId: string): Promise<EventoCalendario[]> => {
  try {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 10);
    
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('user_id', userId)
      .gte('data_evento', new Date().toISOString())
      .lte('data_evento', dataLimite.toISOString())
      .order('data_evento', { ascending: true });
    
    if (error) throw error;
    
    return data?.map(converterDoSupabase) || [];
  } catch (error) {
    console.error('Erro ao buscar eventos próximos:', error);
    throw error;
  }
};

// Callback para atualizações financeiras
let callbackAtualizacaoFinanceiro: ((evento: any) => void) | null = null;

export const registrarCallbackAtualizacaoFinanceiro = (callback: (evento: any) => void) => {
  callbackAtualizacaoFinanceiro = callback;
};

// Sincronização de todos os eventos financeiros
export const sincronizarTodosEventosFinanceiro = async (userId: string): Promise<void> => {
  try {
    const eventos = await buscarEventos(userId);
    
    for (const evento of eventos) {
      await sincronizarEventoFinanceiro(evento);
      
      if (callbackAtualizacaoFinanceiro) {
        callbackAtualizacaoFinanceiro(evento);
      }
    }
  } catch (error) {
    console.error('Erro na sincronização financeira:', error);
    throw error;
  }
};
```

## 2. Correções para entregaFotosAutomaticService.ts

### 2.1 Export Correto

**Problema:** Export não reconhecido

**Solução:** Verificar e corrigir export

```typescript
// No final do arquivo entregaFotosAutomaticService.ts
// Garantir que existe:
export { entregaFotosAutomaticService };
// ou
export default entregaFotosAutomaticService;
```

## 3. Correções de Interfaces - Componentes da Agenda

### 3.1 AgendaHeaderProps

**Arquivo:** `src/components/agenda/types.ts` ou criar se não existir

```typescript
export interface AgendaHeaderProps {
  localSearchQuery: string;
  onSearchChange: Dispatch<SetStateAction<string>>;
  onNewEventClick: () => void;
  // outras props existentes...
}
```

### 3.2 AgendaFiltersProps

```typescript
export interface AgendaFiltersProps {
  statusFilter: string;
  onStatusFilterChange: Dispatch<SetStateAction<string>>;
  dateFilter: Date;
  onClearDateFilter: () => void;
  // outras props existentes...
}
```

### 3.3 AgendaCalendarProps

```typescript
export interface AgendaCalendarProps {
  selectedDate: Date;
  onDateClick: (date: Date) => void;
  eventDates: { date: Date; color?: string; }[];
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
  // outras props existentes...
}
```

### 3.4 EventsListProps

```typescript
export interface EventsListProps {
  filteredEvents: Event[];
  isLoading: boolean;
  error: string;
  dateFilter: Date;
  onClearDateFilter: () => void;
  onStatusChange: (eventId: string, newStatus: EventStatus, financials?: PartialEventFinancials) => Promise<void>;
  onEventUpdate: (updatedEvent: Event) => void;
  // outras props existentes...
}
```

### 3.5 EventModalProps

```typescript
export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: Event) => void;
  // outras props existentes...
}
```

## 4. Correções de Importações

### 4.1 Contratos.tsx

**Problema:** Importações nomeadas incorretas

**Correção:**

```typescript
// Antes (incorreto):
import { ContractList } from '@/components/contratos/ContractList';
import { CreateContractButton } from '@/components/contratos/CreateContractButton';

// Depois (correto):
import ContractList from '@/components/contratos/ContractList';
import CreateContractButton from '@/components/contratos/CreateContractButton';
```

### 4.2 Financeiro.tsx

**Problema:** Múltiplas importações nomeadas incorretas

**Correção:**

```typescript
// Antes (incorreto):
import {
  SummaryCards,
  ActiveFiltersDisplay,
  FinanceiroHeader,
  TransactionGroupCard,
  formatDate,
  formatarMoeda,
  groupTransactionsByMonth,
  applyAllFilters
} from '@/components/financeiro';

// Depois (correto - verificar estrutura real):
import SummaryCards from '@/components/financeiro/SummaryCards';
import ActiveFiltersDisplay from '@/components/financeiro/ActiveFiltersDisplay';
import FinanceiroHeader from '@/components/financeiro/FinanceiroHeader';
import TransactionGroupCard from '@/components/financeiro/TransactionGroupCard';
import { formatDate, formatarMoeda } from '@/utils/formatters';
import { groupTransactionsByMonth, applyAllFilters } from '@/utils/financeiro';
```

### 4.3 MonitorImagens.tsx

**Problema:** Propriedade obrigatória ausente

**Correção:**

```typescript
// Adicionar a propriedade faltante
<ImageUploadBatch 
  onImagesSelected={(images) => {
    // Implementar lógica de seleção
    console.log('Imagens selecionadas:', images);
  }}
  // outras props...
/>
```

## 5. Verificações de Exports nos Módulos

### 5.1 Verificar exports em componentes/contratos/

```typescript
// ContractList.tsx - garantir export default
const ContractList: React.FC<ContractListProps> = (props) => {
  // implementação
};

export default ContractList;

// CreateContractButton.tsx - garantir export default
const CreateContractButton: React.FC<CreateContractButtonProps> = (props) => {
  // implementação
};

export default CreateContractButton;
```

### 5.2 Verificar exports em components/financeiro/

```typescript
// index.ts no diretório financeiro (se existir)
export { default as SummaryCards } from './SummaryCards';
export { default as ActiveFiltersDisplay } from './ActiveFiltersDisplay';
export { default as FinanceiroHeader } from './FinanceiroHeader';
export { default as TransactionGroupCard } from './TransactionGroupCard';

// Ou garantir exports individuais em cada arquivo
```

## 6. Script de Validação

### 6.1 Verificação Automática

```bash
# Script para verificar compilação
npm run type-check
# ou
tsc --noEmit

# Verificar imports específicos
grep -r "import.*agendaService" src/
grep -r "import.*entregaFotosAutomaticService" src/
```

### 6.2 Testes de Compilação

```typescript
// test-imports.ts - arquivo temporário para testar imports
import {
  converterDoSupabase,
  registrarPagamentoParcial,
  gerarReciboEvento,
  sincronizarTodosEventosFinanceiro,
  registrarCallbackAtualizacaoFinanceiro,
  buscarEventosProximos10Dias,
  EventoCalendario
} from '@/services/agendaService';

import { entregaFotosAutomaticService } from '@/services/entregaFotosAutomaticService';

console.log('Todos os imports funcionando!');
```

## 7. Checklist de Implementação

### Etapa 1: agendaService.ts

* [ ] Verificar se todas as funções estão implementadas

* [ ] Adicionar exports faltantes

* [ ] Testar importações em arquivos dependentes

### Etapa 2: Interfaces

* [ ] Atualizar AgendaHeaderProps

* [ ] Atualizar AgendaFiltersProps

* [ ] Atualizar AgendaCalendarProps

* [ ] Atualizar EventsListProps

* [ ] Atualizar EventModalProps

* [ ] Corrigir ImageUploadBatchProps

### Etapa 3: Importações

* [ ] Corrigir Contratos.tsx

* [ ] Corrigir Financeiro.tsx

* [ ] Verificar exports nos módulos de origem

### Etapa 4: Validação

* [ ] Compilação sem erros

* [ ] Testes funcionais básicos

* [ ] Deploy e preview funcionando

## 8. Comandos Úteis

```bash
# Verificar erros TypeScript
npx tsc --noEmit

# Buscar imports problemáticos
grep -r "Module.*has no exported member" .

# Verificar estrutura de exports
grep -r "export.*" src/services/agendaService.ts

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

***

**Implementação recomendada:** Seguir ordem das etapas, testando compilação após cada correção.
