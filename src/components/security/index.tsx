import React, { createContext, useContext, ReactNode } from 'react';

interface CSRFContextType {
  token: string | null;
}

const CSRFContext = createContext<CSRFContextType>({ token: null });

export const useCSRF = () => {
  return useContext(CSRFContext);
};

interface CSRFProviderProps {
  children: ReactNode;
}

export const CSRFProvider: React.FC<CSRFProviderProps> = ({ children }) => {
  // Em uma implementação real, você obteria o token CSRF do servidor
  // Por enquanto, usando um valor mock
  const token = null;

  return (
    <CSRFContext.Provider value={{ token }}>
      {children}
    </CSRFContext.Provider>
  );
};