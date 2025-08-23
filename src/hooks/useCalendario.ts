import { useState, useEffect, useCallback } from 'react';
import { buscarDatasComEventos, EventoCalendario } from '@/services/agendaService';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

/**
 * Hook personalizado para gerenciar dados do calendário
 * Reutiliza a lógica da rota /agenda para mostrar datas ocupadas com cores
 */
export const useCalendario = () => {
  const { user } = useAuth();
  const [eventDates, setEventDates] = useState<{ date: Date; color?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Atualiza os dados do calendário
   * Busca eventos do usuário e formata para o componente Calendar
   */
  const atualizarCalendario = useCallback(async (mes?: number, ano?: number) => {
    if (!user?.id) {
      logger.warn('[useCalendario] Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info(`[useCalendario] Buscando eventos para calendário - usuário: ${user.id}`);
      
      const eventos: EventoCalendario[] = await buscarDatasComEventos(user.id, mes, ano);
      
      // Formatar eventos para o componente Calendar
      const datasFormatadas = eventos.map(evento => ({
        date: new Date(evento.data_inicio),
        color: evento.cor || '#3c83f6' // Cor padrão azul se não houver cor definida
      }));

      setEventDates(datasFormatadas);
      logger.info(`[useCalendario] ${datasFormatadas.length} eventos carregados no calendário`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      logger.error('[useCalendario] Erro ao buscar eventos:', err);
      setError(`Erro ao carregar eventos: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Carrega eventos automaticamente quando o usuário muda
   */
  useEffect(() => {
    if (user?.id) {
      atualizarCalendario();
    }
  }, [user?.id, atualizarCalendario]);

  return {
    eventDates,
    isLoading,
    error,
    atualizarCalendario
  };
};