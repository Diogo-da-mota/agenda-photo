import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { entregaFotosAutomaticService } from '@/services/entregaFotosAutomaticService';
import { EstatisticasGalerias } from '@/types/entregar-fotos';
import { 
  RefreshCw, 
  Database, 
  Shield, 
  Trash2, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';

const EntregaFotosAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState<EstatisticasGalerias | null>(null);
  const [ultimaExecucao, setUltimaExecucao] = useState<string | null>(null);
  const [executandoProcessos, setExecutandoProcessos] = useState(false);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      const stats = await entregaFotosAutomaticService.obterEstatisticas();
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const executarProcessosManual = async () => {
    try {
      setExecutandoProcessos(true);
      toast.info('Iniciando processos automáticos...');
      
      const resultado = await entregaFotosAutomaticService.executarProcessosAutomaticos();
      
      setUltimaExecucao(new Date().toLocaleString('pt-BR'));
      await carregarEstatisticas();
      
      toast.success(`Processos concluídos! ${resultado.resumo.total_processadas} galerias processadas`);
    } catch (error) {
      console.error('Erro ao executar processos:', error);
      toast.error('Erro ao executar processos automáticos');
    } finally {
      setExecutandoProcessos(false);
    }
  };

  const executarVerificacaoExpiracao = async () => {
    try {
      setLoading(true);
      const resultado = await entregaFotosAutomaticService.verificarExpiracao();
      await carregarEstatisticas();
      toast.success(`${resultado.galerias_expiradas} galerias marcadas como expiradas`);
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast.error('Erro na verificação de expiração');
    } finally {
      setLoading(false);
    }
  };

  const executarLimpeza = async () => {
    try {
      setLoading(true);
      const resultado = await entregaFotosAutomaticService.limpezaArquivosAntigos();
      await carregarEstatisticas();
      toast.success(`${resultado.galerias_arquivadas} galerias arquivadas`);
    } catch (error) {
      console.error('Erro na limpeza:', error);
      toast.error('Erro na limpeza de arquivos');
    } finally {
      setLoading(false);
    }
  };

  const verificarPoliticasRLS = async () => {
    try {
      setLoading(true);
      const resultado = await entregaFotosAutomaticService.aplicarPoliticasRLS();
      
      if (resultado.rls_ativo && resultado.politicas_existem) {
        toast.success('Políticas RLS estão ativas e configuradas');
      } else {
        toast.warning('Algumas políticas RLS podem estar faltando');
      }
    } catch (error) {
      console.error('Erro na verificação RLS:', error);
      toast.error('Erro na verificação de políticas RLS');
    } finally {
      setLoading(false);
    }
  };

  const executarBackup = async () => {
    try {
      setLoading(true);
      const resultado = await entregaFotosAutomaticService.backupSeguranca();
      toast.success(`Backup criado com ${resultado.galerias_backup} galerias`);
    } catch (error) {
      console.error('Erro no backup:', error);
      toast.error('Erro ao criar backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Administração - Entrega de Fotos</h2>
        <Button 
          onClick={carregarEstatisticas}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{estatisticas?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas?.ativas || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Expiradas</p>
                <p className="text-2xl font-bold text-orange-600">{estatisticas?.expiradas || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Arquivadas</p>
                <p className="text-2xl font-bold text-gray-600">{estatisticas?.arquivadas || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Acessos</p>
                <p className="text-2xl font-bold text-purple-600">{estatisticas?.totalAcessos || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Processos Automáticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Processos Automáticos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ultimaExecucao && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Última execução: {ultimaExecucao}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={executarProcessosManual}
              disabled={loading || executandoProcessos}
              className="w-full"
            >
              {executandoProcessos ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Executar Todos
            </Button>

            <Button
              onClick={executarVerificacaoExpiracao}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              Verificar Expiração
            </Button>

            <Button
              onClick={executarLimpeza}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpeza Arquivos
            </Button>

            <Button
              onClick={verificarPoliticasRLS}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Verificar RLS
            </Button>

            <Button
              onClick={executarBackup}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              Criar Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status dos Processos */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Processos Automáticos</span>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Intervalo de Execução</span>
              <Badge variant="secondary">60 minutos</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Registro de Acessos</span>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntregaFotosAdmin;