import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { eventTypes, type Event } from '@/components/agenda/types';
import { formatarNumero, formatarTelefone, formatarDataBrasileira, converterParaNumero } from '@/utils/formatters';
import { validarData } from '@/utils/validators';
import { criarEvento, atualizarEvento, registrarCallbackAtualizacaoFinanceiro } from '@/services/agendaService';

interface UseEventFormProps {
  event?: Event | null;
  onClose: () => void;
  onEventCreated?: (event: Event) => void;
}

export const useEventForm = ({ event, onClose, onEventCreated }: UseEventFormProps) => {
  // Estados do formulário
  const [clientName, setClientName] = useState(event ? event.clientName : '');
  const [phone, setPhone] = useState(event ? formatarTelefone(event.phone) : '');
  const [birthday, setBirthday] = useState(event ? event.birthday : null);
  const [birthdayText, setBirthdayText] = useState(event?.birthday ? formatarDataBrasileira(event.birthday) : '');
  const [eventType, setEventType] = useState(event ? event.eventType : eventTypes[0]);
  const [eventDate, setEventDate] = useState(event ? event.date : new Date());
  const [eventDateText, setEventDateText] = useState(event?.date ? formatarDataBrasileira(event.date) : '');
  const [location, setLocation] = useState(event ? event.location : '');
  const [totalValueString, setTotalValueString] = useState(event ? formatarNumero(event.totalValue.toString()) : '');
  const [downPaymentString, setDownPaymentString] = useState(event ? formatarNumero(event.downPayment.toString()) : '');
  const [remainingValueString, setRemainingValueString] = useState(event ? formatarNumero(event.remainingValue.toString()) : '');
  const [notes, setNotes] = useState(event ? event.notes : '');
  const [sendReminder, setSendReminder] = useState(true);
  const [cpfCliente, setCpfCliente] = useState(event ? event.cpf_cliente || '' : '');
  const [enderecoCliente, setEnderecoCliente] = useState(event ? event.endereco_cliente || '' : '');
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Registrar callback para atualização financeira
  useEffect(() => {
    if (!user) return;
    
    const atualizarDadosFinanceiros = async (userId: string) => {
      console.log('[EventForm] Callback de atualização financeira executado');
      
      // Aguardar um pouco para garantir que o trigger terminou de processar
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Invalidar cache do fluxo de caixa
      queryClient.invalidateQueries({ queryKey: ['financeiro-resumo'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro-transacoes'] });
      
      // Forçar busca imediata dos dados para atualização em tempo real
      try {
        await queryClient.refetchQueries({ queryKey: ['financeiro-resumo', userId] });
        await queryClient.refetchQueries({ queryKey: ['financeiro-transacoes', userId] });
        console.log('[EventForm] Dados financeiros atualizados com sucesso');
      } catch (error) {
        console.warn('[EventForm] Erro ao forçar atualização dos dados financeiros:', error);
        // Tentar uma segunda vez após mais um delay
        setTimeout(async () => {
          try {
            await queryClient.refetchQueries({ queryKey: ['financeiro-resumo', userId] });
            await queryClient.refetchQueries({ queryKey: ['financeiro-transacoes', userId] });
            console.log('[EventForm] Segunda tentativa de atualização dos dados financeiros bem-sucedida');
          } catch (secondError) {
            console.error('[EventForm] Falha na segunda tentativa de atualização:', secondError);
          }
        }, 500);
      }
    };
    
    // Registrar o callback
    registrarCallbackAtualizacaoFinanceiro(atualizarDadosFinanceiros);
    
    // Não é necessário limpar o callback pois é compartilhado entre instâncias
  }, [queryClient, user]);

  // Atualizar o valor restante quando o valor total ou o valor de entrada mudar
  useEffect(() => {
    const totalValue = converterParaNumero(totalValueString);
    const downPayment = converterParaNumero(downPaymentString);
    const remainingValue = totalValue - downPayment;
    setRemainingValueString(formatarNumero(remainingValue.toString()));
  }, [totalValueString, downPaymentString]);

  // Handler para formatar o telefone enquanto o usuário digita
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatarTelefone(e.target.value);
    setPhone(formattedPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar eventos.",
        variant: "destructive"
      });
      return;
    }

    // Validar data do evento
    if (!validarData(eventDate)) {
      toast({
        title: "Erro",
        description: "A data do evento é inválida. Por favor, verifique e tente novamente.",
        variant: "destructive"
      });
      return;
    }

    // Validar data de aniversário se fornecida
    if (birthdayText && !validarData(birthday)) {
      toast({
        title: "Erro",
        description: "A data de aniversário é inválida. Por favor, verifique e tente novamente.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const totalValue = converterParaNumero(totalValueString);
      const downPayment = converterParaNumero(downPaymentString);
      const remainingValue = totalValue - downPayment;
      
      // Preparar dados do evento para atualização
      const dadosEvento = {
        clientName,
        phone: phone.replace(/\D/g, ''), // Remover formatação
        birthday,
        eventType,
        date: eventDate,
        time: format(eventDate, 'HH:mm'),
        location,
        totalValue,
        downPayment,
        remainingValue,
        notes,
        status: (event?.status || 'pending') as "upcoming" | "confirmed" | "pending" | "completed" | "canceled",
        reminderSent: event?.reminderSent || false,
        cpf_cliente: cpfCliente,
        endereco_cliente: enderecoCliente
      };
      
      console.log('Dados do evento a serem salvos:', dadosEvento);
      
      if (event) {
        // Atualizar evento existente
        console.log(`[EventForm] Atualizando evento ${event.id} com dados:`, dadosEvento);
        
        const eventoAtualizado = await atualizarEvento(event.id, dadosEvento, user.id);

        // Verificar se houve alteração nos valores financeiros OU na data do evento
        const valoresAlterados = (
          dadosEvento.totalValue !== event.totalValue ||
          dadosEvento.downPayment !== event.downPayment ||
          dadosEvento.remainingValue !== event.remainingValue
        );
        
        const dataAlterada = (
          dadosEvento.date.getTime() !== event.date.getTime()
        );
        
        const outrosValoresAlterados = (
          dadosEvento.clientName !== event.clientName ||
          dadosEvento.eventType !== event.eventType
        );
        
        // Usar o serviço de sincronização automática para edição
        console.log('[EventForm] Iniciando sincronização automática para evento editado');
        // REMOVIDO: Sincronização automática financeira
        // Os valores financeiros já são salvos corretamente na tabela agenda_eventos
        console.log('[EventForm] Valores financeiros salvos na agenda_eventos - sem sincronização automática');
        
        // Atualizar dados financeiros para garantir que UI seja atualizada
        if (valoresAlterados || dataAlterada || outrosValoresAlterados) {
          if (dataAlterada) {
            console.log('[EventForm] Alteração na data do evento detectada');
          }
          if (valoresAlterados) {
            console.log('[EventForm] Alteração nos valores financeiros detectada');
          }
          if (outrosValoresAlterados) {
            console.log('[EventForm] Alteração em dados do cliente/evento detectada');
          }
          
          // Aguardar um pouco para o sistema processar as alterações
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Invalidar e refetch dados financeiros
          console.log('[EventForm] Atualizando dados financeiros após edição...');
          queryClient.invalidateQueries({ queryKey: ['financeiro-resumo'] });
          queryClient.invalidateQueries({ queryKey: ['financeiro-transacoes'] });
          
          await queryClient.refetchQueries({ queryKey: ['financeiro-resumo', user.id] });
          await queryClient.refetchQueries({ queryKey: ['financeiro-transacoes', user.id] });
          
          console.log('[EventForm] Atualização financeira concluída');
        }
        
        // Notificar o componente pai sobre a atualização
        if (onEventCreated) {
          onEventCreated(eventoAtualizado);
        }
      } else {
        // Criar novo evento
        const novoEventoComId = {
          ...dadosEvento,
          id: '' // ID temporário, será substituído pelo UUID gerado pelo serviço
        };
        
        const eventoCriado = await criarEvento(novoEventoComId, user.id);

        // Usar o serviço de sincronização automática
        console.log('[EventForm] Iniciando sincronização automática para novo evento');
        // DISPATCH DE EVENTO PARA ATUALIZAR UI
        window.dispatchEvent(new CustomEvent('eventoCriado', { detail: eventoCriado }));
        
        // Garantir atualização imediata do financeiro na UI
        if (dadosEvento.downPayment > 0 || dadosEvento.remainingValue > 0) {
          console.log('[EventForm] Evento com valores financeiros criado, forçando atualização da UI...');
          
          // Aguardar um pouco para processar
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Forçar atualização imediata dos dados financeiros
          queryClient.invalidateQueries({ queryKey: ['financeiro-resumo'] });
          queryClient.invalidateQueries({ queryKey: ['financeiro-transacoes'] });
          
          // Refetch para garantir dados atualizados
          await queryClient.refetchQueries({ queryKey: ['financeiro-resumo', user.id] });
          await queryClient.refetchQueries({ queryKey: ['financeiro-transacoes', user.id] });
          
          console.log('[EventForm] Atualização da UI financeira concluída');
        }
        
        // Notificar o componente pai sobre o novo evento
        if (onEventCreated) {
          onEventCreated(eventoCriado);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      
      let mensagemErro = 'Erro desconhecido';
      if (error instanceof Error) {
        mensagemErro = error.message;
      }
      
      toast({
        title: "Erro ao salvar evento",
        description: `Ocorreu um erro ao salvar o evento: ${mensagemErro}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estados
    clientName,
    setClientName,
    phone,
    setPhone,
    birthday,
    setBirthday,
    birthdayText,
    setBirthdayText,
    eventType,
    setEventType,
    eventDate,
    setEventDate,
    eventDateText,
    setEventDateText,
    location,
    setLocation,
    totalValueString,
    setTotalValueString,
    downPaymentString,
    setDownPaymentString,
    remainingValueString,
    notes,
    setNotes,
    sendReminder,
    setSendReminder,
    cpfCliente,
    setCpfCliente,
    enderecoCliente,
    setEnderecoCliente,
    isLoading,
    
    // Handlers
    handlePhoneChange,
    handleSubmit
  };
};