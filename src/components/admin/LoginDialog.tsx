
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useAdminUser } from "@/hooks/useAdminUser";

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
  const { isLoading, error, loginAdmin } = useAdminUser();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }
    
    if (!password) {
      return;
    }
    
    const success = await loginAdmin(email, password);
    if (success) {
      onOpenChange(false);
      navigate('/admin');
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
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
