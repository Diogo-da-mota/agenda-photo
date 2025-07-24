import { Transacao } from '@/services/financeiroService';
import { Despesa } from '@/services/financeiroDespesasService';

/**
 * Tipos específicos para o módulo financeiro
 */

// Interface para os grupos de transações
export interface TransactionGroup {
  label: string;
  transactions: Transacao[];
  despesas: Despesa[];
  transacoesRestantes: Transacao[];
  transacoesEntradas: Transacao[];
  totalReceitas: number;
  totalDespesas: number;
  totalRestantes: number;
  totalEntradas: number;
}

// Props para o componente TransactionItem
export interface TransactionItemProps {
  transaction: Transacao;
  onEdit: (transaction: Transacao) => void;
  formatarMoeda: (valor: number) => string;
  formatDate: (date: Date | string) => string;
}

// Props para o componente AdvancedFilters
export interface AdvancedFiltersProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  categoryFilter: string[];
  setCategoryFilter: (categories: string[]) => void;
  onClose: () => void;
}

// Props para o componente SummaryCards
export interface SummaryCardsProps {
  totalEntradas: number;
  totalAReceber: number;
  totalDespesas: number;
  saldo: number;
  formatarMoeda: (valor: number) => string;
  isAdmin?: boolean;
}

// Props para o componente TransactionGroup
export interface TransactionGroupProps {
  group: TransactionGroup;
  onEdit: (transaction: Transacao) => void;
  formatarMoeda: (valor: number) => string;
  formatDate: (date: Date | string) => string;
}

// Interface para totais calculados
export interface TotaisCalculados {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  totalAReceber: number;
  totalEntradas: number;
}

// Interface para configuração de filtros
export interface FilterConfig {
  searchQuery: string;
  typeFilter: string;
  dateRange: { start: Date | null; end: Date | null };
  categoryFilter: string[];
}

// Tipo para formato de exportação
export type ExportFormat = 'pdf' | 'excel';

// Interface para props do hook de dados financeiros
export interface UseFinanceiroDataProps {
  userId: string;
  filterConfig: FilterConfig;
}

// Interface para resultado do hook de dados financeiros
export interface UseFinanceiroDataResult {
  transactions: Transacao[];
  despesas: Despesa[];
  resumoFinanceiro: {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
  };
  transacoesRestantes: Transacao[];
  transacoesEntradas: Transacao[];
  isLoading: boolean;
}

// Interface para resultado do hook de filtros
export interface UseFinanceiroFiltersResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  categoryFilter: string[];
  setCategoryFilter: (categories: string[]) => void;
  isFilterDialogOpen: boolean;
  setIsFilterDialogOpen: (open: boolean) => void;
}

// Interface para resultado do hook de correções
export interface UseFinanceiroCorrectionsResult {
  mensagemCorrecao: string | null;
  handleCorrigirTransacoesDiogo: () => Promise<void>;
  handleSincronizarEventosFinanceiro: () => Promise<void>;
}