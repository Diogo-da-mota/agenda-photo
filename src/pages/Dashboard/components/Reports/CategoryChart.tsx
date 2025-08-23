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
    <Card className="w-full">
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
                formatter={(value, name, props) => [
                  `${props.payload.quantidade || 1} ${props.payload.nome}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  ''
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda personalizada */}
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {(dadosCategoriaReais.length > 0 ? dadosCategoriaReais : categoryData).map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground">
                {entry.nome || entry.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};