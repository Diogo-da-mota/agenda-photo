
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useContract } from '@/hooks/useContract';
// import { useContractHistory } from '@/hooks/useContractHistory'; // Temporarily commented
import { supabase } from '@/lib/supabase';

// Import our components
import ContractHeader from '@/components/contratos/details/ContractHeader';
import ContractClientInfo from '@/components/contratos/details/ContractClientInfo';
import ContractPaymentInfo from '@/components/contratos/details/ContractPaymentInfo';
import ContractAttachments from '@/components/contratos/details/ContractAttachments';
import ContractContent from '@/components/contratos/details/ContractContent';
import ContractStatus from '@/components/contratos/details/ContractStatus';
import ContractHistory, { HistoryItem } from '@/components/contratos/details/ContractHistory';
import ResendDialog from '@/components/contratos/details/ResendDialog';
import ContractCopyWithSignature from '@/components/contratos/ContractCopyWithSignature';



const ContractDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [eventLocation, setEventLocation] = useState<string>('N/A');
  
  const { data: contract, isLoading, error } = useContract(id || '');
  // const { data: contractHistory = [], isLoading: isLoadingHistory } = useContractHistory(id);
  const contractHistory: any[] = []; // Temporary placeholder
  
  // Hook para funcionalidade de cópia de contrato
  const {
    isVisible: isCopyVisible,
    copiedContract,
    eventLocation: copyEventLocation,
    createContractCopy,
    closeCopy,
    signDigitalContract,
    downloadContractCopy
  } = { 
    isVisible: false, 
    copiedContract: null, 
    eventLocation: '', 
    createContractCopy: () => {}, 
    closeCopy: () => {}, 
    signDigitalContract: () => {}, 
    downloadContractCopy: () => {} 
  }; // Placeholder
  
  // Buscar dados do evento se existe evento_id
  useEffect(() => {
    const fetchEventLocation = async () => {
      if ((contract as any)?.evento_id) {
        try {
          const { data: eventData } = await supabase
            .from('agenda_eventos')
            .select('local')
            .eq('id', (contract as any).evento_id)
            .single();
          
          if (eventData?.local) {
            setEventLocation(eventData.local);
          }
        } catch (error) {
          console.error('Erro ao buscar local do evento:', error);
        }
      }
    };
    
    fetchEventLocation();
  }, [contract]);

  // Inicializa o email do destinatário quando o contrato carrega
  React.useEffect(() => {
    if ((contract as any)?.email_cliente && !recipientEmail) {
      setRecipientEmail((contract as any).email_cliente);
    }
  }, [(contract as any)?.email_cliente, recipientEmail]);
  
  // Se não há contrato ou está carregando, mostra loading ou erro
  if (isLoading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando contrato...</div>
        </div>
      </ResponsiveContainer>
    );
  }
  
  if (error || !contract) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Erro ao carregar contrato</div>
        </div>
      </ResponsiveContainer>
    );
  }
  
  const handleResend = () => {
    setIsResendDialogOpen(true);
  };
  
  const handleConfirmResend = () => {
    // Aqui faria uma chamada para API para reenviar o contrato
    
    toast({
      title: "Contrato reenviado",
      description: `Um novo link foi enviado para ${recipientEmail}`,
    });
    setIsResendDialogOpen(false);
  };
  
  const handleCancelContract = () => {
    if (contract.status === 'cancelado') {
      toast({
        title: "Aviso",
        description: "Este contrato já está cancelado.",
      });
      return;
    }
    
    // Confirmar antes de cancelar
    if (window.confirm("Tem certeza que deseja cancelar este contrato? Esta ação não pode ser desfeita.")) {
      // Aqui faria uma chamada para API para cancelar o contrato
      
      toast({
        title: "Contrato cancelado",
        description: "O status do contrato foi alterado para cancelado."
      });
    }
  };
  
  const handleCopyContract = () => {
    if (contract) {
      createContractCopy();
    }
  };
  
  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        <ContractHeader 
          handleResend={handleResend} 
          contractStatus={contract.status} 
          contractId={contract.id}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <ContractClientInfo 
                  clientName={(contract as any).nome_cliente || contract.clientes?.nome || 'N/A'}
                  clientEmail={(contract as any).email_cliente || contract.clientes?.email || 'N/A'}
                  phoneNumber={(contract as any).telefone_cliente || contract.clientes?.telefone || 'N/A'}
                  eventType={(contract as any).tipo_evento || 'N/A'}
                  eventDate={(contract as any).data_evento ? new Date((contract as any).data_evento) : null}
                  eventLocation={eventLocation}
                  status={contract.status}
                />
                
                <Separator className="my-6" />
                
                <ContractPaymentInfo 
                  value={(contract as any).valor_total || 0} 
                  downPayment={0} 
                />
                
                <Separator className="my-6" />
                
                <ContractAttachments attachments={[]} />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <ContractContent termsAndConditions={(contract as any).conteudo || 'Conteúdo do contrato não disponível'} />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <ContractStatus 
                  status={contract.status}
                  sentDate={new Date(contract.criado_em)}
                  onResend={handleResend}
                  onCancel={handleCancelContract}
                  contractId={contract.id}
                  onCopyContract={handleCopyContract}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <ContractHistory 
                  history={contractHistory} 
                  contractStatus={contract.status}
                  contractCreatedAt={new Date(contract.criado_em)}
                  isLoading={false}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <ResendDialog 
        isOpen={isResendDialogOpen}
        onOpenChange={setIsResendDialogOpen}
        recipientEmail={recipientEmail}
        setRecipientEmail={setRecipientEmail}
        onConfirm={handleConfirmResend}
      />
      
      {/* Modal de Cópia do Contrato com Assinatura Digital */}
      {isCopyVisible && copiedContract && (
        <ContractCopyWithSignature
          originalContract={copiedContract}
          eventLocation={copyEventLocation}
          onClose={closeCopy}
          onSign={signDigitalContract}
          onDownload={downloadContractCopy}
        />
      )}
    </ResponsiveContainer>
  );
};

export default ContractDetails;
