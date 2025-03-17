
import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLogin from "@/components/admin/AdminLogin";
import MessagesWrapper from "@/components/admin/MessagesWrapper";

const ADMIN_PASSWORD = "agenda123"; // Simple password for protection

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is already authenticated from previous session
    const storedAuth = localStorage.getItem("adminAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = () => {
    setError(null);
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuthenticated", "true");
      toast({
        title: "Login realizado",
        description: "Você foi autenticado com sucesso."
      });
    } else {
      setError("Senha incorreta. Tente novamente.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
  };

  const handleRefresh = () => {
    // Ao invés de recarregar a página inteira, apenas incrementamos o contador
    // para forçar o MessagesWrapper a ser remontado com uma nova key
    setRefreshCounter(prev => prev + 1);
    toast({
      title: "Atualizando",
      description: "Buscando mensagens mais recentes..."
    });
  };

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <AdminHeader 
          isAuthenticated={isAuthenticated}
          isRefreshing={false}
          handleRefresh={handleRefresh}
          handleLogout={handleLogout}
        />
        
        {!isAuthenticated ? (
          <AdminLogin 
            handleLogin={handleLogin}
            password={password}
            setPassword={setPassword}
            error={error}
            isLoading={false}
          />
        ) : (
          <div className="space-y-8">
            <MessagesWrapper 
              key={`messages-wrapper-${refreshCounter}`} 
              isAuthenticated={isAuthenticated} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
