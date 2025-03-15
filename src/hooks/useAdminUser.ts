
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
      console.log("Verificando se o usuário administrador existe...");
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
      } else {
        console.log("Usuário administrador não existe ou credenciais inválidas");
      }
    } catch (error) {
      console.log("Erro ao verificar se o administrador existe:", error);
    }
  };

  // Cria o usuário diretamente usando a API de autenticação do Supabase
  const createAdminDirectly = async () => {
    try {
      console.log("Tentando criar usuário admin diretamente pela API do Supabase");
      
      // Aqui estamos tentando fazer signup normal (isso funcionará se o auto-confirm for habilitado)
      const { data, error } = await supabase.auth.signUp({
        email: 'agenda@gmail.com',
        password: 'agenda123',
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          setAdminCreated(true);
          toast({
            title: "Usuário Já Existe",
            description: "Usuário administrador já está cadastrado. Você pode fazer login agora.",
            duration: 5000,
          });
          return true;
        }
        
        console.error("Erro ao criar usuário diretamente:", error);
        return false;
      }
      
      setAdminCreated(true);
      toast({
        title: "Usuário Criado",
        description: "Usuário administrador criado com sucesso. Você precisará confirmar o email antes de fazer login.",
        duration: 5000,
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao criar usuário diretamente:", error);
      return false;
    }
  };

  const createAdminUser = async () => {
    setIsCreatingAdmin(true);
    setError(null);
    
    try {
      console.log("Invocando Edge Function: create-admin-user");
      
      // Chama a função Edge para criar o usuário administrador com retry e timeout
      let retries = 0;
      const maxRetries = 3;
      let lastError;
      
      while (retries < maxRetries) {
        try {
          const response = await supabase.functions.invoke('create-admin-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          console.log("Resposta completa da função Edge:", response);
          
          if (response.error) {
            console.error("Erro na função Edge:", response.error);
            throw new Error(response.error.message || response.error);
          }
          
          // Se chegamos aqui, a função foi executada com sucesso
          setAdminCreated(true);
          toast({
            title: "Usuário Criado",
            description: "Usuário administrador criado com sucesso. Você pode fazer login agora.",
            duration: 5000,
          });
          
          return; // Saímos da função se tudo der certo
        } catch (e) {
          lastError = e;
          console.error(`Tentativa ${retries + 1} falhou:`, e);
          retries++;
          
          // Aguarda antes de tentar novamente (exponential backoff)
          if (retries < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retries), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // Se todas as tentativas com a Edge Function falharam, tentamos criar diretamente
      console.log("Todas as tentativas com Edge Function falharam, tentando criar usuário diretamente");
      const success = await createAdminDirectly();
      
      if (!success) {
        throw lastError || new Error("Falha ao criar usuário após várias tentativas");
      }
      
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      
      let errorMessage = "Falha ao criar usuário administrador";
      
      if (error.message && error.message.includes("Failed to send a request to the Edge Function")) {
        errorMessage = "Erro de conexão com o servidor. Verificando método alternativo...";
        
        // Tenta criar o usuário diretamente
        const success = await createAdminDirectly();
        if (success) {
          return; // Sai da função se conseguir criar o usuário
        }
        
        errorMessage = "Erro de conexão com o servidor. Verifique sua internet ou tente novamente mais tarde.";
      } else if (error.message && error.message.includes("already exists")) {
        errorMessage = "Usuário já existe. Você pode fazer login agora.";
        setAdminCreated(true);
      } else {
        errorMessage = `Falha ao criar usuário: ${error.message || "Erro desconhecido"}`;
      }
      
      setError(errorMessage);
      
      // Exibe o erro na página
      toast({
        title: "Erro ao Criar Usuário",
        description: errorMessage,
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
