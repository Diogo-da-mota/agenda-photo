import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ContractForm } from './ContractForm';
import { ClientSelector } from './ClientSelector';
import { buscarEventos } from '@/services/agendaService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/logger';
import { useEmpresa } from '@/hooks/useEmpresa';
import { supabase } from '@/lib/supabase';

// Interface local para os eventos
interface EventData {
  id: string;
  clientName: string;
  phone: string;
  birthday: Date | null;
  eventType: string;
  date: Date;
  time: string;
  location: string;
  totalValue: number;
  downPayment: number;
  remainingValue: number;
  notes: string;
  status: string;
  reminderSent: boolean;
  clientEmail?: string;
  clientPhone?: string;
  cpf_cliente?: string;
  endereco_cliente?: string;
}

export const CreateContractButton = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedClientData, setSelectedClientData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Hook para buscar configurações da empresa
  const { configuracoes } = useEmpresa();
  
  // Nome do fotógrafo vem das configurações da empresa com fallback
  const nomeFotografo = configuracoes?.nome_empresa || '[Nome do Fotógrafo]';

  const loadEvents = async () => {
    if (!user) return;
    try {
      const eventosCarregados = await buscarEventos(user.id);
      // Mapear para nossa interface local
      const eventosFormatados = eventosCarregados.map(evento => ({
        id: evento.id || '',
        clientName: evento.clientName,
        phone: evento.phone || '',
        birthday: evento.birthday,
        eventType: evento.eventType,
        date: evento.date,
        time: evento.time || '14:00',
        location: evento.location || '',
        totalValue: evento.totalValue,
        downPayment: evento.downPayment,
        remainingValue: evento.remainingValue,
        notes: evento.notes || '',
        status: evento.status,
        reminderSent: evento.reminderSent || false,
        clientEmail: '', // Não há campo clientEmail no Event
        clientPhone: evento.phone || '', // Usar phone como clientPhone
        cpf_cliente: (evento as any).cpf_cliente || '',
        endereco_cliente: (evento as any).endereco_cliente || ''
      }));
      setEvents(eventosFormatados);
    } catch (error) {
      toast({
        title: "Erro ao carregar eventos",
        description: "Não foi possível carregar a lista de eventos.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  // ✅ Recarregar eventos toda vez que o modal abrir
  useEffect(() => {
    if (isOpen && user) {
      loadEvents();
    }
  }, [isOpen, user]);

  const handleClientSelect = async (dadosCliente: any) => {
    console.log('📋 CreateContractButton: Cliente selecionado:', dadosCliente.clientName);
    
    // 🔥 BUSCAR DATA DE CRIAÇÃO DO EVENTO
    let dataCriacao = null;
    
    if (dadosCliente.id) {
      try {
        // Log removido por segurança - não expor dados de cliente
        
        const { data, error } = await supabase
          .from('agenda_eventos')
          .select('criado_em')
          .eq('id', dadosCliente.id)
          .single();
        
        if (error) {
          console.error('❌ Erro ao buscar data de criação:', error);
          dataCriacao = new Date(); // Fallback seguro
          toast({
            title: "Aviso",
            description: "Não foi possível carregar a data de criação. Usando data atual.",
            variant: "destructive",
          });
        } else if (data?.criado_em) {
          dataCriacao = new Date(data.criado_em);
          console.log('✅ Data de criação encontrada:', dataCriacao.toLocaleDateString('pt-BR'));
        } else {
          console.warn('⚠️ Data de criação não encontrada, usando data atual');
          dataCriacao = new Date();
        }
      } catch (error) {
        console.error('💥 Erro inesperado ao buscar data de criação:', error);
        dataCriacao = new Date(); // Fallback seguro
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do evento. Usando data atual.",
          variant: "destructive",
        });
      }
    } else {
      console.warn('⚠️ ID do evento não disponível, usando data atual');
      dataCriacao = new Date();
    }
    
    // Mapear dados do evento para o formato esperado pelo formulário
    const dadosFormatados = {
      nomeCliente: dadosCliente.clientName,
      emailCliente: dadosCliente.clientEmail || '',
      telefoneCliente: dadosCliente.phone || '', // Mapeamento preciso igual aos outros campos
      tipoEvento: dadosCliente.eventType,
      dataEvento: dadosCliente.date,
      horaEvento: dadosCliente.time,
      localEvento: dadosCliente.location,
      valorTotal: dadosCliente.totalValue,
      valorSinal: dadosCliente.downPayment,
      eventoId: dadosCliente.id,
      dataCriacao: dataCriacao, // 🔥 DATA DE CRIAÇÃO
      cpfCliente: dadosCliente.cpf_cliente || '', // 🔥 BUSCAR DO EVENTO
      enderecoCliente: dadosCliente.endereco_cliente || '' // 🔥 BUSCAR DO EVENTO
    };
    
    console.log('📋 Dados formatados com data de criação:', dadosFormatados);
    console.log('📞 Debug telefone - dadosCliente.phone:', dadosCliente.phone);
    console.log('📞 Debug telefone - dadosCliente.clientPhone:', dadosCliente.clientPhone);
    console.log('📞 Debug telefone - telefoneCliente final:', dadosFormatados.telefoneCliente);
    setSelectedClientData(dadosFormatados);
  };

  const handleContractSuccess = () => {
    
    setIsOpen(false);
    setSelectedClientData(null);
    // Recarregar a página para mostrar o novo contrato na lista
    window.location.reload();

    // ✅ CORREÇÃO: Invalidar cache de clientes após sincronização
    try {
      // Forçar atualização da lista de clientes
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes', user.id] });
      logger.info('[atualizarEvento] Cache de clientes invalidado com sucesso');
    } catch (cacheError) {
      logger.warn('[atualizarEvento] Erro ao invalidar cache de clientes:', cacheError);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Criar Novo Contrato</DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente e do evento para criar um contrato.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="py-4 space-y-6">
            {/* Seção de seleção de cliente existente (opcional) */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium mb-2">Selecionar Cliente Existente (opcional)</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Escolha um cliente da agenda para preencher automaticamente os dados, ou preencha manualmente abaixo.
              </p>
              <ClientSelector 
                events={events} 
                onSelect={handleClientSelect} 
                className="w-full"
              />
            </div>
            
            {/* Formulário sempre visível */}
            <ContractForm 
              initialData={selectedClientData ? {
                clientName: selectedClientData.nomeCliente,
                clientEmail: selectedClientData.emailCliente,
                phoneNumber: selectedClientData.telefoneCliente,
                cpfCliente: selectedClientData.cpfCliente,
                enderecoCliente: selectedClientData.enderecoCliente,
                eventType: selectedClientData.tipoEvento || '',
                eventDate: selectedClientData.dataEvento,
                eventTime: selectedClientData.horaEvento,
                eventLocation: selectedClientData.localEvento,
                price: selectedClientData.valorTotal,
                downPayment: selectedClientData.valorSinal,
                eventoId: selectedClientData.eventoId
              } : undefined}
              onSuccess={handleContractSuccess}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
