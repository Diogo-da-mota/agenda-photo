import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart as BarChartIcon, CreditCard, Calendar, ArrowUpDown, Loader2 } from 'lucide-react';

interface KPICardsProps {
  receitaTotal: number;
  despesasTotal: number;
  lucroLiquido: number;
  isLoading: boolean;
  formatarMoeda: (valor: number) => string;
  obterAnoAtual: () => number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  receitaTotal,
  despesasTotal,
  lucroLiquido,
  isLoading,
  formatarMoeda,
  obterAnoAtual
}) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <div className="text-xl md:text-2xl font-bold">{formatarMoeda(receitaTotal || 0)}</div>
              <p className="text-xs text-muted-foreground flex items-center text-green-500 mt-1">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                <span className="hidden md:inline">+12% em relação ao ano anterior</span>
                <span className="md:hidden">+12% ano anterior</span>
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <div className="text-xl md:text-2xl font-bold">{formatarMoeda(despesasTotal || 0)}</div>
              <p className="text-xs text-muted-foreground flex items-center text-red-500 mt-1">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                <span className="hidden md:inline">+8% em relação ao ano anterior</span>
                <span className="md:hidden">+8% ano anterior</span>
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
          <BarChartIcon className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <div className="text-xl md:text-2xl font-bold">{formatarMoeda(lucroLiquido)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ano de {obterAnoAtual()}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
          <CardDescription className="md:block hidden">Total atual</CardDescription>
          <CardDescription className="md:hidden block text-xs">Total atual</CardDescription>
           <CreditCard className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">R$ 12.350,00</div>
          <p className="text-xs flex items-center text-amber-500 mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            8 faturas pendentes
          </p>
        </CardContent>
      </Card>
    </div>
  );
};