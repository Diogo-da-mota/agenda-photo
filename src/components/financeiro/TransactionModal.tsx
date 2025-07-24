import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import TransactionForm from './TransactionForm';

import { Transacao, criarTransacao, atualizarTransacao } from '@/services/financeiroService';
import { criarDespesa, atualizarDespesa, Despesa } from '@/services/financeiroDespesasService';
import { logger } from '@/utils/logger';

interface TransactionModalProps {
  transaction?: Transacao;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (transaction: Transacao) => void;
  trigger?: React.ReactNode;
  initialType?: 'receita' | 'despesa';
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  trigger,
  initialType = 'despesa'
}) => {
  const [isOpen, setIsOpen] = useState(controlledIsOpen || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUserProfile();
  
  // Determinar se o modal está controlado externamente
  const isControlled = controlledIsOpen !== undefined;
  
  // Efeito para sincronizar estado interno com propriedade externa
  useEffect(() => {
    if (isControlled) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen, isControlled]);
  
  // Determinar se é uma despesa específica (do botão Despesas)
  const isDespesaEspecifica = initialType === 'despesa' && !transaction;
  
  
  // Funções para abrir/fechar o modal
  const open = () => {
    if (isControlled) {
      controlledOnOpenChange?.(true);
    } else {
      setIsOpen(true);
    }
  };
  
  const close = () => {
    if (isControlled) {
      controlledOnOpenChange?.(false);
    } else {
      setIsOpen(false);
    }
  };
  
  // Função para lidar com o envio do formulário
  const handleSubmit = async (transacaoData: Omit<Transacao, 'id' | 'criado_em' | 'atualizado_em'>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar transações.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let novaTransacao: Transacao;
      
      // Garantir que o status seja sempre 'recebido'
      const dadosComStatusFixo = {
        ...transacaoData,
        status: 'recebido' as const
      };
      
      if (transaction) {
        if (transaction.tipo === 'despesa' || transaction.isDespesaEspecifica) {
          // Atualizar despesa existente
          const despesaData = {
            ...dadosComStatusFixo,
            data_transacao: new Date(dadosComStatusFixo.data_transacao),
            status: 'pago' as const // Status de despesa sempre pago
          };
          
          await atualizarDespesa(transaction.id, despesaData, user.id);
          
          novaTransacao = {
            ...transaction,
            ...dadosComStatusFixo,
            data_transacao: dadosComStatusFixo.data_transacao,
            atualizado_em: new Date().toISOString(),
            isDespesaEspecifica: true
          };
        } else {
        // Atualizar transação existente
        await atualizarTransacao(transaction.id, {
            ...dadosComStatusFixo,
            data_transacao: new Date(dadosComStatusFixo.data_transacao).toISOString()
        }, user.id);
        
        novaTransacao = {
          ...transaction,
            ...dadosComStatusFixo,
            data_transacao: dadosComStatusFixo.data_transacao,
          atualizado_em: new Date().toISOString()
        };
        }
      } else {
        // Criar nova transação
        const dadosTransacao = {
          ...dadosComStatusFixo,
          data_transacao: new Date(dadosComStatusFixo.data_transacao),
          user_id: user.id,
          tipo: initialType
        };
        
        if (initialType === 'despesa') {
          const despesaData = {
            ...dadosTransacao,
            status: 'pago' as const // Status de despesa sempre pago
          };
          const novaDespesa = await criarDespesa(despesaData, user.id);
          novaTransacao = {
            ...novaDespesa,
            tipo: 'despesa',
            status: 'recebido' as const,
            data_transacao: dadosComStatusFixo.data_transacao,
            isDespesaEspecifica: true
          } as unknown as Transacao;
        } else {
          novaTransacao = await criarTransacao({
            ...dadosTransacao,
            data_transacao: new Date(dadosComStatusFixo.data_transacao).toISOString()
          }, user.id);
        }
      }
      
      toast({
        title: transaction ? "Transação atualizada" : "Transação criada",
        description: "As alterações foram salvas com sucesso."
      });
      
      onSuccess?.(novaTransacao);
      close();
    } catch (error) {
      logger.error('Erro ao salvar transação:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a transação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  return (
    <Dialog 
      open={isControlled ? controlledIsOpen : isOpen} 
      onOpenChange={isControlled ? controlledOnOpenChange : setIsOpen}
    >
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar ' : 'Nova '}
            {isDespesaEspecifica || (transaction?.tipo === 'despesa' || transaction?.isDespesaEspecifica) ? 'Despesa' : 'Transação'}
          </DialogTitle>
        </DialogHeader>
        
        <TransactionForm
          transaction={transaction}
          onSubmit={handleSubmit}
          onCancel={close}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal; 