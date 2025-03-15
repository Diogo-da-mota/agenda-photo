
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";

interface AdminHeaderProps {
  isAuthenticated: boolean;
  isRefreshing: boolean;
  handleRefresh: () => void;
  handleLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  isAuthenticated, 
  isRefreshing, 
  handleRefresh, 
  handleLogout 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground">Mensagens dos clientes</p>
      </div>
      <div className="flex gap-2">
        {isAuthenticated && (
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Button>
        )}
        <Button variant="outline" onClick={isAuthenticated ? handleLogout : () => window.location.href = '/'}>
          {isAuthenticated ? "Sair" : "Voltar"}
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
