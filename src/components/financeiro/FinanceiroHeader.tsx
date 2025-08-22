import React from 'react';
import { Button } from '@/components/ui/button';

interface FinanceiroHeaderProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  typeFilter?: string;
  setTypeFilter?: (filter: string) => void;
  isFilterDialogOpen?: boolean;
  setIsFilterDialogOpen?: (open: boolean) => void;
  dateRange?: any;
  setDateRange?: (range: any) => void;
  categoryFilter?: string[];
  setCategoryFilter?: (categories: string[]) => void;
  onExportClick?: () => void;
  transacaoParaEditar?: any;
  onTransactionSuccess?: () => void;
  isTransactionModalOpen?: boolean;
  setIsTransactionModalOpen?: (open: boolean) => void;
}

export const FinanceiroHeader: React.FC<FinanceiroHeaderProps> = (props) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Financeiro</h1>
      <Button>Nova Transação</Button>
    </div>
  );
};

export default FinanceiroHeader;