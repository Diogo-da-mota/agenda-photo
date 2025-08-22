import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { securityLogger } from '@/utils/securityLogger';

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
}

interface SecurityEventDetails {
  [key: string]: unknown;
}

interface SecurityHookReturn {
  isRateLimited: boolean;
  checkRateLimit: (action: string, identifier?: string) => Promise<boolean>;
  validateFileUpload: (file: File) => Promise<{ valid: boolean; error?: string }>;
  logSecurityEvent: (eventType: string, details: SecurityEventDetails) => Promise<void>;
  sanitizeInput: (input: string) => string;
  isSessionNearExpiry: boolean;
}

export const useEnhancedSecurity = (): SecurityHookReturn => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isSessionNearExpiry, setIsSessionNearExpiry] = useState(false);

  // Verificar expiração da sessão
  useEffect(() => {
    const checkSessionExpiry = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.expires_at) {
          const expiresAt = session.expires_at * 1000;
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;
          const fiveMinutes = 5 * 60 * 1000;

          setIsSessionNearExpiry(timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0);
        }
      } catch (error) {
        securityLogger.logSuspiciousActivity('SESSION_CHECK_ERROR', { error: error.message });
      }
    };

    checkSessionExpiry();
    const interval = setInterval(checkSessionExpiry, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = useCallback(async (
    action: string, 
    identifier?: string
  ): Promise<boolean> => {
    try {
      const userIdentifier = identifier || 'anonymous';
      
      const { data, error } = await supabase.rpc('check_rate_limit', {
        user_identifier: userIdentifier,
        action_type: action,
        max_attempts: 5,
        window_minutes: 15
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Em caso de erro, permitir (fail-open)
      }

      const isAllowed = data === true;
      setIsRateLimited(!isAllowed);

      if (!isAllowed) {
        securityLogger.logSuspiciousActivity('RATE_LIMIT_EXCEEDED', {
          action,
          identifier: userIdentifier
        });
      }

      return isAllowed;
    } catch (error) {
      console.error('Rate limiting error:', error);
      return true; // Fail-open em caso de erro
    }
  }, []);

  const validateFileUpload = useCallback(async (file: File): Promise<{ valid: boolean; error?: string }> => {
    try {
      // Validação no frontend primeiro
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (file.size > maxSize) {
        return { valid: false, error: 'Arquivo muito grande. Máximo 10MB.' };
      }

      if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Tipo de arquivo não permitido.' };
      }

      if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
        return { valid: false, error: 'Nome do arquivo contém caracteres inválidos.' };
      }

      // Validação no backend
      const { data, error } = await supabase.rpc('validate_file_upload', {
        file_name: file.name,
        file_size: file.size,
        content_type: file.type
      });

      if (error) {
        securityLogger.logSuspiciousActivity('FILE_VALIDATION_ERROR', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          error: error.message
        });
        return { valid: false, error: error.message };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Erro na validação do arquivo.' };
    }
  }, []);

  const logSecurityEvent = useCallback(async (eventType: string, details: SecurityEventDetails): Promise<void> => {
    try {
      await supabase.rpc('log_security_event', {
        event_type: eventType,
        event_details: JSON.stringify(details)
      });
    } catch (error) {
      console.error('Security logging error:', error);
    }
  }, []);

  const sanitizeInput = useCallback((input: string): string => {
    if (!input) return '';
    
    return input
      .replace(/[<>"'&]/g, '') // Remove caracteres perigosos para XSS
      .trim()
      .substring(0, 1000); // Limite de caracteres
  }, []);

  return {
    isRateLimited,
    checkRateLimit,
    validateFileUpload,
    logSecurityEvent,
    sanitizeInput,
    isSessionNearExpiry
  };
};