
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminLoginProps {
  handleLogin: () => void;
  password: string;
  setPassword: (password: string) => void;
  error: string | null;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ 
  handleLogin, 
  password, 
  setPassword, 
  error 
}) => {
  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle>Acesso Restrito</CardTitle>
        <CardDescription>
          Digite a senha para acessar as mensagens dos clientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha de administrador"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <Button onClick={handleLogin} className="w-full">
            Acessar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminLogin;
