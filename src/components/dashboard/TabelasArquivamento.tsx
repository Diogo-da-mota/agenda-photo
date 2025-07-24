
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Archive, CheckCircle, Clock } from "lucide-react";

interface TabelaMonitorada {
  nome: string;
  descricao: string;
  acessos: number;
  ultimoAcesso: string | null;
  status: 'inativa' | 'baixo_uso' | 'ativo';
}

interface LogAcesso {
  id: string;
  table_name: string;
  operation: string;
  timestamp: string;
}

const TabelasArquivamento = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tabelas, setTabelas] = useState<TabelaMonitorada[]>([]);
  const [logs, setLogs] = useState<LogAcesso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [periodo, setPeriodo] = useState<'24h' | '7d' | 'todos'>('7d');

  const tabelasMonitoradas = ['perfis', 'configuracoes_empresa', 'clientes_completo_obsoleto'];

  // Função para carregar logs de acesso
  const carregarLogs = async () => {
    if (!user) return;
    
    try {
      setCarregando(true);
      
      // Descrições das tabelas com mapeamento manual
      const descricoesTabelas: Record<string, string> = {
        'perfis': 'ARQUIVAMENTO PENDENTE - Tabela duplicada com profiles que contém dados mais completos.',
        'configuracoes_empresa': 'ARQUIVAMENTO PENDENTE - Funcionalidade duplicada com app_settings.',
        'clientes_completo_obsoleto': 'ARQUIVAMENTO PENDENTE - Versão obsoleta da tabela clientes.'
      };
      
      // Buscar logs de acesso usando a tabela correta sistema_atividades
      const { data: logsAcesso, error } = await supabase
        .from('sistema_atividades')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      
      // Mapear os dados para o formato esperado
      const logsFormatados: LogAcesso[] = (logsAcesso || []).map(log => ({
        id: log.id,
        table_name: log.table_name,
        operation: log.operation,
        timestamp: log.timestamp
      }));
      
      setLogs(logsFormatados);
      
      // Processar dados para exibição
      const tabelasProcessadas: TabelaMonitorada[] = tabelasMonitoradas.map(nomeTabela => {
        const logsTabela = logsFormatados.filter(log => log.table_name === nomeTabela);
        const ultimoAcesso = logsTabela.length > 0 ? logsTabela[0].timestamp : null;
        const numeroAcessos = logsTabela.length;
        
        // Determinar status baseado no número de acessos
        let status: 'inativa' | 'baixo_uso' | 'ativo';
        if (numeroAcessos === 0) status = 'inativa';
        else if (numeroAcessos < 5) status = 'baixo_uso';
        else status = 'ativo';
        
        return {
          nome: nomeTabela,
          descricao: descricoesTabelas[nomeTabela] || 'Sem descrição disponível',
          acessos: numeroAcessos,
          ultimoAcesso,
          status
        };
      });
      
      setTabelas(tabelasProcessadas);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível obter informações das tabelas monitoradas.',
        variant: 'destructive',
      });
    } finally {
      setCarregando(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarLogs();
    // Atualizar a cada 5 minutos
    const intervalo = setInterval(carregarLogs, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [user, periodo]);

  // Função para filtrar logs baseado no período selecionado
  const filtrarPorPeriodo = (log: LogAcesso) => {
    if (periodo === 'todos') return true;
    
    const dataLog = new Date(log.timestamp);
    const agora = new Date();
    const diferencaHoras = (agora.getTime() - dataLog.getTime()) / (1000 * 60 * 60);
    
    if (periodo === '24h') return diferencaHoras <= 24;
    if (periodo === '7d') return diferencaHoras <= 24 * 7;
    return true;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Monitoramento de Arquivamento</h2>
        <Button 
          variant="outline"
          onClick={carregarLogs}
          disabled={carregando}
        >
          Atualizar Dados
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Tabelas Candidatas ao Arquivamento
          </CardTitle>
          <CardDescription>
            Análise de uso das tabelas marcadas para possível arquivamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tabelas.map((tabela) => (
              <Card key={tabela.nome} className="border">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{tabela.nome}</CardTitle>
                    <StatusBadge status={tabela.status} />
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-muted-foreground">{tabela.descricao}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Acessos</p>
                      <p className="font-medium">{tabela.acessos}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Último acesso</p>
                      <p className="font-medium">
                        {tabela.ultimoAcesso 
                          ? new Date(tabela.ultimoAcesso).toLocaleDateString() 
                          : 'Nunca'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="logs">Logs de Acesso</TabsTrigger>
          <TabsTrigger value="info">Informações de Arquivamento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Histórico de Acesso</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={periodo === '24h' ? "secondary" : "ghost"} 
                    size="sm"
                    onClick={() => setPeriodo('24h')}
                  >
                    24 horas
                  </Button>
                  <Button 
                    variant={periodo === '7d' ? "secondary" : "ghost"} 
                    size="sm"
                    onClick={() => setPeriodo('7d')}
                  >
                    7 dias
                  </Button>
                  <Button 
                    variant={periodo === 'todos' ? "secondary" : "ghost"} 
                    size="sm"
                    onClick={() => setPeriodo('todos')}
                  >
                    Todos
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-3 font-medium border-b bg-muted/50 p-2">
                  <div>Tabela</div>
                  <div>Operação</div>
                  <div>Data/Hora</div>
                </div>
                <div className="max-h-[400px] overflow-auto">
                  {logs.filter(filtrarPorPeriodo).length > 0 ? (
                    logs.filter(filtrarPorPeriodo).map((log) => (
                      <div key={log.id} className="grid grid-cols-3 p-2 border-b text-sm">
                        <div>{log.table_name}</div>
                        <div>
                          <Badge variant={
                            log.operation === 'SELECT' ? "secondary" :
                            log.operation === 'INSERT' ? "default" :
                            log.operation === 'UPDATE' ? "outline" : "destructive"
                          }>
                            {log.operation}
                          </Badge>
                        </div>
                        <div>{new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      Nenhum log encontrado no período selecionado
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Processo de Arquivamento</CardTitle>
              <CardDescription>
                Detalhes sobre o processo de arquivamento seguro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Fase Atual: Monitoramento</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    As tabelas estão sendo monitoradas para verificar seu uso antes do arquivamento efetivo.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Criação dos backups completos concluída</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Implementação do sistema de logs concluída</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>Monitoramento de uso em andamento (7 dias)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>Arquivamento físico das tabelas pendente</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Próximos passos</h3>
                  <ol className="space-y-2 text-sm list-decimal pl-5">
                    <li>Análise dos logs após período de 7 dias</li>
                    <li>Renomeação das tabelas para prefixo "archived_"</li>
                    <li>Criação de views com os nomes originais das tabelas</li>
                    <li>Monitoramento por mais 14 dias</li>
                    <li>Remoção das views e tabelas arquivadas</li>
                  </ol>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente auxiliar para renderizar o status
const StatusBadge = ({ status }: { status: 'inativa' | 'baixo_uso' | 'ativo' }) => {
  if (status === 'inativa') {
    return (
      <Badge variant="destructive" className="text-xs">
        Inativa
      </Badge>
    );
  } else if (status === 'baixo_uso') {
    return (
      <Badge variant="outline" className="text-xs">
        Baixo uso
      </Badge>
    );
  } else {
    return (
      <Badge variant="secondary" className="text-xs">
        Ativa
      </Badge>
    );
  }
};

export default TabelasArquivamento;
