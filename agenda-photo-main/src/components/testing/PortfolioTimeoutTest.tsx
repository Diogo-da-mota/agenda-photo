/**
 * 🧪 COMPONENTE DE TESTE - TIMEOUT PORTFOLIO
 * 
 * Este componente testa as correções implementadas para resolver
 * o erro 57014 (statement timeout) nas operações UPDATE
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { atualizarTrabalhoPortfolio } from '@/services/portfolio/mutations/update';
import { obterRelatorioPerformance } from '@/utils/performance/portfolioMonitoring';
import { toast } from 'sonner';

interface TestResult {
  operacao: string;
  tempo: number;
  status: 'sucesso' | 'erro' | 'timeout';
  detalhes?: string;
}

export const PortfolioTimeoutTest: React.FC = () => {
  const { user } = useAuth();
  const [testando, setTestando] = useState(false);
  const [resultados, setResultados] = useState<TestResult[]>([]);
  const [relatorioPerformance, setRelatorioPerformance] = useState<any>(null);

  const executarTestesTimeout = async () => {
    if (!user) {
      toast.error('Usuário não autenticado para teste');
      return;
    }

    setTestando(true);
    setResultados([]);
    
    try {
      const novosResultados: TestResult[] = [];

      // Teste 1: UPDATE simples - logs removidos para produção
      const startTime1 = performance.now();
      
      try {
        await atualizarTrabalhoPortfolio(
          'test-id-' + Date.now(),
          { titulo: 'Teste de Timeout - ' + new Date().toISOString() },
          user.id
        );
        
        const tempo1 = performance.now() - startTime1;
        novosResultados.push({
          operacao: 'UPDATE Simples',
          tempo: tempo1,
          status: tempo1 > 15000 ? 'timeout' : 'sucesso'
        });
      } catch (error: any) {
        const tempo1 = performance.now() - startTime1;
        const isTimeout = error.message?.includes('timeout') || error.message?.includes('57014');
        
        novosResultados.push({
          operacao: 'UPDATE Simples',
          tempo: tempo1,
          status: isTimeout ? 'timeout' : 'erro',
          detalhes: error.message
        });
      }

      // Teste 2: UPDATE com dados grandes - logs removidos para produção
      const startTime2 = performance.now();
      
      try {
        const dadosGrandes = {
          titulo: 'Teste de Performance - ' + 'x'.repeat(100),
          descricao: 'Descrição longa para teste de performance - ' + 'y'.repeat(500),
          tags: Array.from({ length: 20 }, (_, i) => `tag-${i}`),
          categoria: 'Teste Performance'
        };

        await atualizarTrabalhoPortfolio(
          'test-large-' + Date.now(),
          dadosGrandes,
          user.id
        );
        
        const tempo2 = performance.now() - startTime2;
        novosResultados.push({
          operacao: 'UPDATE com Dados Grandes',
          tempo: tempo2,
          status: tempo2 > 15000 ? 'timeout' : 'sucesso'
        });
      } catch (error: any) {
        const tempo2 = performance.now() - startTime2;
        const isTimeout = error.message?.includes('timeout') || error.message?.includes('57014');
        
        novosResultados.push({
          operacao: 'UPDATE com Dados Grandes',
          tempo: tempo2,
          status: isTimeout ? 'timeout' : 'erro',
          detalhes: error.message
        });
      }

      // Teste 3: Múltiplos UPDATEs sequenciais - logs removidos para produção
      const startTime3 = performance.now();
      
      try {
        for (let i = 0; i < 3; i++) {
          await atualizarTrabalhoPortfolio(
            `test-multi-${i}-${Date.now()}`,
            { titulo: `Teste Multi ${i + 1}` },
            user.id
          );
        }
        
        const tempo3 = performance.now() - startTime3;
        novosResultados.push({
          operacao: 'Múltiplos UPDATEs (3x)',
          tempo: tempo3,
          status: tempo3 > 30000 ? 'timeout' : 'sucesso'
        });
      } catch (error: any) {
        const tempo3 = performance.now() - startTime3;
        const isTimeout = error.message?.includes('timeout') || error.message?.includes('57014');
        
        novosResultados.push({
          operacao: 'Múltiplos UPDATEs (3x)',
          tempo: tempo3,
          status: isTimeout ? 'timeout' : 'erro',
          detalhes: error.message
        });
      }

      setResultados(novosResultados);
      
      // Obter relatório de performance
      const relatorio = obterRelatorioPerformance();
      setRelatorioPerformance(relatorio);

      // Resumo dos testes
      const sucessos = novosResultados.filter(r => r.status === 'sucesso').length;
      const timeouts = novosResultados.filter(r => r.status === 'timeout').length;
      const erros = novosResultados.filter(r => r.status === 'erro').length;

      if (timeouts > 0) {
        toast.error(`❌ ${timeouts} teste(s) com timeout - correções precisam ser ajustadas`);
      } else if (erros > 0) {
        toast.warning(`⚠️ ${erros} teste(s) com erro - verificar implementação`);
      } else {
        toast.success(`✅ Todos os ${sucessos} testes passaram - correções funcionando!`);
      }

    } catch (error) {
      // Erro nos testes - logs removidos para produção
      toast.error('Erro geral nos testes');
    } finally {
      setTestando(false);
    }
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case 'sucesso': return 'bg-green-100 text-green-800';
      case 'timeout': return 'bg-red-100 text-red-800';
      case 'erro': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const obterIconeStatus = (status: string) => {
    switch (status) {
      case 'sucesso': return <CheckCircle className="w-4 h-4" />;
      case 'timeout': return <Clock className="w-4 h-4" />;
      case 'erro': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Teste de Correção - Timeout Portfolio
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Este componente testa se as correções para o erro 57014 estão funcionando.
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={executarTestesTimeout}
            disabled={testando || !user}
            className="w-full"
            size="lg"
          >
            {testando ? 'Executando Testes...' : 'Executar Testes de Timeout'}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {resultados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resultados.map((resultado, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {obterIconeStatus(resultado.status)}
                    <div>
                      <div className="font-medium">{resultado.operacao}</div>
                      {resultado.detalhes && (
                        <div className="text-sm text-muted-foreground">
                          {resultado.detalhes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono">
                      {resultado.tempo.toFixed(2)}ms
                    </span>
                    <Badge className={obterCorStatus(resultado.status)}>
                      {resultado.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Performance */}
      {relatorioPerformance && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {relatorioPerformance.sucessos}
                </div>
                <div className="text-sm text-muted-foreground">Sucessos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {relatorioPerformance.timeouts}
                </div>
                <div className="text-sm text-muted-foreground">Timeouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {relatorioPerformance.erros}
                </div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {relatorioPerformance.tempo_medio}ms
                </div>
                <div className="text-sm text-muted-foreground">Tempo Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como Interpretar os Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span><strong>SUCESSO:</strong> Operação completada sem timeout</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span><strong>TIMEOUT:</strong> Operação cancelada por exceder tempo limite</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span><strong>ERRO:</strong> Falha por outros motivos que não timeout</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};