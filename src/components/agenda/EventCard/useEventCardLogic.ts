import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { corrigirFormatoObservacoes } from '@/utils/fixEventsFinancialData';
import { converterDoSupabase, registrarPagamentoParcial, gerarReciboEvento } from '@/services/agendaService';
import { EventCardState, EventCardProps } from './types';
import { createNewTransaction, triggerFinancialUpdate } from './utils';

export const useEventCardLogic = (
  event: EventCardProps['event'],
  onEventUpdate?: EventCardProps['onEventUpdate']
) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [state, setState] = useState<EventCardState>({
    isRescheduleOpen: false,
    isDeleteDialogOpen: false,
    isPaymentDialogOpen: false,
    isEditDialogOpen: false,
    isDeleting: false,
    paymentAmount: '',
    isProcessingPayment: false,
    isLoading: false,
    selectedEvent: null,
    shouldShowRegisterPaymentModal: false,
  });

  const updateState = (updates: Partial<EventCardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  /**
   * Manipular exclusão do evento
   */
  const handleDeleteEvent = async (onDelete?: EventCardProps['onDelete']) => {
    if (!onDelete) {
      toast({
        title: "Erro",
        description: "A função de exclusão não está disponível.",
        variant: "destructive"
      });
      return;
    }

    updateState({ isDeleting: true });
    try {
      logger.debug(`Iniciando exclusão do evento ID: ${event.id}`, null, 'EventCard');
      
      await onDelete(event.id);
      logger.debug(`Evento ${event.id} excluído com sucesso`, null, 'EventCard');
      
      updateState({ isDeleteDialogOpen: false });
      
      // 
    } catch (error) {
      logger.error(`Erro ao excluir evento ${event.id}`, error, 'EventCard');
      
      toast({
        title: "Erro ao excluir evento",
        description: "Não foi possível excluir o evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      updateState({ isDeleting: false });
    }
  };

  /**
   * Manipular atualização do evento
   */
  const handleEventUpdated = (updatedEvent: any) => {
    updateState({ isEditDialogOpen: false });
    
    if (onEventUpdate) {
      onEventUpdate(updatedEvent);
    } else {
      // 
    }
  };

  /**
   * Registrar pagamento
   */
  const handleRegisterPayment = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }

    // Abrir modal de pagamento
    updateState({ isPaymentDialogOpen: true });
  };

  /**
   * Processar pagamento parcial
   */
  const handleProcessPayment = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }

    const valorPagamento = parseFloat(state.paymentAmount);
    
    if (isNaN(valorPagamento) || valorPagamento <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido para o pagamento.",
        variant: "destructive"
      });
      return;
    }

    if (valorPagamento > event.remainingValue) {
      toast({
        title: "Valor inválido",
        description: "O valor do pagamento não pode ser maior que o valor restante.",
        variant: "destructive"
      });
      return;
    }

    try {
      updateState({ isProcessingPayment: true });
      
      logger.debug(`Registrando pagamento de R$ ${valorPagamento} para evento ${event.id}`, null, 'EventCard');
      
      // Usar a nova função do agendaService
      const eventoAtualizado = await registrarPagamentoParcial(event.id, valorPagamento, user.id);
      
      logger.debug(`Pagamento registrado com sucesso`, null, 'EventCard');
      
      // Fechar modal e limpar campos
      updateState({ 
        isPaymentDialogOpen: false, 
        paymentAmount: '',
        isProcessingPayment: false
      });
      
      // Atualizar evento na interface
      if (onEventUpdate) {
        onEventUpdate(eventoAtualizado);
      }
      
      // 
      
    } catch (error) {
      logger.error(`Erro ao registrar pagamento para evento ${event.id}`, error, 'EventCard');
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro ao registrar pagamento",
        description: errorMessage,
        variant: "destructive"
      });
      
      updateState({ isProcessingPayment: false });
    }
  };

  /**
   * Gerar recibo profissional
   */
  const handleGenerateReceipt = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }

    try {
      updateState({ isLoading: true });
      
      logger.debug(`Gerando recibo para evento ${event.id}`, null, 'EventCard');
      
      // Gerar recibo usando o agendaService
      const { evento, telefoneCliente } = await gerarReciboEvento(event.id, user.id);
      
      logger.debug(`Recibo gerado com sucesso`, null, 'EventCard');
      
      // Se tiver telefone do cliente, perguntar se quer abrir WhatsApp
      if (telefoneCliente && telefoneCliente.trim()) {
        const { openWhatsAppWithReceipt } = await import('@/utils/receiptGeneratorNative');
        
        // Pequeno delay para garantir que o recibo foi processado
        setTimeout(() => {
          const abrirWhatsApp = window.confirm(
            `Recibo gerado com sucesso!\n\nDeseja abrir o WhatsApp do cliente ${evento.clientName} para enviar o recibo?`
          );
          
          if (abrirWhatsApp) {
            openWhatsAppWithReceipt(
              telefoneCliente,
              evento.clientName,
              evento.eventType
            );
          }
        }, 1000);
      }
      
      // 
      
    } catch (error) {
      logger.error(`Erro ao gerar recibo para evento ${event.id}`, error, 'EventCard');
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar recibo';
      
      toast({
        title: "Erro ao gerar recibo",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  return {
    state,
    updateState,
    handleDeleteEvent,
    handleEventUpdated,
    handleRegisterPayment,
    handleProcessPayment,
    handleGenerateReceipt,
  };
};
