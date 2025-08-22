
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Archive, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ArquivamentoStatus {
  tabela: string;
  status: 'ativo' | 'arquivado' | 'pendente';
  ultimaVerificacao: string;
  registrosAtivos: number;
  registrosArquivados: number;
}

const MonitoramentoArquivamento = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusTabelas, setStatusTabelas] = useState<ArquivamentoStatus[]>([]);
  const { toast } = useToast();

  // Dados simulados para demonstração
  const mockData: ArquivamentoStatus[] = [
    {
      tabela: 'clientes',
      status: 'ativo',
      ultimaVerificacao: new Date().toISOString(),
      registrosAtivos: 150,
      registrosArquivados: 25
    },
    {
      tabela: 'agenda_eventos',
      status: 'ativo', 
      ultimaVerificacao: new Date().toISOString(),
      registrosAtivos: 300,
      registrosArquivados: 100
    },
    {
      tabela: 'contratos',
      status: 'pendente',
      ultimaVerificacao: new Date(Date.now() - 86400000).toISOString(),
      registrosAtivos: 50,
      registrosArquivados: 10
    }
  ];

  const verificarStatusArquivamento = async () => {
    setIsLoading(true);
    
    try {
      // Simulação de verificação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatusTabelas(mockData);
      
      toast({
        title: "Verificação concluída",
        description: "Status de arquivamento atualizado"
      });
      
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro na verificação",
        description: "Falha ao verificar status de arquivamento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'arquivado':
        return <Archive className="h-4 w-4 text-blue-500" />;
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'arquivado':
        return <Badge variant="secondary">Arquivado</Badge>;
      case 'pendente':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pendente</Badge>;
      default:
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Monitoramento de Arquivamento
        </CardTitle>
        <CardDescription>
          Acompanhe o status de arquivamento das tabelas do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={verificarStatusArquivamento}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Clock className="h-4 w-4 animate-pulse" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {isLoading ? 'Verificando...' : 'Verificar Status'}
          </Button>
        </div>

        {statusTabelas.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Status das Tabelas:</h4>
            <div className="grid gap-3">
              {statusTabelas.map((item) => (
                <div 
                  key={item.tabela}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <span className="font-mono text-sm font-medium">{item.tabela}</span>
                      <div className="text-xs text-gray-500">
                        Última verificação: {new Date(item.ultimaVerificacao).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="text-green-600">Ativos: {item.registrosAtivos}</div>
                      <div className="text-blue-600">Arquivados: {item.registrosArquivados}</div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {statusTabelas.length > 0 && (
          <div className="pt-4 border-t">
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Resumo do Sistema:</strong></p>
              <p>📊 Total de tabelas monitoradas: {statusTabelas.length}</p>
              <p>✅ Registros ativos: {statusTabelas.reduce((acc, t) => acc + t.registrosAtivos, 0)}</p>
              <p>📦 Registros arquivados: {statusTabelas.reduce((acc, t) => acc + t.registrosArquivados, 0)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonitoramentoArquivamento;
