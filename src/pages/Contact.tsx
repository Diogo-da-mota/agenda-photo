
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar se o usuário admin já existe ao carregar a página
  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      // Tentar fazer login com as credenciais admin para ver se existem
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'agenda@gmail.com',
        password: 'agenda123'
      });
      
      if (!error) {
        // Se não houver erro, o usuário existe
        console.log("Usuário administrador já existe");
        setAdminCreated(true);
        
        // Fazer logout imediatamente
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log("Verificando se o admin existe:", error);
    }
  };

  const createAdminUser = async () => {
    setIsCreatingAdmin(true);
    try {
      // Chamar a função Edge para criar o usuário admin
      const response = await supabase.functions.invoke('create-admin-user');
      
      console.log("Resposta da criação de usuário:", response);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setAdminCreated(true);
      toast({
        title: "Usuário Criado",
        description: "Usuário administrativo criado com sucesso. Agora você pode fazer login.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro ao Criar Usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário administrativo.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      console.log("Attempting login with password:", password);
      
      // Check if the password is correct (hardcoded for simplicity)
      if (password === 'agenda123') {
        console.log("Password is correct, attempting Supabase sign in");
        
        // If password is correct, sign in with Supabase using predefined credentials
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'agenda@gmail.com',
          password: 'agenda123'
        });
        
        console.log("Supabase sign in response:", { data, error });
        
        if (error) {
          console.error("Supabase authentication error:", error);
          throw error;
        }
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao painel administrativo",
          duration: 3000,
        });
        
        setIsLoginOpen(false);
        navigate('/admin');
      } else {
        console.log("Incorrect password entered");
        throw new Error('Senha incorreta');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast({
        title: "Erro no login",
        description: "Senha incorreta ou erro na autenticação. Por favor, tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/99d33cab-856f-4fc2-a814-58f0764face9.png" 
          alt="Fotógrafo profissional" 
          className="w-full h-full object-cover"
        />
        {/* Overlay to make text more visible */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>
      
      {/* Login button in top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          onClick={() => setIsLoginOpen(true)}
          variant="outline" 
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
        >
          Admin
        </Button>
      </div>
      
      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Acesso Administrativo</DialogTitle>
          </DialogHeader>
          
          {!adminCreated ? (
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                O usuário administrativo ainda não foi criado. Clique no botão abaixo para criar.
              </p>
              <Button 
                onClick={createAdminUser} 
                className="w-full"
                disabled={isCreatingAdmin}
              >
                {isCreatingAdmin ? "Criando..." : "Criar Usuário Admin"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input 
                  id="login-password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha" 
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Content overlaid on the image - contained properly to prevent overflow */}
      <div className="relative z-10 text-white text-center px-4 max-w-4xl">
        <h2 className="text-sm sm:text-lg uppercase tracking-wider mb-2">AGENDA PRO</h2>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
          A solução completa para fotógrafos profissionais
        </h1>
        <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 sm:mb-10">
          Gerencie sua agenda, clientes, finanças e presença online em um único lugar
        </p>
        <Button 
          onClick={() => navigate('/survey')}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg sm:text-xl py-5 sm:py-6 px-8 sm:px-10 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          INICIAR
        </Button>
      </div>
    </div>
  );
};

export default Contact;
