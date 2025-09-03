import { useEffect, useRef } from 'react';
import { entregaFotosAutomaticService } from '@/services/entregaFotosAutomaticService';

interface UseEntregaFotosAutomaticoOptions {
  intervaloMinutos?: number;
  executarAoIniciar?: boolean;
  habilitado?: boolean;
}

export const useEntregaFotosAutomatico = (options: UseEntregaFotosAutomaticoOptions = {}) => {
  const {
    intervaloMinutos = 60, // Executa a cada 1 hora por padrão
    executarAoIniciar = true,
    habilitado = true
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const executandoRef = useRef(false);

  const executarProcessos = async () => {
    if (executandoRef.current || !habilitado) return;

    executandoRef.current = true;
    
    try {
      // Log removido para produção - iniciando processos automáticos
      const resultado = await entregaFotosAutomaticService.executarProcessosAutomaticos();
      // Log removido para produção - processos automáticos concluídos
    } catch (error) {
      // Log removido para produção - erro nos processos automáticos
    } finally {
      executandoRef.current = false;
    }
  };

  useEffect(() => {
    if (!habilitado) return;

    // Executar imediatamente se solicitado
    if (executarAoIniciar) {
      // Aguardar um pouco para não interferir no carregamento inicial
      setTimeout(executarProcessos, 5000);
    }

    // Configurar execução periódica
    intervalRef.current = setInterval(executarProcessos, intervaloMinutos * 60 * 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [intervaloMinutos, executarAoIniciar, habilitado]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    executarProcessos,
    executando: executandoRef.current
  };
};