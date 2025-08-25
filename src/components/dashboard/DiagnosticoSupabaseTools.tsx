
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TableStatus {
  name: string;
  exists: boolean;
  rowCount?: number;
  error?: string;
}

const DiagnosticoSupabaseTools = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableStatus, setTableStatus] = useState<TableStatus[]>([]);
  const { toast } = useToast();

  // Lista das tabelas principais que esperamos encontrar
  const expectedTables = [
    'clientes',
    'agenda_eventos', 
    'configuracoes_empresa',
    'configuracoes_integracoes',
    'contratos',
    'financeiro_pagamentos',
    'financeiro_transacoes',
    'mensagens_templates',
    'sistema_atividades'
  ];

  const checkTablesStatus = async () => {
    setIsLoading(true);
    const results: TableStatus[] = [];

    try {
      for (const tableName of expectedTables) {
        try {
          const { data, error, count } = await supabase
            .from(tableName as any)
            .select('*', { count: 'exact', head: true });

          if (error) {
            results.push({
              name: tableName,
              exists: false,
              error: error.message
            });
          } else {
            results.push({
              name: tableName,
              exists: true,
              rowCount: count || 0
            });
          }
        } catch (err) {
          results.push({
            name: tableName,
            exists: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido'
          });
        }
      }

      setTableStatus(results);
      
      const existingTables = results.filter(t => t.exists).length;
      const totalTables = results.length;

    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      toast({
        title: "Erro no diagnóstico",
        description: "Falha ao verificar status das tabelas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: TableStatus) => {
    if (status.exists) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TableStatus) => {
    if (status.exists) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Existe</Badge>;
    } else {
      return <Badge variant="destructive">Não encontrada</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Diagnóstico do Supabase
        </CardTitle>
        <CardDescription>
          Verificação do status das tabelas principais do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={checkTablesStatus}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {isLoading ? 'Verificando...' : 'Verificar Tabelas'}
          </Button>
        </div>

        {tableStatus.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Status das Tabelas:</h4>
            <div className="grid gap-2">
              {tableStatus.map((status) => (
                <div 
                  key={status.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="font-mono text-sm">{status.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {status.exists && status.rowCount !== undefined && (
                      <span className="text-sm text-gray-500">
                        {status.rowCount} registros
                      </span>
                    )}
                    {getStatusBadge(status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tableStatus.length > 0 && (
          <div className="pt-4 border-t">
            <div className="text-sm text-gray-600">
              <p><strong>Resumo:</strong></p>
              <p>✅ Tabelas encontradas: {tableStatus.filter(t => t.exists).length}</p>
              <p>❌ Tabelas ausentes: {tableStatus.filter(t => !t.exists).length}</p>
              <p>📊 Total verificado: {tableStatus.length}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticoSupabaseTools;
