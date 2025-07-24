import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, RefreshCw, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useServiceWorker } from '@/utils/serviceWorker';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
  position?: 'fixed' | 'relative';
}

/**
 * Indicador de status de conectividade e cache offline
 * Mostra quando o usuário está offline e gerencia atualizações
 */
const OfflineIndicator: React.FC<OfflineIndicatorProps> = memo(({
  className = "",
  showDetails = false,
  position = 'fixed'
}) => {
  const {
    isOnline,
    isRegistered,
    updateAvailable,
    cacheStats,
    updateServiceWorker,
    refreshCacheStats,
    clearCache
  } = useServiceWorker();

  // Não mostrar se está online e não há atualizações
  if (isOnline && !updateAvailable && !showDetails) {
    return null;
  }

  const baseClasses = position === 'fixed' 
    ? "fixed bottom-4 right-4 z-50 max-w-sm"
    : "w-full";

  return (
    <div className={cn(baseClasses, className)}>
      {/* Status de conectividade */}
      {!isOnline && (
        <Alert className="mb-2 border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold">Você está offline</span>
              <span className="text-xs">
                {isRegistered ? 'Modo offline ativo - dados em cache disponíveis' : 'Algumas funcionalidades podem não funcionar'}
              </span>
            </div>
            <Badge variant="outline" className="ml-2">
              <HardDrive className="w-3 h-3 mr-1" />
              Cache
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Atualização disponível */}
      {updateAvailable && (
        <Alert className="mb-2 border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          <RefreshCw className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold">Nova versão disponível</span>
              <span className="text-xs">Clique para atualizar e obter as últimas melhorias</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={updateServiceWorker}
              className="ml-2 text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Atualizar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Status online (apenas se showDetails for true) */}
      {isOnline && showDetails && (
        <Alert className="mb-2 border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200">
          <Wifi className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold">Online</span>
              <span className="text-xs">
                {isRegistered ? 'Service Worker ativo - Cache otimizado' : 'Conexão normal'}
              </span>
            </div>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-green-700">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
              {isRegistered && (
                <Badge variant="outline" className="text-green-700">
                  <HardDrive className="w-3 h-3 mr-1" />
                  SW
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detalhes do cache (se solicitado) */}
      {showDetails && cacheStats && (
        <Alert className="border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200">
          <HardDrive className="h-4 w-4" />
          <AlertDescription>
            <div className="flex flex-col space-y-2">
              <span className="font-semibold">Estatísticas do Cache</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(cacheStats).map(([cacheName, count]) => (
                  <div key={cacheName} className="flex justify-between">
                    <span className="truncate">{cacheName.replace('bright-spark-', '')}:</span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshCacheStats}
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Atualizar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearCache}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Limpar Cache
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});

OfflineIndicator.displayName = 'OfflineIndicator';

export default OfflineIndicator; 