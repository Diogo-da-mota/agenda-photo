
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sample data for client payments
const samplePayments = [
  {
    id: 1,
    eventId: 1,
    eventTitle: "Ensaio Pré-Wedding",
    date: new Date("2023-10-15"),
    installment: "Pagamento único",
    amount: 800,
    status: "paid",
    method: "Transferência",
    receipt: true
  },
  {
    id: 2,
    eventId: 2,
    eventTitle: "Casamento",
    date: new Date("2023-10-20"),
    installment: "Entrada (50%)",
    amount: 1750,
    status: "paid",
    method: "Cartão de Crédito",
    receipt: true
  },
  {
    id: 3,
    eventId: 2,
    eventTitle: "Casamento",
    date: new Date("2023-12-20"),
    installment: "Parcela final (50%)",
    amount: 1750,
    status: "pending",
    method: "Pendente",
    receipt: false
  },
  {
    id: 4,
    eventId: 3,
    eventTitle: "Book de Gestante",
    date: new Date("2023-11-10"),
    installment: "Entrada",
    amount: 500,
    status: "paid",
    method: "PIX",
    receipt: true
  },
  {
    id: 5,
    eventId: 3,
    eventTitle: "Book de Gestante",
    date: new Date("2024-01-20"),
    installment: "Pagamento final",
    amount: 700,
    status: "pending",
    method: "Pendente",
    receipt: false
  }
];

// Status properties
const paymentStatusProps = {
  paid: {
    label: "Pago",
    badge: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    icon: CheckCircle
  },
  pending: {
    label: "Pendente",
    badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    icon: Clock
  },
  overdue: {
    label: "Atrasado",
    badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    icon: AlertCircle
  }
};

const ClientPayments = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  
  // Filter payments based on tab
  const filteredPayments = samplePayments.filter(payment => {
    if (activeTab === 'all') return true;
    return payment.status === activeTab;
  });
  
  // Group payments by event
  const paymentsByEvent = filteredPayments.reduce((acc, payment) => {
    const eventId = payment.eventId;
    if (!acc[eventId]) {
      acc[eventId] = {
        id: eventId,
        title: payment.eventTitle,
        payments: []
      };
    }
    acc[eventId].payments.push(payment);
    return acc;
  }, {});
  
  // Generate receipt handler
  const handleGenerateReceipt = (paymentId) => {
    
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Meus Pagamentos</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="paid">Pagos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-6">
            {Object.values(paymentsByEvent).length > 0 ? (
              Object.values(paymentsByEvent).map((eventGroup: any) => (
                <Card key={eventGroup.id}>
                  <CardHeader className="pb-3">
                    <CardTitle>{eventGroup.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventGroup.payments.map(payment => {
                        const StatusIcon = paymentStatusProps[payment.status].icon;
                        
                        return (
                          <div key={payment.id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <StatusIcon className="h-4 w-4" />
                                <h3 className="font-medium">{payment.installment}</h3>
                                <Badge className={paymentStatusProps[payment.status].badge}>
                                  {paymentStatusProps[payment.status].label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Data: {format(payment.date, "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Método: {payment.method}
                              </p>
                            </div>
                            
                            <div className="mt-3 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-3">
                              <div className="text-right">
                                <p className="font-medium">R$ {payment.amount.toFixed(2)}</p>
                              </div>
                              
                              {payment.status === 'paid' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-1"
                                  onClick={() => handleGenerateReceipt(payment.id)}
                                >
                                  <Receipt className="h-4 w-4" />
                                  Recibo
                                </Button>
                              )}
                              
                              {payment.status === 'pending' && (
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  className="flex items-center gap-1"
                                  onClick={() => console.log('Pagar online não implementado')}
                                >
                                  <CreditCard className="h-4 w-4" />
                                  Pagar Online
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum pagamento encontrado com os filtros selecionados.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientPayments;
