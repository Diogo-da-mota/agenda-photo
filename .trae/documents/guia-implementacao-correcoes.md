# Guia de Implementação: Correções TypeScript - Agenda Photo

## 🎯 Objetivo

Este guia fornece instruções passo-a-passo para corrigir todos os erros de TypeScript identificados no projeto agenda-photo, permitindo o deploy e visualização do preview.

## 📋 Pré-requisitos

- [ ] Backup do projeto atual
- [ ] Node.js e npm instalados
- [ ] Editor com suporte TypeScript (VS Code recomendado)
- [ ] Terminal/prompt de comando

## 🚀 Implementação por Etapas

### ETAPA 1: Correção do agendaService.ts (CRÍTICA)

#### 1.1 Verificar Funções Existentes

```bash
# Verificar se as funções estão implementadas
grep -n "converterDoSupabase\|registrarPagamentoParcial\|gerarReciboEvento" src/services/agendaService.ts
```

#### 1.2 Adicionar Exports Faltantes

**Localização:** `src/services/agendaService.ts`

**Ação:** Adicionar no final do arquivo (antes da última linha):

```typescript
// ===== EXPORTS ADICIONAIS =====
export {
  converterDoSupabase,
  registrarPagamentoParcial,
  gerarReciboEvento,
  sincronizarTodosEventosFinanceiro,
  registrarCallbackAtualizacaoFinanceiro,
  buscarEventosProximos10Dias
};

// Export da interface
export type { EventoCalendario };
```

#### 1.3 Implementar Funções Faltantes (se necessário)

**Se `buscarEventosProximos10Dias` não existir:**

```typescript
// Adicionar antes dos exports
export const buscarEventosProximos10Dias = async (userId: string): Promise<EventoCalendario[]> => {
  try {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + 10);
    
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('user_id', userId)
      .gte('data_evento', hoje.toISOString().split('T')[0])
      .lte('data_evento', dataLimite.toISOString().split('T')[0])
      .order('data_evento', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar eventos próximos:', error);
      throw error;
    }
    
    return data?.map(converterDoSupabase) || [];
  } catch (error) {
    console.error('Erro na função buscarEventosProximos10Dias:', error);
    throw error;
  }
};
```

**Se callbacks financeiros não existirem:**

```typescript
// Adicionar antes dos exports
let callbackFinanceiro: ((evento: any) => void) | null = null;

export const registrarCallbackAtualizacaoFinanceiro = (callback: (evento: any) => void): void => {
  callbackFinanceiro = callback;
};

export const sincronizarTodosEventosFinanceiro = async (userId: string): Promise<void> => {
  try {
    const eventos = await buscarEventos(userId);
    
    for (const evento of eventos) {
      // Sincronizar cada evento
      if (callbackFinanceiro) {
        callbackFinanceiro(evento);
      }
    }
    
    console.log(`Sincronizados ${eventos.length} eventos financeiros`);
  } catch (error) {
    console.error('Erro na sincronização financeira:', error);
    throw error;
  }
};
```

#### 1.4 Verificar Compilação

```bash
npx tsc --noEmit
```

**Resultado esperado:** Redução de 6-7 erros relacionados ao agendaService

---

### ETAPA 2: Correção do entregaFotosAutomaticService.ts

#### 2.1 Verificar Export Atual

**Localização:** `src/services/entregaFotosAutomaticService.ts`

**Verificar final do arquivo:**

```typescript
// Deve ter uma dessas linhas:
export { entregaFotosAutomaticService };
// OU
export default entregaFotosAutomaticService;
```

#### 2.2 Corrigir se Necessário

**Se não houver export, adicionar:**

```typescript
// No final do arquivo
export { entregaFotosAutomaticService };
export default entregaFotosAutomaticService;
```

---

### ETAPA 3: Correção de Interfaces da Agenda

#### 3.1 Localizar Arquivo de Tipos

**Verificar se existe:** `src/components/agenda/types.ts`

```bash
ls src/components/agenda/types.ts
```

#### 3.2 Atualizar/Criar Interfaces

**Se o arquivo existir, atualizar. Se não, criar:**

```typescript
// src/components/agenda/types.ts
import { Dispatch, SetStateAction } from 'react';
import { Event, EventStatus, PartialEventFinancials } from '@/types';

export interface AgendaHeaderProps {
  localSearchQuery: string;
  onSearchChange: Dispatch<SetStateAction<string>>;
  onNewEventClick: () => void;
}

export interface AgendaFiltersProps {
  statusFilter: string;
  onStatusFilterChange: Dispatch<SetStateAction<string>>;
  dateFilter: Date;
  onClearDateFilter: () => void;
}

export interface AgendaCalendarProps {
  selectedDate: Date;
  onDateClick: (date: Date) => void;
  eventDates: { date: Date; color?: string; }[];
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export interface EventsListProps {
  filteredEvents: Event[];
  isLoading: boolean;
  error: string;
  dateFilter: Date;
  onClearDateFilter: () => void;
  onStatusChange: (eventId: string, newStatus: EventStatus, financials?: PartialEventFinancials) => Promise<void>;
  onEventUpdate: (updatedEvent: Event) => void;
}

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: Event) => void;
}

export interface ImageUploadBatchProps {
  onImagesSelected: (images: File[]) => void;
  // outras props conforme necessário
}
```

#### 3.3 Atualizar Importações nos Componentes

**Verificar se os componentes importam as interfaces:**

```typescript
// Nos arquivos dos componentes
import { AgendaHeaderProps, AgendaFiltersProps, /* etc */ } from './types';
```

---

### ETAPA 4: Correção de Importações

#### 4.1 Corrigir Contratos.tsx

**Localização:** `src/pages/Dashboard/Contratos.tsx`

**Alterar de:**
```typescript
import { ContractList } from '@/components/contratos/ContractList';
import { CreateContractButton } from '@/components/contratos/CreateContractButton';
```

**Para:**
```typescript
import ContractList from '@/components/contratos/ContractList';
import CreateContractButton from '@/components/contratos/CreateContractButton';
```

#### 4.2 Corrigir Financeiro.tsx

**Localização:** `src/pages/Dashboard/Financeiro.tsx`

**Alterar de:**
```typescript
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
```

**Para:**
```typescript
import SummaryCards from '@/components/financeiro/SummaryCards';
import ActiveFiltersDisplay from '@/components/financeiro/ActiveFiltersDisplay';
import FinanceiroHeader from '@/components/financeiro/FinanceiroHeader';
import TransactionGroupCard from '@/components/financeiro/TransactionGroupCard';
import { formatDate, formatarMoeda } from '@/utils/formatters';
import { groupTransactionsByMonth, applyAllFilters } from '@/utils/financeiro';
```

#### 4.3 Corrigir MonitorImagens.tsx

**Localização:** `src/pages/Dashboard/Configuracoes/MonitorImagens.tsx`

**Adicionar propriedade faltante:**

```typescript
// Localizar o componente ImageUploadBatch e adicionar:
<ImageUploadBatch 
  onImagesSelected={(images: File[]) => {
    console.log('Imagens selecionadas:', images);
    // Implementar lógica conforme necessário
  }}
  // outras props existentes...
/>
```

---

### ETAPA 5: Verificação e Validação

#### 5.1 Compilação Completa

```bash
# Limpar cache
rm -rf node_modules/.cache

# Verificar TypeScript
npx tsc --noEmit

# Build do projeto
npm run build
```

#### 5.2 Testes Funcionais

```bash
# Iniciar desenvolvimento
npm run dev

# Verificar se não há erros no console
# Testar navegação básica
```

#### 5.3 Deploy e Preview

```bash
# Deploy no Lovable
# Verificar se o preview carrega corretamente
```

---

## 🔧 Comandos de Diagnóstico

### Verificar Erros Específicos

```bash
# Buscar imports problemáticos
grep -r "has no exported member" .

# Verificar exports em agendaService
grep -n "export" src/services/agendaService.ts

# Verificar estrutura de componentes
find src/components -name "*.tsx" -o -name "*.ts" | head -20
```

### Logs de Debug

```bash
# Verificar logs do TypeScript
npx tsc --listFiles | grep agenda

# Verificar dependências
npm ls typescript
```

---

## ✅ Checklist Final

### Antes de Finalizar
- [ ] Todos os erros TypeScript resolvidos
- [ ] Compilação sem warnings críticos
- [ ] Imports funcionando corretamente
- [ ] Componentes renderizando sem erros
- [ ] Preview do deploy funcionando

### Pós-Implementação
- [ ] Commit das alterações
- [ ] Documentar mudanças no README
- [ ] Testar funcionalidades principais
- [ ] Monitorar logs de erro

---

## 🚨 Troubleshooting

### Se ainda houver erros:

1. **Verificar cache:**
   ```bash
   rm -rf node_modules/.cache
   npm run dev
   ```

2. **Reinstalar dependências:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Verificar versões:**
   ```bash
   npm ls typescript @types/react @types/node
   ```

4. **Logs detalhados:**
   ```bash
   npx tsc --noEmit --listFiles > typescript-files.log
   ```

### Contatos de Suporte

- **Documentação TypeScript:** https://www.typescriptlang.org/docs/
- **React TypeScript:** https://react-typescript-cheatsheet.netlify.app/

---

**Tempo estimado total:** 2-4 horas
**Complexidade:** Média
**Impacto:** Alto (desbloqueio completo do projeto)