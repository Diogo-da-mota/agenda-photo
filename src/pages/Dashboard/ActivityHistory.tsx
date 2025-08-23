import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Users, 
  Settings, 
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  Bell,
  FileSignature,
  CreditCard,
  User,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';

// Activity status types
type ActivityStatus = 'completed' | 'pending' | 'warning';

// Activity types
type ActivityType = 'agenda' | 'financeiro' | 'clientes' | 'configuracoes';

// Activity time period
type TimePeriod = '7days' | '30days' | 'all';

// Activity interface
interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  status: ActivityStatus;
  type: ActivityType;
  details?: string;
}

const ActivityHistory: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determinar aba ativa baseada na URL
  const getActiveTabFromUrl = () => {
    switch (location.pathname) {
      case '/atividades-linha-do-tempo':
        return 'timeline';
      case '/atividades-notificacoes':
        return 'notificacoes';
      case '/atividades-filtros':
        return 'filters';
      default:
        return 'timeline';
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState<TimePeriod>('30days');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expandedActivities, setExpandedActivities] = useState<Record<string, boolean>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notifications, setNotifications] = useState<Database['public']['Tables']['notificacoes']['Row'][]>([]);

  // Função para navegar entre abas
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'timeline':
        navigate('/atividades-linha-do-tempo');
        break;
      case 'notificacoes':
        navigate('/atividades-notificacoes');
        break;
      case 'filters':
        navigate('/atividades-filtros');
        break;
      default:
        navigate('/atividades-linha-do-tempo');
    }
  };

  // Buscar atividades reais do Supabase
  React.useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('sistema_atividades')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      if (error) {
        toast({ title: 'Erro ao buscar atividades', description: error.message, variant: 'destructive' });
        return;
      }
      // Mapear para o formato esperado pelo componente
      const mapped = (data || []).map((item: any) => ({
        id: item.id,
        title: `${item.operation} em ${item.table_name}`,
        description: item.new_data ? JSON.stringify(item.new_data) : '',
        timestamp: new Date(item.timestamp),
        status: 'completed' as ActivityStatus,
        type: 'configuracoes' as ActivityType, // garantir tipo correto
        details: item.old_data ? JSON.stringify(item.old_data) : undefined,
      }));
      setActivities(mapped);
    };
    fetchActivities();
  }, [user]);

  // Buscar notificações reais do Supabase
  React.useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false });
      if (error) {
        toast({ title: 'Erro ao buscar notificações', description: error.message, variant: 'destructive' });
        return;
      }
      setNotifications(data || []);
    };
    fetchNotifications();
  }, [user]);

  // Handle activity expansion
  const toggleExpand = (id: string) => {
    setExpandedActivities(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Clear history
  const clearHistory = () => {
    setActivities([]);
    setShowDeleteDialog(false);
    toast({
      title: "Histórico limpo",
      description: "Todas as atividades foram removidas com sucesso.",
    });
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    // Search filter
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    
    // Period filter
    const activityDate = new Date(activity.timestamp);
    const now = new Date();
    let matchesPeriod = true;
    
    if (periodFilter === '7days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchesPeriod = activityDate >= sevenDaysAgo;
    } else if (periodFilter === '30days') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchesPeriod = activityDate >= thirtyDaysAgo;
    }
    
    return matchesSearch && matchesType && matchesPeriod;
  });

  // Get status icon based on activity status
  const getStatusIcon = (status: ActivityStatus) => {
    switch (status) {
      case 'completed':
        return <Check className="text-green-500" />;
      case 'pending':
        return <Clock className="text-amber-500" />;
      case 'warning':
        return <AlertTriangle className="text-red-500" />;
      default:
        return null;
    }
  };

  // Get type icon based on activity type
  const getTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'agenda':
        return <Calendar className="text-blue-500" />;
      case 'financeiro':
        return <DollarSign className="text-green-500" />;
      case 'clientes':
        return <Users className="text-purple-500" />;
      case 'configuracoes':
        return <Settings className="text-gray-500" />;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Concluído</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Pendente</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Atenção</Badge>;
      default:
        return null;
    }
  };

  // Função para salvar nova notificação
  const salvarNotificacao = async (titulo: string, corpo: string) => {
    if (!user?.id) return;
    const { error } = await supabase.from('notificacoes').insert({
      titulo,
      corpo,
      lida: false,
      user_id: user.id
    });
    if (error) {
      toast({ title: 'Erro ao salvar notificação', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Notificação salva', description: 'Notificação criada com sucesso.' });
      // Recarregar notificações
      const { data } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false });
      setNotifications(data || []);
    }
  };

  // Marcar como lida
  const markAsRead = async (id: string) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      toast({ title: 'Erro ao marcar como lida', description: error.message, variant: 'destructive' });
    } else {
      setNotifications(notifications.map(n => n.id === id ? { ...n, lida: true } : n));
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!user?.id) return;
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('user_id', user.id);
    if (error) {
      toast({ title: 'Erro ao marcar todas como lidas', description: error.message, variant: 'destructive' });
    } else {
      setNotifications(notifications.map(n => ({ ...n, lida: true })));
    }
  };

  // Deletar notificação
  const deleteNotification = async (id: string) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from('notificacoes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      toast({ title: 'Erro ao deletar notificação', description: error.message, variant: 'destructive' });
    } else {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const unreadCount = notifications.filter(n => !n.lida).length;
  const formatNotificationDate = (date: string | null) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) {
      return `Hoje às ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return d.toLocaleString('pt-BR');
    }
  };

  return (
    <div className="container p-4 mx-auto max-w-5xl">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-center md:text-left w-full md:w-auto">Histórico de Atividades</h1>
          
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Histórico
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Limpar histórico de atividades?</DialogTitle>
                <DialogDescription>
                  Esta ação não pode ser desfeita. Isso removerá permanentemente todas as atividades registradas.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={clearHistory}>
                  Sim, limpar histórico
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={getActiveTabFromUrl()} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="mb-4 grid grid-cols-3 max-w-[600px]">
            <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações {unreadCount > 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded-full px-2">{unreadCount}</span>}</TabsTrigger>
            <TabsTrigger value="filters">Filtros</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <CardTitle>Linha do Tempo</CardTitle>
                    <CardDescription>
                      Histórico de ações realizadas na plataforma
                    </CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Buscar atividades..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredActivities.length > 0 ? (
                  <ul className="space-y-4">
                    {filteredActivities.map((activity) => (
                      <li 
                        key={activity.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getTypeIcon(activity.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{activity.title}</h3>
                                {getStatusBadge(activity.status)}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {activity.description}
                              </p>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(activity.timestamp)}
                              </div>
                              
                              {expandedActivities[activity.id] && activity.details && (
                                <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                                  {activity.details}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => toggleExpand(activity.id)}
                            >
                              {expandedActivities[activity.id] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma atividade encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notificacoes" className="mt-0">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>Gerencie todas as suas notificações da plataforma</CardDescription>
                </div>
                {unreadCount > 0 && (
                  <Button variant="outline" onClick={markAllAsRead} className="gap-2">
                    <Check className="h-4 w-4" />
                    Marcar todas como lidas
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => {
                    if (!user?.id) return;
                    supabase
                      .from('notificacoes')
                      .select('*')
                      .eq('user_id', user.id)
                      .order('criado_em', { ascending: false })
                      .then(({ data }) => setNotifications(data || []));
                  }}>Todas</Button>
                  <Button variant="ghost" size="sm" onClick={() => setNotifications(notifications.filter(n => !n.lida))}>Não lidas</Button>
                </div>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Bell className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-center text-muted-foreground">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <Card key={notification.id} className={`${notification.lida ? '' : 'border-l-4 border-l-blue-500'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-blue-50">
                              <Bell className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="font-medium">{notification.titulo}</h3>
                                  <p className="text-sm text-muted-foreground">{notification.corpo}</p>
                                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatNotificationDate(notification.criado_em)}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  {!notification.lida && (
                                    <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="filters" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>
                  Personalize a visualização do histórico de atividades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Atividade</label>
                  <Select 
                    value={typeFilter} 
                    onValueChange={(value) => setTypeFilter(value as ActivityType | 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="agenda">Agendamentos</SelectItem>
                      <SelectItem value="financeiro">Pagamentos</SelectItem>
                      <SelectItem value="clientes">Clientes</SelectItem>
                      <SelectItem value="configuracoes">Configurações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Período</label>
                  <Select 
                    value={periodFilter} 
                    onValueChange={(value) => setPeriodFilter(value as TimePeriod)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Últimos 7 dias</SelectItem>
                      <SelectItem value="30days">Últimos 30 dias</SelectItem>
                      <SelectItem value="all">Todo o histórico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => {
                      setTypeFilter('all');
                      setPeriodFilter('30days');
                      setSearchTerm('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ActivityHistory;
