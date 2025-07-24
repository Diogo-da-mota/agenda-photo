import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Trash2
} from 'lucide-react';

interface BackgroundSyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * Componente para exibir status do Background Sync
 * Mostra conectividade, operações pendentes e permite sincronização manual
 */
export const BackgroundSyncStatus: React.FC<BackgroundSyncStatusProps> = ({
  className = '',
  showDetails = true
}) => {
  const {
    isOnline,
    pendingOperations,
    lastSyncTime,
    syncInProgress,
    errors,
    syncOperations,
    clearPendingOperations,
    updatePendingCount
  } = useBackgroundSync();

  // Determinar status geral
  const getStatus = () => {
    if (!isOnline) return 'offline';
    if (syncInProgress) return 'syncing';
    if (errors.length > 0) return 'error';
    if (pendingOperations > 0) return 'pending';
    return 'synced';
  };

  const status = getStatus();

  // Configurações visuais baseadas no status
  const statusConfig = {
    offline: {
      icon: WifiOff,
      color: 'destructive',
      label: 'Offline',
      description: 'Sem conexão com a internet'
    },
    syncing: {
      icon: RefreshCw,
      color: 'default',
      label: 'Sincronizando',
      description: 'Enviando dados...'
    },
    error: {
      icon: AlertCircle,
      color: 'destructive',
      label: 'Erro',
      description: 'Falha na sincronização'
    },
    pending: {
      icon: Clock,
      color: 'secondary',
      label: 'Pendente',
      description: `${pendingOperations} operação(ões) aguardando`
    },
    synced: {
      icon: CheckCircle,
      color: 'default',
      label: 'Sincronizado',
      description: 'Todos os dados estão atualizados'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleSync = async () => {
    try {
      await syncOperations();
      await updatePendingCount();
    } catch (error) {
      console.error('Erro ao sincronizar manualmente:', error);
    }
  };

  const handleClearPending = async () => {
    if (confirm('Tem certeza que deseja limpar todas as operações pendentes? Esta ação não pode ser desfeita.')) {
      try {
        await clearPendingOperations();
      } catch (error) {
        console.error('Erro ao limpar operações pendentes:', error);
      }
    }
  };

  if (!showDetails) {
    // Versão compacta - apenas badge
    return (
      <Badge 
        variant={config.color as any}
        className={`flex items-center gap-1 ${className}`}
      >
        <StatusIcon 
          size={12} 
          className={syncInProgress ? 'animate-spin' : ''} 
        />
        {config.label}
        {pendingOperations > 0 && (
          <span className="ml-1 text-xs">({pendingOperations})</span>
        )}
      </Badge>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <StatusIcon 
            size={16} 
            className={syncInProgress ? 'animate-spin' : ''} 
          />
          Background Sync
        </CardTitle>
        <CardDescription className="text-xs">
          Status da sincronização offline
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={config.color as any}>
              {config.label}
            </Badge>
            {isOnline ? (
              <Wifi size={14} className="text-green-500" />
            ) : (
              <WifiOff size={14} className="text-red-500" />
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Descrição do Status */}
        <p className="text-xs text-muted-foreground">
          {config.description}
        </p>

        {/* Operações Pendentes */}
        {pendingOperations > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">
                Operações Pendentes
              </span>
              <Badge variant="outline" className="text-xs">
                {pendingOperations}
              </Badge>
            </div>
            
            {syncInProgress && (
              <div className="space-y-1">
                <Progress value={undefined} className="h-1" />
                <p className="text-xs text-muted-foreground">
                  Sincronizando...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Última Sincronização */}
        {lastSyncTime && (
          <div className="text-xs text-muted-foreground">
            Última sincronização: {lastSyncTime.toLocaleTimeString()}
          </div>
        )}

        {/* Erros */}
        {errors.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-red-600">
              Erros de Sincronização:
            </span>
            {errors.slice(0, 3).map((error, index) => (
              <p key={index} className="text-xs text-red-600">
                • {error}
              </p>
            ))}
            {errors.length > 3 && (
              <p className="text-xs text-red-600">
                ... e mais {errors.length - 3} erro(s)
              </p>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={syncInProgress || !isOnline}
            className="flex-1 h-7 text-xs"
          >
            <RefreshCw 
              size={12} 
              className={`mr-1 ${syncInProgress ? 'animate-spin' : ''}`} 
            />
            Sincronizar
          </Button>
          
          {pendingOperations > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearPending}
              disabled={syncInProgress}
              className="h-7 text-xs px-2"
            >
              <Trash2 size={12} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
