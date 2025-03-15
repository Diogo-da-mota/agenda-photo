
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface AdminLoginProps {
  handleLogin: () => void;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
  isLoading?: boolean;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ 
  handleLogin, 
  password, 
  setPassword, 
  error,
  isLoading = false
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };
  
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Login Administrativo</CardTitle>
          <CardDescription>
            Digite a senha para acessar o painel de mensagens
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inicializando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
