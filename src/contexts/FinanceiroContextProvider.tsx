import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';
import { useQueryClient } from '@tanstack/react-query';

interface FinanceiroContextType {
  atualizarDadosFinanceiros: () => Promise<void>;
}

const FinanceiroContext = createContext<FinanceiroContextType>({} as FinanceiroContextType);

export const useFinanceiro = () => useContext(FinanceiroContext);

interface FinanceiroProviderProps {
  children: React.ReactNode;
}

export const FinanceiroProvider: React.FC<FinanceiroProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Função para atualizar os dados financeiros
  const atualizarDadosFinanceiros = useCallback(async () => {
    try {
      if (!user) return;
      
      logger.info('[FinanceiroProvider] Atualizando dados financeiros');
      
      // Invalidar os dados financeiros. As queries ativas serão automaticamente refetchadas.
      queryClient.invalidateQueries({ queryKey: ['financeiro-transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro-resumo'] });
      
      logger.info('[FinanceiroProvider] Invalidação de cache financeiro concluída');
    } catch (error) {
      logger.error('[FinanceiroProvider] Erro ao atualizar dados financeiros:', error);
    }
  }, [queryClient, user]);
  
  // Registrar callback de atualização na service de agenda
  useEffect(() => {
    if (user) {
      try {
        // Definir a função de callback antes de importar o serviço
        const atualizacaoFinanceiroCallback = (userId: string) => {
          try {
            if (userId === user.id) {
              logger.info('[FinanceiroProvider] Executando callback de atualização financeira');
              atualizarDadosFinanceiros();
            }
          } catch (error) {
            logger.error('[FinanceiroProvider] Erro no callback de atualização financeira:', error);
          }
        };

        // Registrar o callback 
        import('@/services/agendaService').then(({ registrarCallbackAtualizacaoFinanceiro }) => {
          if (typeof registrarCallbackAtualizacaoFinanceiro === 'function') {
            logger.info('[FinanceiroProvider] Registrando callback de atualização financeira');
            registrarCallbackAtualizacaoFinanceiro(atualizacaoFinanceiroCallback);
          } else {
            logger.error('[FinanceiroProvider] Função registrarCallbackAtualizacaoFinanceiro não encontrada ou não é uma função');
          }
        }).catch(error => {
          logger.error('[FinanceiroProvider] Erro ao importar serviço de agenda:', error);
        });
      } catch (error) {
        logger.error('[FinanceiroProvider] Erro ao configurar callback de atualização financeira:', error);
      }
    }
  }, [user, atualizarDadosFinanceiros]);
  
  // Valor a ser fornecido pelo contexto
  const value = {
    atualizarDadosFinanceiros
  };
  
  return (
    <FinanceiroContext.Provider value={value}>
      {children}
    </FinanceiroContext.Provider>
  );
}; 