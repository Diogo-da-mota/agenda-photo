import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon, LockClosedIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { useAuth } from '@/hooks/useAuth';

// Definindo a URL da API
const API_URL = import.meta.env.VITE_AUTH_API_URL || '/api';

interface TwoFactorSetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Interface para o estado de configuração 2FA
interface TwoFactorSetupState {
  enabled: boolean;
  verified: boolean;
  isVerified: boolean;
}

export function TwoFactorSetup({ onSuccess, onCancel }: TwoFactorSetupProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  
  // Estados para 2FA
  const [loading, setLoading] = useState(false);
  const [setupStarted, setSetupStarted] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [status, setStatus] = useState<TwoFactorSetupState>({ 
    enabled: false, 
    verified: false,
    isVerified: false
  });
  
  // Verificar status atual de 2FA
  useEffect(() => {
    async function checkStatus() {
      if (!session) return;
      
      try {
        const response = await fetch(`${API_URL}/auth/2fa/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          // Garantir que tanto verified quanto isVerified estejam sincronizados
          const updatedStatus = {
            ...data,
            isVerified: data.isVerified !== undefined ? data.isVerified : data.verified
          };
          setStatus(updatedStatus);
          
          if (updatedStatus.enabled && (updatedStatus.verified || updatedStatus.isVerified)) {
            setSetupComplete(true);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status 2FA:', error);
      }
    }
    
    checkStatus();
  }, [session]);
  
  // Iniciar configuração 2FA
  const startSetup = async () => {
    if (!session) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao configurar 2FA');
      }
      
      const data = await response.json();
      setQrCodeUrl(data.qrCode);
      setSecret(data.secret);
      setSetupStarted(true);
      
      toast({
        title: "Configuração iniciada",
        description: "Escaneie o código QR com seu aplicativo autenticador",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar configuração 2FA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar código e ativar 2FA
  const verifyAndActivate = async () => {
    if (!session || !verificationCode) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ token: verificationCode }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Código inválido');
      }
      
      const data = await response.json();
      setRecoveryCodes(data.recoveryCodes || []);
      setSetupComplete(true);
      
      toast({
        title: "2FA Ativado",
        description: "Autenticação de dois fatores ativada com sucesso",
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao verificar código",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Desativar 2FA
  const disable2FA = async () => {
    if (!session || !verificationCode) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ token: verificationCode }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Código inválido');
      }
      
      setStatus({ enabled: false, verified: false, isVerified: false });
      setSetupComplete(false);
      setSetupStarted(false);
      setVerificationCode('');
      
      toast({
        title: "2FA Desativado",
        description: "Autenticação de dois fatores desativada com sucesso",
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao desativar 2FA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Renderização dos estados da interface
  if (status.enabled && (status.verified || status.isVerified)) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockClosedIcon className="w-5 h-5 text-green-500" />
            Autenticação de Dois Fatores (2FA)
          </CardTitle>
          <CardDescription>
            A autenticação de dois fatores está ativa em sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-green-50">
            <CheckCircledIcon className="w-4 h-4 text-green-500" />
            <AlertTitle>2FA Ativado</AlertTitle>
            <AlertDescription>
              Sua conta está protegida com autenticação de dois fatores.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Desativar 2FA</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Para desativar a autenticação de dois fatores, insira um código do seu aplicativo autenticador.
              </p>
              
              <Input 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Código de verificação"
                className="mb-4"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={disable2FA} 
            disabled={loading || !verificationCode || verificationCode.length < 6}
          >
            {loading ? "Processando..." : "Desativar 2FA"}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (setupComplete) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircledIcon className="w-5 h-5 text-green-500" />
            Configuração Concluída
          </CardTitle>
          <CardDescription>
            A autenticação de dois fatores foi configurada com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-amber-50">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
            <AlertTitle>Códigos de Recuperação</AlertTitle>
            <AlertDescription>
              Guarde estes códigos em um local seguro. Eles permitem acesso à sua conta caso você perca seu dispositivo autenticador.
            </AlertDescription>
          </Alert>
          
          <div className="p-3 bg-gray-50 rounded-md mb-4 font-mono text-sm">
            <div className="grid grid-cols-2 gap-2">
              {recoveryCodes.map((code, index) => (
                <div key={index} className="truncate">{code}</div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Você usará seu aplicativo autenticador para gerar códigos de verificação sempre que fizer login.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onSuccess}>
            Concluir
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (setupStarted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configurar Autenticação de Dois Fatores</CardTitle>
          <CardDescription>
            Escaneie o QR code com seu aplicativo autenticador e insira o código gerado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            {qrCodeUrl && (
              <div className="bg-white p-2 rounded-md mb-4">
                <img src={qrCodeUrl} alt="QR Code para 2FA" className="w-48 h-48" />
              </div>
            )}
            
            {secret && (
              <div className="w-full">
                <p className="text-sm font-medium mb-1">Código manual:</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded select-all break-all">
                  {secret}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium mb-1">
                Código de verificação
              </label>
              <Input
                id="verification-code"
                placeholder="Insira o código de 6 dígitos"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={verifyAndActivate} 
            disabled={loading || !verificationCode || verificationCode.length < 6}
          >
            {loading ? "Verificando..." : "Verificar e Ativar"}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Autenticação de Dois Fatores (2FA)</CardTitle>
        <CardDescription>
          Adicione uma camada extra de segurança à sua conta com autenticação de dois fatores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Por que usar 2FA?</AlertTitle>
            <AlertDescription>
              A autenticação de dois fatores adiciona uma camada extra de segurança, exigindo um código temporário 
              além da sua senha. Isso protege sua conta mesmo se sua senha for comprometida.
            </AlertDescription>
          </Alert>
          
          <div>
            <h3 className="font-medium mb-2">Como funciona</h3>
            <ol className="list-decimal ml-5 space-y-2 text-sm">
              <li>Configure um aplicativo autenticador como Google Authenticator, Microsoft Authenticator ou Authy.</li>
              <li>Escaneie o código QR com o aplicativo.</li>
              <li>Insira o código de verificação gerado pelo aplicativo.</li>
              <li>Salve os códigos de recuperação em um local seguro.</li>
            </ol>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={startSetup} disabled={loading}>
          {loading ? "Carregando..." : "Configurar 2FA"}
        </Button>
      </CardFooter>
    </Card>
  );
} 