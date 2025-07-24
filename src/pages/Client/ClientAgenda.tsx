
import React, { useState, useEffect } from 'react';
import { format, isFuture, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Filter, Search, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCalendario } from '@/hooks/useCalendario';
import { orcamentoService, SolicitacaoOrcamento } from '@/services/orcamentoService';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';
import { buscarEventos } from '@/services/agendaService';
import { Event } from '@/components/agenda/types';

// Interface para eventos do cliente
interface ClientEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
  photographer: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled' | 'upcoming' | 'past';
  totalValue: number;
  paidValue: number;
  remainingValue: number;
  notes?: string;
}

// Status color mapping para eventos
const statusColors = {
  completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  pending: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
  canceled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
};

// Status labels para eventos
const statusLabels = {
  completed: "Realizado",
  confirmed: "Confirmado",
  pending: "Aguardando",
  canceled: "Cancelado"
};

// Status color mapping para orçamentos
const orcamentoStatusColors = {
  pendente: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
  em_analise: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  respondido: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  cancelado: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
};

// Status labels para orçamentos
const orcamentoStatusLabels = {
  pendente: "Pendente",
  em_analise: "Em Análise",
  respondido: "Respondido",
  cancelado: "Cancelado"
};

// Ícones para status de orçamentos
const orcamentoStatusIcons = {
  pendente: Clock,
  em_analise: FileText,
  respondido: CheckCircle,
  cancelado: XCircle
};

const ClientAgenda = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [orcamentos, setOrcamentos] = useState<SolicitacaoOrcamento[]>([]);
  const [orcamentosLoading, setOrcamentosLoading] = useState(false);
  const [orcamentosError, setOrcamentosError] = useState<string | null>(null);
  
  // Estados para eventos reais
  const [events, setEvents] = useState<ClientEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  
  // Hook para gerenciar dados do calendário (integração com /agenda)
  const { eventDates, isLoading: calendarLoading, error: calendarError } = useCalendario();
  const { user } = useAuth();
  
  // Função para converter Event para ClientEvent
  const convertEventToClientEvent = (event: Event): ClientEvent => {
    return {
      id: event.id,
      title: `${event.clientName} - ${event.eventType}`,
      date: event.date,
      location: event.location || 'Local não informado',
      photographer: event.phone || 'Telefone não informado',
      status: event.status,
      totalValue: event.totalValue || 0,
      paidValue: event.downPayment || 0,
      remainingValue: event.remainingValue || 0,
      notes: event.notes
    };
  };

  // Função para buscar eventos reais
  const buscarEventosReais = async () => {
    if (!user?.id) {
      setEventsError('Usuário não autenticado');
      return;
    }

    setEventsLoading(true);
    setEventsError(null);

    try {
      const eventosData = await buscarEventos(user.id);
      const eventosConvertidos = eventosData.map(convertEventToClientEvent);
      setEvents(eventosConvertidos);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      setEventsError('Erro ao carregar eventos. Tente novamente.');
    } finally {
      setEventsLoading(false);
    }
  };

  // Função para buscar orçamentos do usuário
  const buscarOrcamentos = async () => {
    if (!user?.id) return;
    
    try {
      setOrcamentosLoading(true);
      setOrcamentosError(null);
      logger.info('[ClientAgenda] Buscando orçamentos do usuário:', user.id);
      
      const orcamentosData = await orcamentoService.buscarSolicitacoes(user.id);
      setOrcamentos(orcamentosData);
      logger.info('[ClientAgenda] Orçamentos carregados:', orcamentosData.length);
    } catch (error) {
      logger.error('[ClientAgenda] Erro ao buscar orçamentos:', error);
      setOrcamentosError('Erro ao carregar orçamentos. Tente novamente.');
    } finally {
      setOrcamentosLoading(false);
    }
  };
  
  // Carregar dados quando o componente for montado
  useEffect(() => {
    buscarOrcamentos();
    buscarEventosReais();
  }, [user?.id]);
  
  // Função para verificar se uma data está ocupada (tem eventos)
  const isDateOccupied = (date: Date) => {
    return eventDates.some(eventDate => 
      format(eventDate.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  // Função para lidar com cliques no calendário
  const handleDateClick = (date: Date | undefined) => {
    if (date && !isDateOccupied(date)) {
      // Só permite seleção se a data não estiver ocupada
      setSelectedDate(date);
    }
    // Se a data estiver ocupada, não faz nada (conforme solicitado)
  };

  // Filter events based on search, status and tab
  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    // Tab filter (upcoming/past)
    const isUpcoming = isFuture(event.date);
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'upcoming' && isUpcoming) ||
      (activeTab === 'past' && !isUpcoming);
    
    return matchesSearch && matchesStatus && matchesTab;
  });
  
  // Filter orçamentos based on search and status
  const filteredOrcamentos = orcamentos.filter(orcamento => {
    // Search filter
    const matchesSearch = 
      orcamento.nome_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orcamento.tipo_evento.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (orcamento.numero_referencia && orcamento.numero_referencia.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter for orçamentos
    const matchesStatus = statusFilter === 'all' || orcamento.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen w-full">
      <div className="w-[90%] max-w-none mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Minha Agenda</h1>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Todos os status</option>
              {activeTab === 'orcamentos' ? (
                <>
                  <option value="pendente">Pendente</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="respondido">Respondido</option>
                  <option value="cancelado">Cancelado</option>
                </>
              ) : (
                <>
                  <option value="confirmed">Confirmados</option>
                  <option value="pending">Aguardando</option>
                  <option value="completed">Realizados</option>
                  <option value="canceled">Cancelados</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calendarError && (
                <div className="text-sm text-red-600 mb-2 p-2 bg-red-50 rounded">
                  {calendarError}
                </div>
              )}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateClick}
                eventDates={eventDates}
                className="border-0 pointer-events-auto"
                locale={ptBR}
                disabled={(date) => isDateOccupied(date)}
              />
              {calendarLoading && (
                <div className="text-sm text-muted-foreground mt-2 text-center">
                  Carregando eventos...
                </div>
              )}
              <div className="mt-4 text-xs text-muted-foreground">
                <p>• Datas coloridas: eventos já agendados</p>
                <p>• Clique apenas em datas disponíveis</p>
              </div>
            </CardContent>
          </Card>

          {/* Events list */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="upcoming">Próximos</TabsTrigger>
                <TabsTrigger value="past">Passados</TabsTrigger>
                <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
              </TabsList>
              
              {/* Conteúdo das abas de eventos */}
              {activeTab !== 'orcamentos' && (
                <TabsContent value={activeTab} className="mt-6">
                  {eventsError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{eventsError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={buscarEventosReais}
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  )}
                  
                  {eventsLoading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Carregando eventos...</p>
                    </div>
                  ) : filteredEvents.length > 0 ? (
                    <div className="space-y-4">
                      {filteredEvents.map(event => (
                        <Card key={event.id} className="overflow-hidden">
                          <div className={`px-6 py-3 ${statusColors[event.status]}`}>
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">{event.title}</h3>
                              <Badge variant="outline" className="font-normal">
                                {statusLabels[event.status]}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-sm">
                                  <strong>Data:</strong> {format(event.date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                                <p className="text-sm">
                                  <strong>Local:</strong> {event.location}
                                </p>
                                <div className="flex items-center text-sm sm:text-base">
                                  <strong className="mr-1">
                                    <span className="sm:hidden">Celular:</span>
                                    <span className="hidden sm:inline">Telefone:</span>
                                  </strong>
                                  {event.photographer !== 'Telefone não informado' ? (
                                    <>
                                      <span>{event.photographer.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4')}</span> 
                                      <a
                                        href={`https://wa.me/55${event.photographer.replace(/\D/g, '')}`} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1 text-green-600 hover:text-green-800"
                                        title="Conversar no WhatsApp"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="23" height="23" viewBox="0 0 48 48">
                                          <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6	C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path><path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6	C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3	L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path><path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3	L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24	c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2	c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path><path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8	l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path><path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0	s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3	c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9	c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8	c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"></path>
                                        </svg>
                                      </a>
                                    </>
                                  ) : (
                                    <span>{event.photographer}</span>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm">
                                  <strong>Valor Total:</strong> R$ {event.totalValue.toFixed(2)}
                                </p>
                                <p className="text-sm">
                                  <strong>Valor Pago:</strong> R$ {event.paidValue.toFixed(2)}
                                </p>
                                <p className="text-sm">
                                  <strong>Valor Restante:</strong> R$ {event.remainingValue.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            
                            {event.notes && (
                              <div className="mt-4 pt-4 border-t">
                                <p className="text-sm">
                                  <strong>Observações:</strong> {event.notes}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">
                        {events.length === 0 
                          ? 'Nenhum evento agendado ainda' 
                          : 'Nenhum evento encontrado com os filtros selecionados'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {events.length === 0 
                          ? 'Seus eventos agendados aparecerão aqui.' 
                          : 'Tente ajustar os filtros para ver mais eventos.'
                        }
                      </p>
                    </div>
                  )}
                </TabsContent>
              )}
              
              {/* Conteúdo da aba de Orçamentos */}
              {activeTab === 'orcamentos' && (
                <TabsContent value="orcamentos" className="mt-6">
                  {orcamentosError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{orcamentosError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={buscarOrcamentos}
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  )}
                  
                  {orcamentosLoading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Carregando orçamentos...</p>
                    </div>
                  ) : filteredOrcamentos.length > 0 ? (
                    <div className="space-y-4">
                      {filteredOrcamentos.map(orcamento => {
                        const StatusIcon = orcamentoStatusIcons[orcamento.status || 'pendente'];
                        return (
                          <Card key={orcamento.id} className="overflow-hidden">
                            <div className={`px-6 py-3 ${orcamentoStatusColors[orcamento.status || 'pendente']}`}>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <StatusIcon className="h-4 w-4" />
                                  <h3 className="font-medium">{orcamento.tipo_evento} - {orcamento.numero_referencia}</h3>
                                </div>
                                <Badge variant="outline" className="font-normal">
                                  {orcamentoStatusLabels[orcamento.status || 'pendente']}
                                </Badge>
                              </div>
                            </div>
                            <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    <strong>Nome:</strong> {orcamento.nome_completo}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Tipo de Evento:</strong> {orcamento.tipo_evento}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Email:</strong> {orcamento.email}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Telefone:</strong> {orcamento.telefone}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  {orcamento.data_pretendida && (
                                    <p className="text-sm">
                                      <strong>Data Pretendida:</strong> {format(new Date(orcamento.data_pretendida), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                    </p>
                                  )}
                                  {orcamento.local_evento && (
                                    <p className="text-sm">
                                      <strong>Local:</strong> {orcamento.local_evento}
                                    </p>
                                  )}
                                  {orcamento.numero_participantes && (
                                    <p className="text-sm">
                                      <strong>Participantes:</strong> {orcamento.numero_participantes}
                                    </p>
                                  )}
                                  {orcamento.duracao_estimada && (
                                    <p className="text-sm">
                                      <strong>Duração:</strong> {orcamento.duracao_estimada}
                                    </p>
                                  )}
                                  <p className="text-sm">
                                    <strong>Criado em:</strong> {orcamento.data_criacao ? format(new Date(orcamento.data_criacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              {orcamento.detalhes_adicionais && (
                                <div className="mt-4 pt-4 border-t">
                                  <p className="text-sm">
                                    <strong>Detalhes Adicionais:</strong> {orcamento.detalhes_adicionais}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Nenhum orçamento encontrado</p>
                      <p className="text-sm text-muted-foreground">Seus orçamentos solicitados aparecerão aqui.</p>
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAgenda;
