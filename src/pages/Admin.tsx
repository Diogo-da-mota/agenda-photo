
import React, { useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/formatDate";
import { useMessageData } from "@/hooks/useMessageData";
import { initializeDatabase } from "@/integrations/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLogin from "@/components/admin/AdminLogin";
import CustomerMessagesList from "@/components/admin/CustomerMessagesList";
import MessagesList from "@/components/admin/MessagesList";

const ADMIN_PASSWORD = "agenda123"; // Simple password for protection

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();
  
  const { 
    customerMessages, 
    messages, 
    isLoading, 
    isRefreshing, 
    tablesExist, 
    checkTables, 
    handleRefresh 
  } = useMessageData(isAuthenticated);

  useEffect(() => {
    // Check if user is already authenticated from previous session
    const storedAuth = localStorage.getItem("adminAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
    setError(null);
    if (password === ADMIN_PASSWORD) {
      setIsInitializing(true);
      try {
        // Initialize database tables if needed
        await initializeDatabase();
        setIsAuthenticated(true);
        localStorage.setItem("adminAuthenticated", "true");
        checkTables();
      } catch (error) {
        console.error('Error initializing database:', error);
        toast({
          title: "Erro",
          description: "Erro ao inicializar o banco de dados",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
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
          isRefreshing={isRefreshing}
          handleRefresh={handleRefresh}
          handleLogout={handleLogout}
        />
        
        {!isAuthenticated ? (
          <AdminLogin 
            handleLogin={handleLogin}
            password={password}
            setPassword={setPassword}
            error={error}
            isLoading={isInitializing}
          />
        ) : isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando mensagens...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <CustomerMessagesList 
              tableExists={tablesExist.customerMessages}
              customerMessages={customerMessages}
              formatDate={formatDate}
              checkTables={checkTables}
            />
            
            <MessagesList 
              tableExists={tablesExist.messages}
              messages={messages}
              formatDate={formatDate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
