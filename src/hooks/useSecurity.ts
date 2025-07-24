
import { useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SecurityValidation {
  isValid: boolean;
  errors: string[];
}

export const useSecurity = () => {
  const { user } = useAuth();

  // Sanitizar strings para prevenir XSS
  const sanitizeString = useCallback((input: string): string => {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>\"'&]/g, '')
      .trim()
      .substring(0, 1000); // Limite de caracteres
  }, []);

  // Validar email com regex segura
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 255;
  }, []);

  // Validar telefone brasileiro mais rigoroso
  const validatePhone = useCallback((phone: string): boolean => {
    if (!phone) return true; // Opcional
    
    // Remove formatação para validação
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Valida padrões brasileiros
    const brazilianPhoneRegex = /^(\+55\s?)?\(?[1-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/;
    const numericOnlyRegex = /^[0-9]{10,11}$/;
    
    return (brazilianPhoneRegex.test(phone) || numericOnlyRegex.test(cleanPhone)) && 
           phone.length <= 20;
  }, []);

  // Verificar autenticação do usuário
  const validateUser = useCallback((): SecurityValidation => {
    const errors: string[] = [];
    
    if (!user) {
      errors.push('Usuário não autenticado');
    }
    
    if (!user?.id) {
      errors.push('ID do usuário inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [user]);

  // Validar dados do cliente
  const validateClientData = useCallback((data: any): SecurityValidation => {
    const errors: string[] = [];

    if (!data.nome || data.nome.trim().length === 0) {
      errors.push('Nome é obrigatório');
    } else if (data.nome.length > 100) {
      errors.push('Nome muito longo');
    }

    if (data.telefone && !validatePhone(data.telefone)) {
      errors.push('Telefone inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [validatePhone]);

  // Rate limiting simples
  const rateLimiter = useMemo(() => {
    const attempts = new Map<string, number>();
    const lastAttempt = new Map<string, number>();
    
    return {
      checkLimit: (key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
        const now = Date.now();
        const lastTime = lastAttempt.get(key) || 0;
        
        // Reset se passou da janela de tempo
        if (now - lastTime > windowMs) {
          attempts.set(key, 0);
        }
        
        const currentAttempts = attempts.get(key) || 0;
        
        if (currentAttempts >= maxAttempts) {
          return false;
        }
        
        attempts.set(key, currentAttempts + 1);
        lastAttempt.set(key, now);
        return true;
      }
    };
  }, []);

  // Validar arquivo
  const validateFile = useCallback((file: File): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const maxSizeInMB = 10;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    
    if (!file) {
      errors.push('Arquivo é obrigatório');
      return { valid: false, errors };
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('Tipo de arquivo não permitido');
    }
    
    if (file.size > maxSizeInMB * 1024 * 1024) {
      errors.push(`Arquivo muito grande. Máximo ${maxSizeInMB}MB`);
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push('Nome do arquivo contém caracteres inválidos');
    }
    
    return { valid: errors.length === 0, errors };
  }, []);

  return {
    sanitizeString,
    validatePhone,
    validateUser,
    validateClientData,
    validateFile,
    rateLimiter,
    isAuthenticated: !!user
  };
};
