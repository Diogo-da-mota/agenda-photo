import React, { useEffect, useState } from 'react';
import { getPreloadStats } from '../../utils/lazyPreloader';
import { useNetworkAwareLoading } from '../../hooks/useLazyLoading';

/**
 * Componente para monitorar performance do lazy loading
 * Útil para desenvolvimento e debugging
 */
interface LazyLoadMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const LazyLoadMonitor: React.FC<LazyLoadMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right'
}) => {
  const [stats, setStats] = useState({ cachedComponents: 0, componentKeys: [] as string[] });
  const [isVisible, setIsVisible] = useState(false);
  const { connectionSpeed, loadingStrategy } = useNetworkAwareLoading();

  useEffect(() => {
    if (!enabled) return;

    const updateStats = () => {
      setStats(getPreloadStats());
    };

    // Atualiza stats a cada 2 segundos
    const interval = setInterval(updateStats, 2000);
    updateStats(); // Primeira atualização imediata

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const getConnectionIcon = () => {
    switch (connectionSpeed) {
      case 'slow': return '🐌';
      case 'medium': return '🚶';
      case 'fast': return '🚀';
      default: return '❓';
    }
  };

  const getConnectionColor = () => {
    switch (connectionSpeed) {
      case 'slow': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'fast': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black/80 text-white p-2 rounded-full shadow-lg hover:bg-black/90 transition-colors"
        title="Monitor de Lazy Loading"
      >
        📊
      </button>

      {/* Stats Panel */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-[280px]">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-sm">Lazy Load Monitor</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Connection Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Conexão:</span>
                <span className={`text-xs font-medium ${getConnectionColor()}`}>
                  {getConnectionIcon()} {connectionSpeed || 'unknown'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Preload:</span>
                <span className={`text-xs ${loadingStrategy.preloadEnabled ? 'text-green-500' : 'text-red-500'}`}>
                  {loadingStrategy.preloadEnabled ? '✅ Ativo' : '❌ Desabilitado'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Estratégia:</span>
                <span className="text-xs font-medium">
                  {loadingStrategy.chunkSize}
                </span>
              </div>
            </div>

            {/* Cache Stats */}
            <div className="space-y-2 border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Componentes em Cache:</span>
                <span className="text-xs font-bold text-blue-500">
                  {stats.cachedComponents}
                </span>
              </div>

              {stats.componentKeys.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Carregados:</span>
                  <div className="max-h-20 overflow-y-auto">
                    {stats.componentKeys.map((key, index) => (
                      <div key={index} className="text-xs text-green-600 dark:text-green-400">
                        ✓ {key}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Performance Tips */}
            <div className="border-t pt-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Dicas:</span>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {connectionSpeed === 'slow' && (
                  <div>🐌 Conexão lenta detectada. Preload desabilitado.</div>
                )}
                {connectionSpeed === 'fast' && (
                  <div>🚀 Conexão rápida! Preload ativo.</div>
                )}
                {stats.cachedComponents === 0 && (
                  <div>💡 Navegue pela aplicação para ver o cache em ação.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyLoadMonitor;