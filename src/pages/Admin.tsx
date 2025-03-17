
import React, { useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/formatDate";
import { useMessageData } from "@/hooks/useMessageData";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLogin from "@/components/admin/AdminLogin";
import MessagesWrapper from "@/components/admin/MessagesWrapper";

const ADMIN_PASSWORD = "agenda123"; // Simple password for protection

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is already authenticated from previous session
    const storedAuth = localStorage.getItem("adminAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <AdminHeader 
          isAuthenticated={isAuthenticated}
          isRefreshing={false}
          handleRefresh={() => {}}
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
            <MessagesWrapper isAuthenticated={isAuthenticated} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
