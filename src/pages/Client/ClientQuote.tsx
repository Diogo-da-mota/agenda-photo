
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Clock, Info, Landmark, MapPin, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { orcamentoService, SolicitacaoOrcamento, TipoEvento } from '@/services/orcamentoService';
import { criarEvento } from '@/services/agendaService';
import type { Event } from '@/components/agenda/types';
import { useEffect } from 'react';

// Event types options (fallback se não conseguir carregar do banco)
const eventTypesFallback = [
  "Casamento",
  "Aniversário",
  "Ensaio",
  "Corporativo",
  "Formatura",
  "Gestante",
  "Recém-nascido",
  "Outro"
];

const ClientQuote = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [attendees, setAttendees] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [eventTypes, setEventTypes] = useState<TipoEvento[]>([]);
  const [numeroReferencia, setNumeroReferencia] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar tipos de evento do banco de dados
  useEffect(() => {
    const carregarTiposEvento = async () => {
      try {
        const tipos = await orcamentoService.buscarTiposEvento();
        setEventTypes(tipos);
      } catch (error) {
        console.error('Erro ao carregar tipos de evento:', error);
        // Usar fallback em caso de erro
        const tiposFallback: TipoEvento[] = eventTypesFallback.map((nome, index) => ({
          id: index + 1,
          nome,
          ativo: true,
          ordem_exibicao: index + 1
        }));
        setEventTypes(tiposFallback);
      }
    };

    carregarTiposEvento();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para solicitar um orçamento.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!eventDate) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data para o evento",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Criar solicitação de orçamento
      const novaSolicitacao: SolicitacaoOrcamento = {
        nome_completo: name,
        email: email,
        telefone: phone,
        tipo_evento: eventType,
        data_pretendida: eventDate,
        local_evento: location,
        numero_participantes: attendees ? parseInt(attendees) : null,
        duracao_estimada: duration,
        detalhes_adicionais: description,
        status: 'pendente'
      };

      const solicitacaoCriada = await orcamentoService.criarSolicitacao(novaSolicitacao, user.id);
      
      // Criar evento na agenda
      const novoEvento: Event = {
        id: '', // Será gerado pelo banco
        clientName: name,
        phone: phone,
        birthday: null,
        eventType: eventType,
        date: eventDate,
        time: '14:00', // Horário padrão
        location: location || '',
        totalValue: 0, // Valor será definido posteriormente
        downPayment: 0,
        remainingValue: 0,
        notes: description || '',
        status: 'pending',
        reminderSent: false,
        cpf_cliente: undefined,
        endereco_cliente: undefined
      };

      await criarEvento(novoEvento, user.id);
      
      // Armazenar número de referência para exibir
      setNumeroReferencia(solicitacaoCriada.numero_referencia || '');
      
      // Show success state
      setShowSuccess(true);
      
      toast({
        title: "Solicitação enviada com sucesso!",
        description: `Sua solicitação foi registrada com o número ${solicitacaoCriada.numero_referencia} e o evento foi adicionado à agenda.`,
      });
      
      // Reset form after 5 seconds
      setTimeout(() => {
        resetForm();
      }, 5000);
    } catch (error) {
      console.error('Erro ao criar solicitação de orçamento:', error);
      toast({
        title: "Erro ao enviar solicitação",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setEventType('');
    setEventDate(undefined);
    setLocation('');
    setDuration('');
    setAttendees('');
    setDescription('');
    setShowSuccess(false);
    setNumeroReferencia('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Solicitar Orçamento</h1>
        <p className="text-muted-foreground mt-2">
          Preencha o formulário abaixo para solicitar um orçamento personalizado para seu evento.
        </p>
      </div>
      
      {!showSuccess ? (
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Detalhes do Orçamento</CardTitle>
              <CardDescription>
                Quanto mais detalhes você fornecer, mais preciso será o orçamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {/* Event Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Tipo de Evento</Label>
                    <select
                      id="event-type"
                      className="w-full p-2 h-10 rounded-md border border-input bg-background text-sm"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      required
                    >
                      <option value="">Selecione o tipo de evento</option>
                      {eventTypes.map(tipo => (
                        <option key={tipo.id} value={tipo.nome}>{tipo.nome}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Data Pretendida</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !eventDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventDate ? format(eventDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={eventDate}
                          onSelect={setEventDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Local do Evento</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="location"
                        placeholder="Endereço ou nome do local"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração Estimada</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="duration"
                      placeholder="Ex: 4 horas, meio período, dia inteiro"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="attendees">Número de Participantes</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="attendees"
                      placeholder="Quantidade aproximada de pessoas"
                      value={attendees}
                      onChange={(e) => setAttendees(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detalhes Adicionais</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva seu evento e necessidades específicas para um orçamento mais preciso..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={resetForm}>
                Limpar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Solicitar Orçamento"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-green-600 dark:text-green-400">
              Solicitação Enviada com Sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <Info className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="mb-4">
              Obrigado por sua solicitação! Analisaremos os detalhes do seu evento e 
              entraremos em contato em breve com uma proposta personalizada.
            </p>
            {numeroReferencia && (
              <p className="text-sm text-muted-foreground">
                Número de referência: <span className="font-semibold">{numeroReferencia}</span>
              </p>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={resetForm}>
              Nova Solicitação
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ClientQuote;
