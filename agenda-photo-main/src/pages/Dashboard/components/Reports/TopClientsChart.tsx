import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LabelList } from 'recharts';

interface TopClientsChartProps {
  clientesDuplicados: any[];
  buscarClientesDuplicados: () => void;
}

export const TopClientsChart: React.FC<TopClientsChartProps> = ({
  clientesDuplicados,
  buscarClientesDuplicados
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">Principais Clientes</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          <span className="hidden md:inline">Clientes duplicados com maior faturamento</span>
          <span className="md:hidden">Maior faturamento</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] md:h-[300px]">
          {clientesDuplicados.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={clientesDuplicados}
                margin={{
                  top: 10,
                  right: 10,
                  left: 50,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  fontSize={10}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  fontSize={15}
                  width={100}
                  tick={{ fill: '#ffffff' }}
                  tickFormatter={(value) => value.length > 122 ? `${value.substring(0, 10)}...` : value}
                />
                <Tooltip 
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor Total']}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${item.nome} (${item.ocorrencias} ocorrências)` : label;
                  }}
                  contentStyle={{ fontSize: '12px', borderRadius: '0.5rem' }}
                  cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
                />
                <Bar dataKey="valor" name="Valor" fill="#34A853" radius={[0, 4, 4, 0]}>
                  <LabelList 
                    dataKey="nome" 
                    position="insideLeft"
                    fill="white"
                    fontSize={11}
                    fontWeight="bold"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">Nenhum cliente duplicado encontrado</p>
                <p className="text-xs mt-2">
                  Para aparecer aqui, um cliente deve ter o mesmo nome cadastrado 2+ vezes com valores de evento.
                </p>
                <button 
                  onClick={buscarClientesDuplicados}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                >
                  🔄 Recarregar
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};