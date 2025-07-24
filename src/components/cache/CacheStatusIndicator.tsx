/**
 * Indicador de status do cache IndexedDB
 * Componente opcional para monitorar cache offline
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Trash2,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useOfflineStatus, useOfflineCacheInvalidation } from '@/hooks/useOfflineCacheQuery';
import { useCacheInitializer } from '@/utils/cache/CacheInitializer';

interface CacheStatusIndicatorProps {
  position?: 'fixed' | 'relative';
  showDetails?: boolean;
  className?: string;
}

export default function CacheStatusIndicator({ 
  position = 'fixed', 
  showDetails = false,
  className = '' 
}: CacheStatusIndicatorProps) {
  const { isOnline, isOffline } = useOfflineStatus();
  const { invalidateAllUserCache, getCacheStatistics } = useOfflineCacheInvalidation();
  const { getDetailedStats, cleanExpiredData, checkCacheIntegrity } = useCacheInitializer();
  
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Atualizar estatísticas periodicamente
  useEffect(() => {
    const updateStats = async () => {
      try {
        const stats = await getCacheStatistics();
        setCacheStats(stats);
        setLastUpdate(new Date());
      } catch (error) {
        console.warn('Erro ao obter estatísticas do cache:', error);
      }
    };

    updateStats();
    // O polling com setInterval foi removido conforme Etapa 1.3 do plano de otimização.

  }, [getCacheStatistics]);

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await invalidateAllUserCache();
      const stats = await getCacheStatistics();
      setCacheStats(stats);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanExpired = async () => {
    setIsLoading(true);
    try {
      await cleanExpiredData();
      const stats = await getCacheStatistics();
      setCacheStats(stats);
    } catch (error) {
      console.error('Erro ao limpar dados expirados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    if (isOffline) return <WifiOff className="h-4 w-4 text-red-500" />;
    if (isOnline) return <Wifi className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isOffline) return 'Offline';
    if (isOnline) return 'Online';
    return 'Verificando...';
  };

  const getStatusColor = () => {
    if (isOffline) return 'destructive';
    if (isOnline) return 'default';
    return 'secondary';
  };

  const positionClasses = position === 'fixed' 
    ? 'fixed bottom-4 right-4 z-50' 
    : 'relative';

  if (!showDetails) {
    // Versão compacta
    return (
      <div className={`${positionClasses} ${className}`}>
        <Badge variant={getStatusColor()} className="gap-2">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
      </div>
    );
  }

  // Versão detalhada
  return (
    <div className={`${positionClasses} ${className}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Database className="h-4 w-4" />
            Cache {cacheStats?.totalItems || 0}
            {getStatusIcon()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Status do Cache</h4>
              <Badge variant={getStatusColor()} className="gap-1">
                {getStatusIcon()}
                {getStatusText()}
              </Badge>
            </div>

            {cacheStats && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total de itens:</span>
                  <span className="font-medium">{cacheStats.totalItems}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Por categoria:</span>
                  {Object.entries(cacheStats.cacheSize || {}).map(([store, count]) => (
                    <div key={store} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {store.replace('_', ' ')}:
                      </span>
                      <span>{count as number}</span>
                    </div>
                  ))}
                </div>

                {cacheStats.syncQueueSize > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fila de sync:</span>
                    <Badge variant="secondary">{cacheStats.syncQueueSize}</Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Última atualização:</span>
                  <span className="text-xs text-muted-foreground">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCleanExpired}
                disabled={isLoading}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Limpar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                disabled={isLoading}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              💡 Cache offline permite funcionalidade completa sem internet
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Componente simples para mostrar status de conectividade
 */
export function ConnectivityIndicator() {
  const { isOnline, isOffline } = useOfflineStatus();

  return (
    <div className="flex items-center gap-2">
      {isOnline && <CheckCircle className="h-4 w-4 text-green-500" />}
      {isOffline && <AlertCircle className="h-4 w-4 text-red-500" />}
      <span className="text-sm">
        {isOnline ? 'Conectado' : 'Offline'}
      </span>
    </div>
  );
} 