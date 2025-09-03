import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

interface RevenueExpenseChartProps {
  period: string;
  setPeriod: (period: string) => void;
  obterDadosPorPeriodo: () => any[];
}

export const RevenueExpenseChart: React.FC<RevenueExpenseChartProps> = ({
  period,
  setPeriod,
  obterDadosPorPeriodo
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:justify-between md:items-center">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base md:text-lg">Receita vs. Despesas</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              <span className="hidden md:inline">Análise comparativa entre receitas e despesas</span>
              <span className="md:hidden">Receitas vs Despesas</span>
            </CardDescription>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[250px] md:h-[350px] w-full p-2 md:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={obterDadosPorPeriodo()}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tickMargin={5}
              />
              <YAxis 
                fontSize={12}
                tickMargin={5}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                labelFormatter={(label) => `Período: ${label}`}
                contentStyle={{ fontSize: '12px', borderRadius: '0.5rem' }}
                cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="border-t p-2 md:p-4 text-xs md:text-sm text-muted-foreground">
        <span className="hidden md:inline">Análise da performance financeira ao longo do tempo.</span>
        <span className="md:hidden">Performance financeira</span>
      </CardFooter>
    </Card>
  );
};