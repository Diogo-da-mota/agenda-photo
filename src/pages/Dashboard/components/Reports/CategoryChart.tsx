import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface CategoryChartProps {
  dadosCategoriaReais: any[];
  categoryData: any[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  dadosCategoriaReais,
  categoryData
}) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">Receita por Categoria</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          <span className="hidden md:inline">Distribuição de receita por tipo de serviço</span>
          <span className="md:hidden">Por tipo de serviço</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosCategoriaReais.length > 0 ? dadosCategoriaReais : categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                dataKey="valor"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
              >
                {(dadosCategoriaReais.length > 0 ? dadosCategoriaReais : categoryData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`R$ ${value.toLocaleString('pt-BR')}`, name]}
                contentStyle={{ fontSize: '12px', borderRadius: '0.5rem' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};