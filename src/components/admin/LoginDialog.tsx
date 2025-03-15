
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  adminCreated: boolean;
  createAdminUser: () => Promise<void>;
  isCreatingAdmin: boolean;
  error: string | null;
}

const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  onOpenChange,
  adminCreated,
  createAdminUser,
  isCreatingAdmin,
  error
}) => {
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      console.log("Tentando login com senha:", password);
      
      // Verifica se a senha está correta
      if (password === 'agenda123') {
        console.log("Senha correta, tentando login no Supabase");
        
        // Se a senha estiver correta, faz login no Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'agenda@gmail.com',
          password: 'agenda123'
        });
        
        console.log("Resposta de login do Supabase:", { data, error });
        
        if (error) {
          console.error("Erro de autenticação do Supabase:", error);
          throw error;
        }
        
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao painel administrativo",
          duration: 3000,
        });
        
        onOpenChange(false);
        navigate('/admin');
      } else {
        console.log("Senha incorreta");
        throw new Error('Senha incorreta');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: "Erro de Login",
        description: "Senha incorreta ou erro de autenticação. Por favor, tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] mx-4">
        <DialogHeader>
          <DialogTitle>Acesso Administrativo</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!adminCreated ? (
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              O usuário administrador ainda não foi criado. Clique no botão abaixo para criá-lo.
            </p>
            <Button 
              onClick={createAdminUser} 
              className="w-full"
              disabled={isCreatingAdmin}
            >
              {isCreatingAdmin ? "Criando..." : "Criar Usuário Administrador"}
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
  );
};

export default LoginDialog;
