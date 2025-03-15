
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAdminUser = () => {
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Verifica se o usuário administrador já existe quando a página carrega
  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      // Tenta fazer login com as credenciais de administrador para ver se existem
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'agenda@gmail.com',
        password: 'agenda123'
      });
      
      if (!error) {
        // Se não houver erro, o usuário existe
        console.log("Usuário administrador já existe");
        setAdminCreated(true);
        
        // Sai imediatamente
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log("Verificando se o administrador existe:", error);
    }
  };

  const createAdminUser = async () => {
    setIsCreatingAdmin(true);
    setError(null);
    
    try {
      console.log("Invocando Edge Function: create-admin-user");
      
      // Chama a função Edge para criar o usuário administrador com melhor tratamento de erros
      const response = await supabase.functions.invoke('create-admin-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Resposta completa da função Edge:", response);
      
      if (response.error) {
        console.error("Erro na função Edge:", response.error);
        setError(`Falha ao criar usuário administrador: ${response.error.message || response.error}`);
        
        toast({
          title: "Erro ao criar usuário",
          description: response.error.message || "Falha ao conectar ao servidor",
          variant: "destructive",
          duration: 5000,
        });
        
        throw new Error(response.error.message || "Falha ao criar usuário administrador");
      }
      
      setAdminCreated(true);
      toast({
        title: "Usuário Criado",
        description: "Usuário administrador criado com sucesso. Você pode fazer login agora.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      setError(`Falha ao criar usuário administrador: ${error.message || "Erro desconhecido"}`);
      
      // Exibe o erro na página
      toast({
        title: "Erro ao Criar Usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário administrador.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return {
    isCreatingAdmin,
    adminCreated,
    error,
    createAdminUser
  };
};
