import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ContractData {
  id: string;
  status: string;
  nome_cliente?: string;
  email_cliente?: string;
  telefone_cliente?: string;
  tipo_evento?: string;
  data_evento?: string;
  valor_total?: number;
  conteudo?: string;
  criado_em: string;
  clientes?: {
    nome?: string;
    email?: string;
    telefone?: string;
  };
}

interface ContractCopyState {
  isVisible: boolean;
  copiedContract: ContractData | null;
  eventLocation: string;
}

/**
 * Hook personalizado para gerenciar a funcionalidade de cópia de contrato
 * com assinatura digital, seguindo o princípio DRY e separação de responsabilidades
 */
export const useContractCopy = () => {
  const { toast } = useToast();
  const [copyState, setCopyState] = useState<ContractCopyState>({
    isVisible: false,
    copiedContract: null,
    eventLocation: 'N/A'
  });

  /**
   * Cria uma cópia do contrato com funcionalidade de assinatura digital
   */
  const createContractCopy = (originalContract: ContractData, eventLocation?: string) => {
    try {
      // Validar se o contrato original existe
      if (!originalContract || !originalContract.id_contrato) {
        throw new Error('Contrato original inválido');
      }

      // Criar cópia do contrato
      const copiedContract: ContractData = {
        ...originalContract,
        id_contrato: `${originalContract.id_contrato}-copy-${Date.now()}`, // Novo ID para a cópia
        status: 'pendente', // Cópia sempre inicia como pendente
        criado_em: new Date().toISOString() // Nova data de criação
      };

      // Atualizar estado
      setCopyState({
        isVisible: true,
        copiedContract,
        eventLocation: eventLocation || 'N/A'
      });

      return copiedContract;
    } catch (error) {
      console.error('Erro ao criar cópia do contrato:', error);
      toast({
        title: "Erro ao Copiar",
        description: "Não foi possível criar a cópia do contrato. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Fecha a visualização da cópia do contrato
   */
  const closeCopy = () => {
    setCopyState({
      isVisible: false,
      copiedContract: null,
      eventLocation: 'N/A'
    });
  };

  /**
   * Processa a assinatura digital do contrato copiado
   */
  const signDigitalContract = () => {
    if (!copyState.copiedContract) {
      toast({
        title: "Erro",
        description: "Nenhuma cópia de contrato disponível para assinatura.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simular processo de assinatura digital
      // Em produção, aqui seria integrado com um serviço de assinatura digital
      
      // Atualizar status da cópia
      const signedContract = {
        ...copyState.copiedContract,
        status: 'assinado',
        data_assinatura: new Date().toISOString()
      };

      setCopyState(prev => ({
        ...prev,
        copiedContract: signedContract
      }));

      return signedContract;
    } catch (error) {
      console.error('Erro ao assinar contrato:', error);
      toast({
        title: "Erro na Assinatura",
        description: "Não foi possível processar a assinatura digital. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Faz o download da cópia do contrato
   */
  const downloadContractCopy = () => {
    if (!copyState.copiedContract) {
      toast({
        title: "Erro",
        description: "Nenhuma cópia de contrato disponível para download.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simular download da cópia
      // Em produção, aqui seria gerado um PDF da cópia com assinatura digital
      
      const fileName = `contrato-copia-${copyState.copiedContract.id_contrato}.pdf`;

      // Aqui seria implementada a lógica real de download
      console.log('Download da cópia do contrato:', copyState.copiedContract);
      
    } catch (error) {
      console.error('Erro ao fazer download da cópia:', error);
      toast({
        title: "Erro no Download",
        description: "Não foi possível baixar a cópia do contrato. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    // Estado
    isVisible: copyState.isVisible,
    copiedContract: copyState.copiedContract,
    eventLocation: copyState.eventLocation,
    
    // Ações
    createContractCopy,
    closeCopy,
    signDigitalContract,
    downloadContractCopy
  };
};