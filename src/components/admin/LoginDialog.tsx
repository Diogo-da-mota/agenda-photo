
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  onOpenChange
}) => {
  const [email, setEmail] = useState('agenda@gmail.com');
  const [password, setPassword] = useState('agenda123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    
    try {
      if (!email) {
        setError("O e-mail é obrigatório");
        throw new Error("O e-mail é obrigatório");
      }
      
      if (!password) {
        setError("A senha é obrigatória");
        throw new Error("A senha é obrigatória");
      }
      
      // Try to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // If user doesn't exist, create it
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'admin'
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        // Try signing in again after creating the account
        const { error: finalSignInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (finalSignInError) {
          throw finalSignInError;
        }

        toast({
          title: "Conta criada e conectada",
          description: "Sua conta foi criada e você foi conectado automaticamente.",
          duration: 3000,
        });
      } else if (signInError) {
        throw signInError;
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao painel administrativo",
        duration: 3000,
      });
      
      onOpenChange(false);
      navigate('/admin');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError(error instanceof Error ? error.message : "Ocorreu um erro durante o login");
      toast({
        title: "Erro de Login",
        description: error instanceof Error ? error.message : "Erro de autenticação. Por favor, tente novamente.",
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
          <DialogDescription>
            Faça login para acessar o sistema.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">E-mail</Label>
            <Input 
              id="login-email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail" 
              required
            />
          </div>
          
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
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
