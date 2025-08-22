import React from 'react';
import { Button } from '@/components/ui/button';

export const FinanceiroHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Financeiro</h1>
      <Button>Nova Transação</Button>
    </div>
  );
};

export default FinanceiroHeader;