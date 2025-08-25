import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LockClosedIcon } from '@radix-ui/react-icons';

// Definindo a URL da API
const API_URL = import.meta.env.VITE_AUTH_API_URL || '/api';

interface TwoFactorAuthFormProps {
  email: string;
  tempToken: string;
  onSuccess: (userData: any) => void;
  onCancel: () => void;
}

export function TwoFactorAuthForm({ email, tempToken, onSuccess, onCancel }: TwoFactorAuthFormProps) {
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUsingRecoveryCode, setIsUsingRecoveryCode] = useState(false);
  
  const validateCode = async () => {
    if (!code || code.length < 6) return;
    
    setLoading(true);
    
    try {
      // Primeiro, validar o código 2FA
      const validateResponse = await fetch(`${API_URL}/auth/2fa/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionToken: tempToken,
          token: code
        }),
        credentials: 'include'
      });
      
      if (!validateResponse.ok) {
        const error = await validateResponse.json();
        throw new Error(error.error || 'Código inválido');
      }
      
      const validateData = await validateResponse.json();
      
      // Depois, completar o login
      const loginResponse = await fetch(`${API_URL}/auth/2fa/complete-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tempToken
        }),
        credentials: 'include'
      });
      
      if (!loginResponse.ok) {
        const error = await loginResponse.json();
        throw new Error(error.error || 'Erro ao completar login');
      }
      
      const userData = await loginResponse.json();

      onSuccess(userData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Código inválido. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  
  const toggleRecoveryMode = () => {
    setIsUsingRecoveryCode(!isUsingRecoveryCode);
    setCode('');
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockClosedIcon className="w-5 h-5" />
          Verificação de Dois Fatores
        </CardTitle>
        <CardDescription>
          {isUsingRecoveryCode
            ? "Insira um dos seus códigos de recuperação para continuar."
            : "Insira o código do seu aplicativo autenticador para continuar."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isUsingRecoveryCode && (
            <Alert>
              <AlertDescription>
                Abra seu aplicativo autenticador (Google Authenticator, Microsoft Authenticator, Authy, etc.) 
                e insira o código de 6 dígitos mostrado para <strong>{email}</strong>.
              </AlertDescription>
            </Alert>
          )}
          
          <div>
            <label htmlFor="verification-code" className="block text-sm font-medium mb-2">
              {isUsingRecoveryCode ? "Código de recuperação" : "Código de verificação"}
            </label>
            <Input
              id="verification-code"
              placeholder={isUsingRecoveryCode ? "Insira o código de recuperação" : "Insira o código de 6 dígitos"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={isUsingRecoveryCode ? 10 : 6}
              className="mb-2"
            />
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm" 
              onClick={toggleRecoveryMode}
              disabled={loading}
            >
              {isUsingRecoveryCode
                ? "Usar código do aplicativo autenticador"
                : "Usar código de recuperação"}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Voltar
        </Button>
        <Button 
          onClick={validateCode} 
          disabled={loading || !code || (isUsingRecoveryCode ? code.length < 8 : code.length < 6)}
        >
          {loading ? "Verificando..." : "Continuar"}
        </Button>
      </CardFooter>
    </Card>
  );
} 