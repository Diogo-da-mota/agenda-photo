import React, { Profiler } from 'react';
import { trackComponentRender } from '@/utils/performance';
import { useAuth } from '@/hooks/useAuth';

interface PerformanceProfilerProps {
  id: string;
  children: React.ReactNode;
  enabled?: boolean;
}

const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({ 
  id, 
  children, 
  // Por padrão, habilitado em desenvolvimento ou se VITE_ENABLE_PROFILING for true.
  // No entanto, para este caso específico, foi solicitado para manter desabilitado por padrão.
  enabled = false // Mantido como false conforme última alteração para produção
  // Exemplo de como seria com import.meta.env:
  // enabled = (import.meta.env.MODE === 'development' || import.meta.env.VITE_ENABLE_PROFILING === 'true')
}) => {
  const { user } = useAuth();

  const onRenderCallback = (
    profileId: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    // Só registrar se o monitoramento estiver habilitado
    if (!enabled) return;

    // Log detalhado para desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.log(`[PROFILER] ${profileId}`, {
        phase,
        actualDuration: Math.round(actualDuration * 100) / 100,
        baseDuration: Math.round(baseDuration * 100) / 100,
        startTime: Math.round(startTime),
        commitTime: Math.round(commitTime)
      });
    }

    // Registrar métrica de renderização
    trackComponentRender(
      `${profileId}_${phase}`,
      actualDuration,
      user?.id
    );

    // Alertar sobre renderizações lentas em desenvolvimento
    if (import.meta.env.MODE === 'development' && actualDuration > 50) {
      console.warn(`[PROFILER] ⚠️ Renderização lenta detectada em ${profileId}:`, {
        duration: `${Math.round(actualDuration * 100) / 100}ms`,
        phase,
        threshold: '50ms'
      });
    }

    // Alertar sobre muitas re-renderizações
    if (phase === 'update' && actualDuration > baseDuration * 2) {
      console.warn(`[PROFILER] ⚠️ Re-renderização custosa em ${profileId}:`, {
        actualDuration: `${Math.round(actualDuration * 100) / 100}ms`,
        baseDuration: `${Math.round(baseDuration * 100) / 100}ms`,
        overhead: `${Math.round((actualDuration - baseDuration) * 100) / 100}ms`
      });
    }
  };

  // Se o profiling estiver desabilitado, retornar apenas os children
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
};

export default PerformanceProfiler; 