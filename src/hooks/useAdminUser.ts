
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAdminUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Verifica se o usuário já está autenticado quando a página carrega
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("Verificando status de autenticação...");
      
      // Obter a sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log("Usuário já está autenticado");
        setIsAuthenticated(true);
      } else {
        console.log("Usuário não está autenticado");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Erro ao verificar status de autenticação:", error);
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Tentar fazer login com as credenciais fornecidas
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Erro ao fazer login:", error.message);
        setError(error.message);
        toast({
          title: "Erro no Login",
          description: "Credenciais de login inválidas",
          variant: "destructive",
          duration: 5000,
        });
        return false;
      }
      
      console.log("Login realizado com sucesso");
      setIsAuthenticated(true);
      toast({
        title: "Login Bem-sucedido",
        description: "Você foi autenticado com sucesso.",
        duration: 3000,
      });
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro no Login",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAdmin = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      toast({
        title: "Logout Realizado",
        description: "Você saiu da sua conta com sucesso.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao Sair",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isAuthenticated,
    error,
    loginAdmin,
    logoutAdmin
  };
};
