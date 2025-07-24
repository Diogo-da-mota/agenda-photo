import React from 'react';
import ClientTabNavigation from '@/components/client/navigation/ClientTabNavigation';

interface ClientTabLayoutProps {
  children: React.ReactNode;
}

const ClientTabLayout: React.FC<ClientTabLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Navegação por Abas */}
      <ClientTabNavigation />

      {/* Conteúdo da página */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ClientTabLayout;