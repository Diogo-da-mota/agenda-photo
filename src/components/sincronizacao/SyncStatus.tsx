import { Badge, BadgeProps } from '@/components/ui/badge';
import { useSyncStatus } from '@/hooks/useAutoSync';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SyncStatusCard: React.FC<{ className?: string }> = ({ className }) => {
  const { data: status, isLoading, error, refetch } = useSyncStatus();

  const handleRefresh = () => {
    // toast.info('Verificando status da sincronização...');
    refetch();
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 animate-spin" />
            Verificando Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error || !status || status.status === 'disabled') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            Sincronização Inativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            O serviço de sincronização automática está desativado.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Como o serviço está desativado, o código abaixo não será alcançado,
  // mas é mantido para referência futura caso o serviço seja reativado.
  // A interface do 'status' precisaria ser atualizada.
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Sincronização Ativa
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default SyncStatusCard;
