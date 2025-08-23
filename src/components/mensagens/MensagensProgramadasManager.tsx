import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Phone,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
  RefreshCw
} from 'lucide-react';

import { 
  MensagensProgramadasService, 
  MensagemProgramada, 
  FiltrosMensagensProgramadas 
} from '@/services/mensagensProgramadasService';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';
import { formatarDataBrasileira } from '@/utils/dateFormatters';

interface MensagensProgramadasManagerProps {
  onClose?: () => void;
}

export const MensagensProgramadasManager: React.FC<MensagensProgramadasManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [mensagens, setMensagens] = useState<MensagemProgramada[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosMensagensProgramadas>({});
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    pendentes: 0,
    enviadas: 0,
    erros: 0,
    canceladas: 0
  });
  const [mensagemSelecionada, setMensagemSelecionada] = useState<MensagemProgramada | null>(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [acaoConfirmacao, setAcaoConfirmacao] = useState<'cancelar' | 'excluir' | null>(null);

  // Carregar mensagens e estatísticas
  const carregarDados = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Carregar mensagens
      const { mensagens: mensagensCarregadas } = await MensagensProgramadasService.listar(user.id, {
        ...filtros,
        limite: 50
      });
      setMensagens(mensagensCarregadas);

      // Carregar estatísticas
      const estatisticasCarregadas = await MensagensProgramadasService.obterEstatisticas(user.id);
      setEstatisticas(estatisticasCarregadas);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      logger.error('Erro ao carregar mensagens programadas', { error });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando componente montar ou filtros mudarem
  useEffect(() => {
    carregarDados();
  }, [user, filtros]);

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'enviada':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'erro':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cancelada':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Função para obter cor do badge do status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'default';
      case 'enviada':
        return 'default';
      case 'erro':
        return 'destructive';
      case 'cancelada':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Função para cancelar mensagem
  const handleCancelar = async (mensagem: MensagemProgramada) => {
    try {
      await MensagensProgramadasService.cancelar(mensagem.id, user!.id);
      await carregarDados();
      setMostrarConfirmacao(false);
      setMensagemSelecionada(null);
      logger.info('Mensagem cancelada com sucesso', { mensagemId: mensagem.id });
    } catch (error) {
      console.error('Erro ao cancelar mensagem:', error);
      logger.error('Erro ao cancelar mensagem', { error, mensagemId: mensagem.id });
    }
  };

  // Função para excluir mensagem
  const handleExcluir = async (mensagem: MensagemProgramada) => {
    try {
      await MensagensProgramadasService.excluir(mensagem.id, user!.id);
      await carregarDados();
      setMostrarConfirmacao(false);
      setMensagemSelecionada(null);
      logger.info('Mensagem excluída com sucesso', { mensagemId: mensagem.id });
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      logger.error('Erro ao excluir mensagem', { error, mensagemId: mensagem.id });
    }
  };

  // Função para confirmar ação
  const confirmarAcao = () => {
    if (!mensagemSelecionada || !acaoConfirmacao) return;

    if (acaoConfirmacao === 'cancelar') {
      handleCancelar(mensagemSelecionada);
    } else if (acaoConfirmacao === 'excluir') {
      handleExcluir(mensagemSelecionada);
    }
  };

  // Função para formatar telefone
  const formatarTelefone = (telefone: string) => {
    const numero = telefone.replace(/\D/g, '');
    if (numero.length === 11) {
      return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
    }
    return telefone;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mensagens Programadas</h2>
          <p className="text-muted-foreground">
            Gerencie suas mensagens agendadas para envio automático
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={carregarDados} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{estatisticas.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold">{estatisticas.pendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Enviadas</p>
                <p className="text-2xl font-bold">{estatisticas.enviadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Erros</p>
                <p className="text-2xl font-bold">{estatisticas.erros}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Canceladas</p>
                <p className="text-2xl font-bold">{estatisticas.canceladas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filtros.status || 'todos'}
                onValueChange={(value) => 
                  setFiltros(prev => ({ 
                    ...prev, 
                    status: value === 'todos' ? undefined : value as any 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="enviada">Enviadas</SelectItem>
                  <SelectItem value="erro">Com erro</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data-inicio">Data início</Label>
              <Input
                id="data-inicio"
                type="datetime-local"
                value={filtros.data_inicio || ''}
                onChange={(e) => 
                  setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="data-fim">Data fim</Label>
              <Input
                id="data-fim"
                type="datetime-local"
                value={filtros.data_fim || ''}
                onChange={(e) => 
                  setFiltros(prev => ({ ...prev, data_fim: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de mensagens */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : mensagens.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma mensagem encontrada</h3>
              <p className="text-muted-foreground">
                Não há mensagens programadas com os filtros selecionados.
              </p>
            </CardContent>
          </Card>
        ) : (
          mensagens.map((mensagem) => (
            <Card key={mensagem.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(mensagem.status)}
                      <h3 className="font-medium">{mensagem.titulo}</h3>
                      <Badge variant={getStatusBadgeVariant(mensagem.status)}>
                        {mensagem.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatarDataBrasileira(new Date(mensagem.data_programada))}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{formatarTelefone(mensagem.telefone)}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{mensagem.conteudo.length} caracteres</span>
                      </div>
                    </div>

                    {mensagem.erro_detalhes && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        <strong>Erro:</strong> {mensagem.erro_detalhes}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMensagemSelecionada(mensagem);
                        setMostrarDetalhes(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {mensagem.status === 'pendente' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMensagemSelecionada(mensagem);
                          setAcaoConfirmacao('cancelar');
                          setMostrarConfirmacao(true);
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMensagemSelecionada(mensagem);
                        setAcaoConfirmacao('excluir');
                        setMostrarConfirmacao(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de detalhes */}
      <Dialog open={mostrarDetalhes} onOpenChange={setMostrarDetalhes}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Mensagem</DialogTitle>
          </DialogHeader>
          
          {mensagemSelecionada && (
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <p className="text-sm">{mensagemSelecionada.titulo}</p>
              </div>

              <div>
                <Label>Conteúdo</Label>
                <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                  {mensagemSelecionada.conteudo}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <p className="text-sm">{formatarTelefone(mensagemSelecionada.telefone)}</p>
                </div>

                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(mensagemSelecionada.status)}
                    <Badge variant={getStatusBadgeVariant(mensagemSelecionada.status)}>
                      {mensagemSelecionada.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data programada</Label>
                  <p className="text-sm">
                    {formatarDataBrasileira(new Date(mensagemSelecionada.data_programada))}
                  </p>
                </div>

                <div>
                  <Label>Tentativas de envio</Label>
                  <p className="text-sm">{mensagemSelecionada.tentativas_envio}</p>
                </div>
              </div>

              {mensagemSelecionada.erro_detalhes && (
                <div>
                  <Label>Detalhes do erro</Label>
                  <div className="bg-red-50 p-3 rounded text-sm text-red-600">
                    {mensagemSelecionada.erro_detalhes}
                  </div>
                </div>
              )}

              {mensagemSelecionada.metadata && (
                <div>
                  <Label>Metadados</Label>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(mensagemSelecionada.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarDetalhes(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação */}
      <Dialog open={mostrarConfirmacao} onOpenChange={setMostrarConfirmacao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {acaoConfirmacao === 'cancelar' ? 'Cancelar Mensagem' : 'Excluir Mensagem'}
            </DialogTitle>
            <DialogDescription>
              {acaoConfirmacao === 'cancelar' 
                ? 'Tem certeza que deseja cancelar esta mensagem programada? Esta ação não pode ser desfeita.'
                : 'Tem certeza que deseja excluir esta mensagem programada? Esta ação não pode ser desfeita.'
              }
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarConfirmacao(false)}>
              Cancelar
            </Button>
            <Button 
              variant={acaoConfirmacao === 'excluir' ? 'destructive' : 'default'}
              onClick={confirmarAcao}
            >
              {acaoConfirmacao === 'cancelar' ? 'Cancelar Mensagem' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};