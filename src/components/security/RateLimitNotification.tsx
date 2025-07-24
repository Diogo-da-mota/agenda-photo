import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

interface RateLimitNotificationProps {
  action?: string;
  onDismiss?: () => void;
}

export const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({
  action = 'esta ação',
  onDismiss
}) => {
  const { isRateLimited } = useEnhancedSecurity();
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos

  useEffect(() => {
    if (isRateLimited) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            onDismiss?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRateLimited, onDismiss]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isRateLimited) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium text-red-800 dark:text-red-200">
              Limite de tentativas excedido
            </span>
          </div>
          
          <p className="text-sm text-red-700 dark:text-red-300">
            Você excedeu o limite de tentativas para {action}. 
            Tente novamente em: {formatTime(timeLeft)}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <Clock className="h-3 w-3" />
            <span>Esta medida protege nossa plataforma contra atividades suspeitas</span>
          </div>
          
          {onDismiss && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDismiss}
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
            >
              Entendi
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};