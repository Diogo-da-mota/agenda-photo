import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SessionTimeoutWarning } from './SessionTimeoutWarning';
import { isSessionNearExpiry, forceSecureLogout } from '@/utils/authSecurity';
import { useSessionSecurity } from '@/utils/sessionSecurity';
import { securityLog } from '@/utils/securityUtils';

/**
 * Gerenciador de sessão segura
 */
export const SecureSessionManager: React.FC = () => {
  const { session, user } = useAuth();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(0);
  const { setCallbacks, extendSession, forceRefresh } = useSessionSecurity();

  // Callback para mostrar aviso de timeout
  const handleTimeoutWarning = useCallback(() => {
    if (!session) return;
    
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const now = Date.now();
    const minutesLeft = Math.ceil((expiresAt - now) / (1000 * 60));
    
    setMinutesRemaining(Math.max(minutesLeft, 1));
    setShowTimeoutWarning(true);
    
    // Log removido por segurança - não expor informações de timeout e userId
  }, [session, user]);

  // Callback para expiração da sessão
  const handleSessionExpired = useCallback(() => {
    // Log removido por segurança - não expor informações de expiração e userId
    
    forceSecureLogout('Session expired due to inactivity');
  }, [user]);

  // Configurar callbacks do gerenciador de sessão
  useEffect(() => {
    setCallbacks({
      onTimeoutWarning: handleTimeoutWarning,
      onSessionExpired: handleSessionExpired
    });
  }, [setCallbacks, handleTimeoutWarning, handleSessionExpired]);

  // Monitorar sessão para avisos de expiração
  useEffect(() => {
    if (!session || !user) {
      setShowTimeoutWarning(false);
      return;
    }

    const checkSession = () => {
      if (isSessionNearExpiry(session) && !showTimeoutWarning) {
        handleTimeoutWarning();
      }
    };

    // Verificar a cada minuto
    const interval = setInterval(checkSession, 60000);
    
    // Verificar imediatamente
    checkSession();

    return () => clearInterval(interval);
  }, [session, user, showTimeoutWarning, handleTimeoutWarning]);

  // Handler para estender sessão
  const handleExtendSession = useCallback(async () => {
    try {
      const success = await forceRefresh();
      
      if (success) {
        extendSession();
        setShowTimeoutWarning(false);
        
        // Log removido por segurança - não expor informações de extensão e userId
      } else {
        // Se falhou ao renovar, forçar logout
        handleSessionExpired();
      }
    } catch (error) {
      console.error('Erro ao estender sessão:', error);
      handleSessionExpired();
    }
  }, [forceRefresh, extendSession, user, handleSessionExpired]);

  // Handler para logout manual
  const handleLogout = useCallback(() => {
    // Log removido por segurança - não expor informações de logout e userId
    
    forceSecureLogout('User chose to logout during timeout warning');
  }, [user]);

  // Não renderizar se não há sessão ativa
  if (!session || !user) {
    return null;
  }

  return (
    <SessionTimeoutWarning
      isOpen={showTimeoutWarning}
      onExtendSession={handleExtendSession}
      onLogout={handleLogout}
      minutesRemaining={minutesRemaining}
    />
  );
};