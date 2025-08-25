import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Download, Trash2, RefreshCw } from 'lucide-react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useToast } from '@/hooks/use-toast';

interface ServiceWorkerStatusProps {
  className?: string;
}

/**
 * Componente para exibir status e controles do Service Worker
 * Permite ao usuário gerenciar cache e atualizações
 */
const ServiceWorkerStatus: React.FC<ServiceWorkerStatusProps> = ({ className }) => {
  const { 
    isSupported, 
    isRegistered, 
    updateAvailable, 
    clearCache, 
    updateApp 
  } = useServiceWorker();
  
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleClearCache = async () => {
    try {
      await clearCache();
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível limpar o cache.",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    try {
      await updateApp();
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a aplicação.",
        variant: "destructive"
      });
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          Status da Aplicação
        </CardTitle>
        <CardDescription>
          Gerenciamento de cache e atualizações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Conexão:</span>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Cache:</span>
          <Badge variant={isRegistered ? "default" : "secondary"}>
            {isRegistered ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        {updateAvailable && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Atualização disponível
              </span>
            </div>
            <Button 
              size="sm" 
              onClick={handleUpdate}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar aplicação
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearCache}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar cache
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Cache offline melhora a performance</p>
          <p>• Funciona mesmo sem internet</p>
          <p>• Atualizações automáticas disponíveis</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceWorkerStatus;
