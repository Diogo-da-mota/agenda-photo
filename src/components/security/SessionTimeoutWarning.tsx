import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSessionSecurity } from '@/utils/sessionSecurity';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  minutesRemaining: number;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  isOpen,
  onExtendSession,
  onLogout,
  minutesRemaining: initialMinutes
}) => {
  const [minutesRemaining, setMinutesRemaining] = useState(initialMinutes);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { forceRefresh } = useSessionSecurity();

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setMinutesRemaining(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, [isOpen, onLogout]);

  const handleExtendSession = async () => {
    setIsRefreshing(true);
    try {
      const success = await forceRefresh();
      if (success) {
        onExtendSession();
      } else {
        // Se não conseguiu renovar, force logout
        onLogout();
      }
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
      onLogout();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Sessão Expirando
          </DialogTitle>
          <DialogDescription>
            Sua sessão expirará em breve por inatividade. Deseja continuar?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-lg font-medium">
            <Clock className="h-5 w-5 text-warning" />
            <span>
              {minutesRemaining} minuto{minutesRemaining !== 1 ? 's' : ''} restante{minutesRemaining !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          <p>Clique em "Continuar" para estender sua sessão</p>
          <p>ou "Sair" para fazer logout agora.</p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onLogout}
            disabled={isRefreshing}
          >
            Sair
          </Button>
          <Button 
            onClick={handleExtendSession}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            {isRefreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};