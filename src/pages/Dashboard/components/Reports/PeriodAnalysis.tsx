import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, BarChart, Bar } from 'recharts';

interface PeriodAnalysisProps {
  dadosMensaisReais: any[];
  dadosTrimestraisReais: any[];
  dadosAnuaisReais: any[];
  monthlyData: any[];
}

export const PeriodAnalysis: React.FC<PeriodAnalysisProps> = ({
  dadosMensaisReais,
  dadosTrimestraisReais,
  dadosAnuaisReais,
  monthlyData
}) => {
  return (
    <Tabs defaultValue="monthly" className="w-full">
      <TabsList className="mb-4 grid w-full grid-cols-3 max-w-[400px] mx-auto md:mx-0">
        <TabsTrigger value="monthly" className="text-xs md:text-sm">Mensal</TabsTrigger>
        <TabsTrigger value="quarterly" className="text-xs md:text-sm">Trimestral</TabsTrigger>
        <TabsTrigger value="yearly" className="text-xs md:text-sm">Anual</TabsTrigger>
      </TabsList>
      
      <TabsContent value="monthly" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Tendência de Receita</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              <span className="hidden md:inline">Evolução da receita nos últimos 12 meses</span>
              <span className="md:hidden">Receita mensal</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[250px] md:h-[350px] w-full p-2 md:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dadosMensaisReais.length > 0 ? dadosMensaisReais : monthlyData}
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
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                    contentStyle={{ fontSize: '12px', borderRadius: '0.5rem' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="receita" name="Receita" stroke="hsl(var(--primary))" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="border-t p-2 md:p-4 text-xs md:text-sm text-muted-foreground">
            <span className="hidden md:inline">Análise de tendência com base em dados históricos</span>
            <span className="md:hidden">Tendência histórica</span>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="quarterly" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Análise Trimestral</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              <span className="hidden md:inline">Comparação de receitas por trimestre</span>
              <span className="md:hidden">Receita trimestral</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[250px] md:h-[350px] w-full p-2 md:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosTrimestraisReais.length > 0 ? dadosTrimestraisReais : [
                    { name: 'T1', receita: 25500, despesas: 9800 },
                    { name: 'T2', receita: 32500, despesas: 11900 },
                    { name: 'T3', receita: 39500, despesas: 14200 },
                    { name: 'T4', receita: 46500, despesas: 16300 },
                  ]}
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
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                    contentStyle={{ fontSize: '12px', borderRadius: '0.5rem' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="border-t p-2 md:p-4 text-xs md:text-sm text-muted-foreground">
            <span className="hidden md:inline">Análise trimestral para o ano atual</span>
            <span className="md:hidden">Trimestres do ano</span>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="yearly" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Análise Anual</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              <span className="hidden md:inline">Comparação de receitas por ano</span>
              <span className="md:hidden">Receita anual</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[250px] md:h-[350px] w-full p-2 md:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosAnuaisReais.length > 0 ? dadosAnuaisReais : [
                    { name: '2021', receita: 87500, despesas: 35200 },
                    { name: '2022', receita: 96800, despesas: 38900 },
                    { name: '2023', receita: 112500, despesas: 44500 },
                    { name: '2024', receita: 124500, despesas: 48700 },
                  ]}
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
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                    contentStyle={{ fontSize: '12px', borderRadius: '0.5rem' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="border-t p-2 md:p-4 text-xs md:text-sm text-muted-foreground">
            <span className="hidden md:inline">Análise comparativa entre os últimos anos</span>
            <span className="md:hidden">Comparação anual</span>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};