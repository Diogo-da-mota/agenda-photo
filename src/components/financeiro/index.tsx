// Re-exports for all financeiro components
export { SummaryCards } from './SummaryCards';
export { ActiveFiltersDisplay } from './ActiveFiltersDisplay';
export { FinanceiroHeader } from './FinanceiroHeader';
export { TransactionGroupCard } from './TransactionGroupCard';
export { useFinanceiroData } from './hooks/useFinanceiroData';
export { useFinanceiroActions } from './hooks/useFinanceiroActions';

// Utils exports
export { formatDate, formatarMoeda, groupTransactionsByMonth, applyAllFilters, calcularTotaisDosFiltros } from './utils';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FinanceiroOverview: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visão Geral Financeira</CardTitle>
        <CardDescription>
          Acompanhe suas finanças
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Módulo financeiro em desenvolvimento
        </p>
      </CardContent>
    </Card>
  );
};

export default FinanceiroOverview;