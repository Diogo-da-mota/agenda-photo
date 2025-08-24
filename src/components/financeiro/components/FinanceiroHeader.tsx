import React, { useState, useEffect } from 'react';
import { 
  Search,
  Filter,
  FileText,
  ChevronDown,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import TransactionModal from '../TransactionModal';
import { AdvancedFilters } from './AdvancedFilters';
import { Transacao } from '@/services/financeiroService';
import { useDebounce } from '@/hooks/useDebounce';

interface FinanceiroHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: string;
  setTypeFilter: (filter: string) => void;
  isFilterDialogOpen: boolean;
  setIsFilterDialogOpen: (isOpen: boolean) => void;
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  categoryFilter: string[];
  setCategoryFilter: (categories: string[]) => void;
  onExportClick: (format: 'pdf' | 'excel') => void;
  transacaoParaEditar: Transacao | null;
  onTransactionSuccess: (transaction: Transacao) => void;
  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (isOpen: boolean) => void;

}

/**
 * Componente do cabeçalho do financeiro com controles de busca, filtros e ações
 */
const FinanceiroHeader: React.FC<FinanceiroHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  isFilterDialogOpen,
  setIsFilterDialogOpen,
  dateRange,
  setDateRange,
  categoryFilter,
  setCategoryFilter,
  onExportClick,
  transacaoParaEditar,
  onTransactionSuccess,
  isTransactionModalOpen,
  setIsTransactionModalOpen
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchQuery]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-center md:text-left w-full md:w-auto">Fluxo de Caixa</h1>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar transações..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-10 text-sm bg-[#3c83f6] text-white hover:bg-[#2c73e6] w-auto min-w-[140px] max-w-xs">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Entradas</SelectItem>
            <SelectItem value="pending">A Receber</SelectItem>
            <SelectItem value="expense">Saídas</SelectItem>
          </SelectContent>
        </Select>
        
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-1 h-4 w-4" /> Filtros
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Filtros Avançados</DialogTitle>
            </DialogHeader>
            <AdvancedFilters 
              dateRange={dateRange}
              setDateRange={setDateRange}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onClose={() => setIsFilterDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        <div className="flex-grow"></div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Exportar <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onExportClick('pdf')}>
              <FileText className="mr-2 h-4 w-4" /> Exportar PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExportClick('excel')}>
              <FileText className="mr-2 h-4 w-4" /> Exportar Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        
        <TransactionModal
          transaction={transacaoParaEditar}
          onSuccess={onTransactionSuccess}
          isOpen={isTransactionModalOpen}
          onOpenChange={setIsTransactionModalOpen}
          trigger={
            <Button>
              <ArrowDown className="mr-1 h-4 w-4" /> Despesas
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default FinanceiroHeader; 