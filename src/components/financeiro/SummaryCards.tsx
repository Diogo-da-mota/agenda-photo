import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SummaryCards = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 0,00</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 0,00</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;