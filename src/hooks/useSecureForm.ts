import { useState, useCallback } from 'react';
import { useCSRF } from '@/components/security/CSRFProtection';
import { validateInput } from '@/utils/authSecurity';
import { securityLog } from '@/utils/securityUtils';

export interface SecureFormOptions {
  sanitizeInputs?: boolean;
  validateXSS?: boolean;
  requireCSRF?: boolean;
}

export const useSecureForm = (options: SecureFormOptions = {}) => {
  const { 
    sanitizeInputs = true, 
    validateXSS = true, 
    requireCSRF = true 
  } = options;
  
  const { getToken, validateToken } = useCSRF();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityErrors, setSecurityErrors] = useState<string[]>([]);

  const validateFormSecurity = useCallback((formData: FormData | Record<string, any>) => {
    const errors: string[] = [];
    
    // Validar CSRF se necessário
    if (requireCSRF) {
      const csrfToken = formData instanceof FormData 
        ? formData.get('_token') as string
        : formData._token;
        
      if (!csrfToken || !validateToken(csrfToken)) {
        errors.push('Token de segurança inválido');
        securityLog('CSRF validation failed in form', { 
          hasToken: !!csrfToken,
          formKeys: formData instanceof FormData 
            ? Array.from(formData.keys()) 
            : Object.keys(formData)
        });
      }
    }
    
    // Validar XSS se necessário
    if (validateXSS) {
      const values = formData instanceof FormData 
        ? Array.from(formData.values())
        : Object.values(formData);
        
      for (const value of values) {
        if (typeof value === 'string' && !validateInput(value)) {
          errors.push('Dados contêm conteúdo não permitido');
          securityLog('XSS attempt detected in form', { 
            suspiciousValue: value.substring(0, 50) + '...'
          });
          break;
        }
      }
    }
    
    return errors;
  }, [requireCSRF, validateXSS, validateToken]);

  const sanitizeFormData = useCallback((data: Record<string, any>) => {
    if (!sanitizeInputs) return data;
    
    const sanitized: Record<string, any> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Sanitizar string removendo caracteres perigosos
        sanitized[key] = value
          .replace(/[<>\"'&]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }, [sanitizeInputs]);

  const submitSecurely = useCallback(async (
    data: Record<string, any>,
    submitFn: (sanitizedData: Record<string, any>) => Promise<void>
  ) => {
    setIsSubmitting(true);
    setSecurityErrors([]);
    
    try {
      // Adicionar token CSRF se necessário
      const dataWithCSRF = requireCSRF 
        ? { ...data, _token: getToken() }
        : data;
      
      // Validar segurança
      const validationErrors = validateFormSecurity(dataWithCSRF);
      if (validationErrors.length > 0) {
        setSecurityErrors(validationErrors);
        return;
      }
      
      // Sanitizar dados
      const sanitizedData = sanitizeFormData(dataWithCSRF);
      
      // Remover token CSRF dos dados sanitizados (usado apenas para validação)
      if (requireCSRF) {
        delete sanitizedData._token;
      }
      
      // Submeter formulário
      await submitFn(sanitizedData);
      
      securityLog('Secure form submitted successfully', {
        fields: Object.keys(sanitizedData)
      });
      
    } catch (error) {
      securityLog('Secure form submission failed', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    requireCSRF, 
    getToken, 
    validateFormSecurity, 
    sanitizeFormData
  ]);

  return {
    submitSecurely,
    isSubmitting,
    securityErrors,
    validateFormSecurity,
    sanitizeFormData
  };
};