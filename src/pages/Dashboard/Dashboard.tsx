import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, CreditCard, TrendingUp, Gift, MessageSquare, History, BarChart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClientLoginModal from '@/components/client/ClientLoginModal';
import RecentActivities from '@/components/dashboard/RecentActivities';
import { PortalErrorBoundary } from '@/components/ui/PortalErrorBoundary';
import { 
  buscarContagemProximosEventos,
  buscarTotalEventosCriados,
  buscarTotalClientes,
  buscarPagamentosMesAtual,
  buscarFaturamentoMesAtual,
  buscarReceitaTotalAnoAtual,
  registrarCallbackAtualizacaoFinanceiro,
  buscarEventosComValoresEntradas,
  buscarEventosComValoresRestantes
} from '@/services/agendaService';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

const Dashboard = () => {
  const [isClientLoginOpen, setIsClientLoginOpen] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  // Verifica se o usuário é admin
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';

  const queryOptions = {
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
    enabled: !!userId,
  };

  const { data: proximosEventos, isLoading: isLoadingProximosEventos } = useQuery({
    queryKey: ['dashboard_proximosEventos', userId],
    queryFn: () => buscarContagemProximosEventos(userId!),
    ...queryOptions,
  });

  const { data: totalEventos, isLoading: isLoadingTotalEventos } = useQuery({
    queryKey: ['dashboard_totalEventos', userId],
    queryFn: () => buscarTotalEventosCriados(userId!),
    ...queryOptions,
  });

  const { data: totalClientesAtivos, isLoading: isLoadingTotalClientes } = useQuery({
    queryKey: ['dashboard_totalClientes', userId],
    queryFn: () => buscarTotalClientes(userId!),
    ...queryOptions,
  });

  const { data: pagamentosMesAtual, isLoading: isLoadingPagamentos } = useQuery({
    queryKey: ['dashboard_pagamentosMesAtual', userId],
    queryFn: () => buscarPagamentosMesAtual(userId!),
    ...queryOptions,
  });

  const { data: receitaTotalAnoAtual, isLoading: isLoadingReceita } = useQuery({
    queryKey: ['dashboard_receitaTotalAnoAtual', userId],
    queryFn: () => buscarReceitaTotalAnoAtual(userId!),
    ...queryOptions,
  });
  
  const isLoading = isLoadingProximosEventos || isLoadingTotalEventos || isLoadingTotalClientes || isLoadingPagamentos || isLoadingReceita;

  // Registrar callback para atualização financeira em tempo real
  useEffect(() => {
    if (!userId) return;

    const callback = (currentUserId: string) => {
      if (currentUserId === userId) {
        logger.debug('Callback financeiro recebido, invalidando queries do dashboard...', null, 'Dashboard');
        queryClient.invalidateQueries({ queryKey: ['dashboard_pagamentosMesAtual', userId] });
        queryClient.invalidateQueries({ queryKey: ['dashboard_receitaTotalAnoAtual', userId] });
      }
    };

    registrarCallbackAtualizacaoFinanceiro(callback);
    
    // Cleanup: Ao desmontar, remove o callback para evitar memory leaks.
    return () => {
      registrarCallbackAtualizacaoFinanceiro(() => {});
    };
  }, [userId, queryClient]);

  // Função para formatar valores monetários
  const formatarMoeda = (valor: number | null | undefined): string => {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };
  
  // Função para obter o nome do mês atual
  const obterNomeMesAtual = (): string => {
    return new Date().toLocaleString('pt-BR', { month: 'long' });
  };
  
  return (
    <div className="space-y-6 p-4 pt-0">
      <PortalErrorBoundary>
        <ClientLoginModal isOpen={isClientLoginOpen} onOpenChange={setIsClientLoginOpen} />
      </PortalErrorBoundary>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo(a) de volta!</h1>
        
        <div className="flex gap-2">
          {isAdmin && (
            <Button 
              onClick={() => setIsClientLoginOpen(true)} 
              className="flex items-center gap-2"
              style={{ backgroundColor: '#DC2626' }}
            >
              <Users size={16} />
              Portal do Cliente
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos em 2 semanas</CardTitle>
            <CardDescription>Total de eventos: {isLoading ? '...' : totalEventos ?? 0}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Carregando...</span>
              </div>
            ) : (
              <div className="text-2xl font-bold">{proximosEventos ?? 0}</div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/agenda">
              <Button variant="ghost" size="sm" className="h-8 w-full justify-start px-2">
                <CalendarDays className="mr-2 h-4 w-4" />
                Ver agenda
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <CardDescription>Total de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Carregando...</span>
              </div>
            ) : (
              <div className="text-2xl font-bold">{totalClientesAtivos ?? 0}</div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/clientes">
              <Button variant="ghost" size="sm" className="h-8 w-full justify-start px-2">
                <Users className="mr-2 h-4 w-4" />
                Ver clientes
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos</CardTitle>
            <CardDescription>Entrada do mês de {obterNomeMesAtual()}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <div className="text-2xl font-bold">{formatarMoeda(pagamentosMesAtual)}</div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/financeiro">
              <Button variant="ghost" size="sm" className="h-8 w-full justify-start px-2">
                <CreditCard className="mr-2 h-4 w-4" />
                Ver financeiro
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <CardDescription>Receita Total do ano atual</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <div className="text-2xl font-bold">{formatarMoeda(receitaTotalAnoAtual)}</div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/relatorios">
              <Button variant="ghost" size="sm" className="h-8 w-full justify-start px-2">
                <BarChart className="mr-2 h-4 w-4" />
                Ver relatórios
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities Section */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl">Atividades Recentes</CardTitle>
              <CardDescription>
                Últimas ações realizadas na plataforma
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <RecentActivities />
          </CardContent>
        </Card>
        
        <Card className="border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-500" />
              Indique e Ganhe
            </CardTitle>
            <CardDescription>
              Convide outros fotógrafos e ganhe benefícios exclusivos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-white/80 dark:bg-gray-800/60 p-4 border border-amber-200 dark:border-amber-800/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Amigos indicados</h3>
                    <p className="text-xs text-muted-foreground">10% de desconto desbloqueado!</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-amber-400 dark:bg-amber-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/indique-ganhe" className="w-full">
              <Button className="w-full bg-amber-500 hover:bg-amber-600">
                <Gift className="mr-2 h-4 w-4" />
                Convidar amigos
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
