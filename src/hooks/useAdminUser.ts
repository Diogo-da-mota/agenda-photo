
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
      
      // Obter a sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Se já existe uma sessão, o usuário já está autenticado
        console.log("Usuário já está autenticado");
        setAdminCreated(true);
        return;
      }
      
      // Não tenta fazer login automaticamente, apenas verifica se o usuário existe
      console.log("Usuário administrador não existe ou não está autenticado");
    } catch (error) {
      console.log("Erro ao verificar se o administrador existe:", error);
    }
  };

  const createAdminUser = async () => {
    setIsCreatingAdmin(true);
    setError(null);
    
    try {
      // Verificar se há um usuário já logado
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log("Usuário já está autenticado");
        setAdminCreated(true);
        toast({
          title: "Usuário Existente",
          description: "Já existe um usuário autenticado.",
          duration: 5000,
        });
        return;
      }
      
      // Desabilitar a verificação automática para criação de usuário
      const { error } = await supabase.auth.signUp({
        email: 'agenda@gmail.com',
        password: 'agenda123',
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            role: 'admin'
          }
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
      
      console.log("Usuário criado com sucesso");
      setAdminCreated(true);
      toast({
        title: "Usuário Criado",
        description: "Usuário administrador criado com sucesso. Você pode fazer login agora.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      toast({
        title: "Erro ao Criar Usuário",
        description: error instanceof Error ? error.message : "Erro desconhecido",
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
