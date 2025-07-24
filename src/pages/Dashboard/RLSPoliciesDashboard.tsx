
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield } from 'lucide-react';
import TableStatusCard from '@/components/dashboard/rls/TableStatusCard';
import PolicyList from '@/components/dashboard/rls/PolicyList';
import { useRLSData } from '@/components/dashboard/rls/hooks/useRLSData';

const RLSPoliciesDashboard: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('fotos_drive');
  const {
    policies,
    tableStatuses,
    loading,
    loadPoliciesForTable,
    loadAllTableStatuses
  } = useRLSData();

  useEffect(() => {
    loadAllTableStatuses();
    loadPoliciesForTable(selectedTable);
  }, [selectedTable]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h1 className="text-3xl font-bold">Dashboard de Políticas RLS</h1>
      </div>

      <Tabs value={selectedTable} onValueChange={setSelectedTable}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="fotos_drive">Fotos Drive</TabsTrigger>
        </TabsList>

        <TabsContent value="fotos_drive" className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Status das Tabelas</CardTitle>
              <CardDescription>
                Visão geral da segurança RLS em todas as tabelas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tableStatuses.map((tableStatus) => (
                  <TableStatusCard 
                    key={tableStatus.table_name} 
                    tableStatus={tableStatus} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Policies */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Políticas RLS - {selectedTable}</CardTitle>
                <CardDescription>
                  Detalhes das políticas de segurança para a tabela selecionada
                </CardDescription>
              </div>
              <Button 
                onClick={() => loadPoliciesForTable(selectedTable)}
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Atualizar
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Carregando políticas...</span>
                </div>
              ) : (
                <PolicyList policies={policies} selectedTable={selectedTable} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RLSPoliciesDashboard;
