
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  CreditCard, 
  Clock, 
  FileSignature, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { buscarEventosProximos10Dias } from '@/services/agendaService';
import { Event } from '@/components/agenda/types';
import { generateContractUrl } from '@/utils/slugify';

// Sample data for payments and contracts - in a real app this would come from an API
const pendingPayments = [
  {
    id: 3,
    eventId: 2,
    eventTitle: "Ensaio Pré-Wedding",
    date: new Date("2023-12-20"),
    installment: "Parcela final (50%)",
    amount: 1750,
    status: "pending"
  },
  {
    id: 5,
    eventId: 3,
    eventTitle: "Book de Gestante",
    date: new Date("2024-01-20"),
    installment: "Pagamento final",
    amount: 700,
    status: "pending"
  }
];

const pendingContracts = [
  {
    id_contrato: "16023678",
    title: "Contrato de Sessão Fotográfica",
    sentDate: new Date("2023-11-05"),
    status: "pending",
    event: "Ensaio Familiar - 15/12/2023"
  }
];

// Status color mapping
const statusColors = {
  completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  pending: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
  canceled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
};

// Status labels
const statusLabels = {
  completed: "Realizado",
  confirmed: "Confirmado",
  pending: "Aguardando",
  canceled: "Cancelado"
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const events = await buscarEventosProximos10Dias(user.id);
        setUpcomingEvents(events);
      } catch (error) {
        console.error('Erro ao buscar eventos próximos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [user?.id]);

  // Calculate summary values
  const totalPendingAmount = pendingPayments.reduce((total, payment) => total + payment.amount, 0);
  const totalContractsPending = pendingContracts.length;
  const totalUpcomingEvents = upcomingEvents.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/cliente/notificacoes" className="ml-auto">
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            Preferências de Notificação
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUpcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              {totalUpcomingEvents > 0 
                ? `Próximo: ${format(upcomingEvents[0].date, "dd/MM/yyyy", { locale: ptBR })}` 
                : "Nenhum evento agendado"}
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/cliente/agenda" className="w-full">
              <Button variant="outline" className="w-full">Ver Agenda</Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPendingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments.length} pagamentos pendentes
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/cliente/pagamentos" className="w-full">
              <Button variant="outline" className="w-full">Ver Pagamentos</Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Pendentes</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContractsPending}</div>
            <p className="text-xs text-muted-foreground">
              {totalContractsPending > 0 
                ? "Contratos aguardando assinatura" 
                : "Nenhum contrato pendente"}
            </p>
          </CardContent>
          <CardFooter>
            {totalContractsPending > 0 ? (
              <Link to={generateContractUrl(pendingContracts[0]?.id_contrato || "16023678", pendingContracts[0]?.event || "Contrato").replace('/contrato/', '/cliente/contrato/')} className="w-full">
                <Button variant="outline" className="w-full">Assinar Contrato</Button>
              </Link>
            ) : (
              <Link to="/cliente/contratos" className="w-full">
                <Button variant="outline" className="w-full" disabled={totalContractsPending === 0}>
                  Ver Contratos
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Events and Payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Próximos Eventos</CardTitle>
              <Link to="/cliente/agenda" className="text-sm text-primary flex items-center">
                Ver todos <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Carregando eventos...</p>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="bg-muted rounded-md p-2 flex items-center justify-center">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{event.clientName}</h3>
                        <Badge className={statusColors[event.status] || statusColors.pending}>
                          {statusLabels[event.status] || statusLabels.pending}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Nenhum evento nos próximos 10 dias.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Pagamentos Pendentes</CardTitle>
              <Link to="/cliente/pagamentos" className="text-sm text-primary flex items-center">
                Ver todos <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingPayments.length > 0 ? (
              <div className="space-y-4">
                {pendingPayments.map(payment => (
                  <div key={payment.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="bg-muted rounded-md p-2 flex items-center justify-center">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{payment.eventTitle}</h3>
                        <p className="font-medium">
                          {payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{payment.installment}</p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {format(payment.date, "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Nenhum pagamento pendente.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contracts Section */}
      {pendingContracts.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Contratos Pendentes de Assinatura</CardTitle>
              <Link to="/cliente/contratos" className="text-sm text-primary flex items-center">
                Ver todos <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingContracts.map(contract => (
                <div key={contract.id_contrato} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 rounded-md p-2 flex items-center justify-center">
                    <FileSignature className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{contract.title}</h3>
                      <Badge variant="outline" className="gap-1 text-amber-500 border-amber-500">
                        <Clock size={12} /> Pendente
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{contract.event}</p>
                    <p className="text-sm text-muted-foreground">
                      Enviado em: {format(contract.sentDate, "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    <div className="pt-2">
                      <Link to={generateContractUrl(contract.id_contrato, contract.event).replace('/contrato/', '/cliente/contrato/')}>
                        <Button 
                          size="sm" 
                          className="gap-2"
                        >
                          <FileSignature className="h-4 w-4" />
                          Visualizar e Assinar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Contratos</CardTitle>
              <Link to="/cliente/contratos" className="text-sm text-primary flex items-center">
                Ver todos <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <FileSignature className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhum contrato pendente de assinatura.</p>
              <Link to="/cliente/contratos" className="mt-3 inline-block">
                <Button variant="outline" size="sm">
                  Ver todos os contratos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientDashboard;
