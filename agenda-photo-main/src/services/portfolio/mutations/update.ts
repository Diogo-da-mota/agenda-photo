import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { CriarTrabalhoPortfolio } from '../types';
import { monitorarOperacaoPortfolio } from '@/utils/performance/portfolioMonitoring';
// N8N REMOVIDO - Sistema usa Amazon S3

// 🔄 FUNÇÃO AUXILIAR COM RETRY PARA TIMEOUTS
const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isTimeoutError = error.message?.includes('timeout') || 
                           error.message?.includes('57014') ||
                           error.code === '57014';
      
      if (isTimeoutError && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        logger.warn(`[executeWithRetry] Tentativa ${attempt} falhou com timeout, tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error('Máximo de tentativas excedido');
};

// Atualizar um trabalho existente
export const atualizarTrabalhoPortfolio = async (
  trabalhoId: string, 
  trabalho: Partial<CriarTrabalhoPortfolio>, 
  userId: string
): Promise<void> => {
  // 🔍 USAR MONITORAMENTO DE PERFORMANCE
  return monitorarOperacaoPortfolio(
    'atualizarTrabalhoPortfolio',
    trabalhoId,
    async () => {
      const camposAtualizados = {
        ...trabalho,
        atualizado_em: new Date().toISOString()
      };

      logger.info('Atualizando trabalho no Supabase:', { 
        id: trabalhoId, 
        campos: camposAtualizados 
      });

      // 🔄 USAR RETRY LOGIC PARA PREVENIR TIMEOUT
      await executeWithRetry(async () => {
        const { error } = await supabase
          .from('portfolio_trabalhos')
          .update(camposAtualizados)
          .eq('id', trabalhoId)
          .eq('user_id', userId);

        if (error) {
          logger.error('Erro ao atualizar trabalho:', error);
          throw new Error(`Erro ao atualizar trabalho: ${error.message}`);
        }
      }, 3, 1000);

      logger.info('✅ Trabalho atualizado com sucesso:', { id: trabalhoId });

      // Sistema agora usa Amazon S3 - atualização automática
      // Log removido para produção - trabalho atualizado
      
      /* CÓDIGO ORIGINAL N8N COMENTADO
      
      // Enviar dados para N8N (não bloqueia se falhar)
      try {
        await enviarAtualizacaoPortfolioParaN8N(
          trabalhoId,
          trabalho.titulo || '',
          trabalho.categoria || '',
          trabalho.local || '',
          trabalho.descricao || '',
          trabalho.tags || [],
          []
        );
      } catch (error) {
        logger.warn('[atualizarTrabalhoPortfolio] Falha ao enviar para N8N (não afeta salvamento local):', error);
      }
      
      */
    },
    userId
  );
};

export const updatePortfolioMutation = async (
  portfolioId: string,
  dadosTrabalho: any,
  novasImagens: File[] = []
): Promise<any> => {
  // 🔍 USAR MONITORAMENTO DE PERFORMANCE
  return monitorarOperacaoPortfolio(
    'updatePortfolioMutation',
    portfolioId,
    async () => {
      // ⚡ OTIMIZAÇÃO: Timeout customizado para operações pesadas
      const startTime = performance.now();
      
      // 1. ATUALIZAR DADOS BÁSICOS PRIMEIRO (operação rápida)
      const camposAtualizados = {
        ...dadosTrabalho,
        atualizado_em: new Date().toISOString()
      };

      logger.info('[updatePortfolioMutation] Atualizando dados básicos:', { 
        id: portfolioId, 
        campos: Object.keys(camposAtualizados) 
      });

      // 🔧 UPDATE OTIMIZADO com índices específicos
      const { error: updateError } = await supabase
        .from('portfolio_trabalhos')
        .update(camposAtualizados)
        .eq('id', portfolioId)           // ✅ Usa índice primário
        .eq('user_id', dadosTrabalho.user_id || camposAtualizados.user_id); // ✅ Segurança adicional

      if (updateError) {
        logger.error('[updatePortfolioMutation] Erro na atualização:', updateError);
        throw new Error(`Erro ao atualizar portfolio: ${updateError.message}`);
      }

      // 📊 MONITORAMENTO DE PERFORMANCE
      const updateTime = performance.now() - startTime;
      logger.info('[updatePortfolioMutation] ✅ Atualização concluída:', {
        tempo_execucao: `${updateTime.toFixed(2)}ms`,
        portfolio_id: portfolioId
      });

      // ⚠️ ALERTA SE OPERAÇÃO LENTA
      if (updateTime > 5000) {
        logger.warn('[updatePortfolioMutation] 🐌 Operação lenta detectada:', {
          tempo: updateTime,
          portfolio_id: portfolioId
        });
      }

      // Sistema usa Amazon S3 - integração automática
      // Log removido para produção - portfolio atualizado
      
      /* CÓDIGO ORIGINAL N8N COMENTADO
      
      // Notificar N8N sobre a atualização (se necessário)
      if (novasImagens && novasImagens.length > 0) {
        try {
          await enviarAtualizacaoPortfolioParaN8N(
            portfolioId,
            dadosTrabalho.titulo,
            dadosTrabalho.categoria,
            dadosTrabalho.local,
            dadosTrabalho.descricao,
            dadosTrabalho.tags || [],
            novasImagens
          );
          
          logger.info('[updatePortfolioMutation] N8N notificado sobre atualização');
        } catch (n8nError) {
          logger.warn('[updatePortfolioMutation] Erro ao notificar N8N (não bloqueia atualização):', n8nError);
        }
      }
      
      */

      logger.info('[updatePortfolioMutation] ✅ Portfolio atualizado com sucesso:', {
        id: portfolioId,
        titulo: dadosTrabalho.titulo,
        novas_imagens_desabilitadas: novasImagens?.length || 0,
        tempo_total: `${(performance.now() - startTime).toFixed(2)}ms`
      });

      // 🎯 RETORNAR DADOS OTIMIZADO (sem SELECT adicional)
      logger.info('[updatePortfolioMutation] ✅ Retornando dados otimizados sem SELECT adicional');
      
      return { 
        id: portfolioId, 
        ...dadosTrabalho,
        ...camposAtualizados,
        user_id: dadosTrabalho.user_id || camposAtualizados.user_id
      };
    },
    dadosTrabalho.user_id
  );
};
