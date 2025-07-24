import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { supabase } from '@/lib/supabase';
import { Shield, Clock, AlertTriangle } from 'lucide-react';

export const SessionSecurityMonitor: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isSessionNearExpiry, logSecurityEvent } = useEnhancedSecurity();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (isSessionNearExpiry && user) {
      setShowWarning(true);
      
      // Log do evento de sessão próxima ao vencimento
      logSecurityEvent('SESSION_EXPIRY_WARNING', {
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      // Calcular tempo restante (estimativa)
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            handleAutoLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Definir 5 minutos como tempo inicial
      setTimeLeft(5 * 60);

      return () => clearInterval(interval);
    } else {
      setShowWarning(false);
    }
  }, [isSessionNearExpiry, user, logSecurityEvent]);

  const handleAutoLogout = async () => {
    if (user) {
      await logSecurityEvent('AUTO_LOGOUT_SESSION_EXPIRED', {
        userId: user.id,
        timestamp: new Date().toISOString()
      });
    }
    await signOut();
  };

  const handleExtendSession = async () => {
    try {
      // Refreshar a sessão
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        await handleAutoLogout();
      } else {
        setShowWarning(false);
        if (user) {
          await logSecurityEvent('SESSION_EXTENDED', {
            userId: user.id,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao estender sessão:', error);
      await handleAutoLogout();
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !user) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium text-amber-800 dark:text-amber-200">
              Sessão expirando em: {formatTime(timeLeft)}
            </span>
          </div>
          
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Sua sessão está prestes a expirar por segurança. Deseja continuar?
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleExtendSession}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Shield className="h-3 w-3 mr-1" />
              Continuar
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleAutoLogout}
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
            >
              Sair
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};