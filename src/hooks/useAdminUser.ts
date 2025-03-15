
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

  const createAdminUser = async () => {
    setIsCreatingAdmin(true);
    setError(null);
    
    try {
      console.log("Criando usuário administrador diretamente");
      
      // Cria o usuário administrador diretamente
      const { data, error } = await supabase.auth.signUp({
        email: 'agenda@gmail.com',
        password: 'agenda123',
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          console.log("Usuário já está registrado");
          setAdminCreated(true);
          toast({
            title: "Usuário Já Existe",
            description: "Usuário administrador já está cadastrado. Você pode fazer login agora.",
            duration: 5000,
          });
          return;
        }
        
        throw error;
      }
      
      console.log("Usuário criado com sucesso:", data);
      setAdminCreated(true);
      toast({
        title: "Usuário Criado",
        description: "Usuário administrador criado com sucesso. Você pode fazer login agora.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      
      setError(`Falha ao criar usuário: ${error.message || "Erro desconhecido"}`);
      
      toast({
        title: "Erro ao Criar Usuário",
        description: `Falha ao criar usuário: ${error.message || "Erro desconhecido"}`,
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
