import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateCSRFToken } from '@/utils/authSecurity';
import { securityLog } from '@/utils/securityUtils';

interface CSRFContextType {
  token: string | null;
  getToken: () => string | null;
  validateToken: (token: string) => boolean;
}

const CSRFContext = createContext<CSRFContextType | null>(null);

export const CSRFProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Gerar token CSRF na inicialização
    const newToken = generateCSRFToken();
    setToken(newToken);
    
    // Adicionar token ao cabeçalho padrão se possível
    if (typeof window !== 'undefined') {
      (window as any).__CSRF_TOKEN__ = newToken;
    }
    
    // Log removido por segurança - não expor informações sobre tokens CSRF
  }, []);

  const getToken = () => token;

  const validateToken = (requestToken: string): boolean => {
    if (!token || !requestToken) {
      // Log removido por segurança - não expor informações sobre validação de tokens
      return false;
    }

    const isValid = token === requestToken;
    // Log removido por segurança - não expor resultado de validação de tokens
    return isValid;
  };

  return (
    <CSRFContext.Provider value={{ token, getToken, validateToken }}>
      {children}
    </CSRFContext.Provider>
  );
};

export const useCSRF = () => {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRF deve ser usado dentro de CSRFProvider');
  }
  return context;
};

// Hook para usar em formulários
export const useCSRFForm = () => {
  const { getToken } = useCSRF();
  
  return {
    getCSRFHeaders: () => ({
      'X-CSRF-Token': getToken() || '',
    }),
    getCSRFInput: () => ({
      name: '_token',
      type: 'hidden',
      value: getToken() || '',
    }),
  };
};