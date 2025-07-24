import React, { useState, useEffect } from 'react';
import { Key, Save, Download, Trash2, Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';

// Definindo a URL da API
const API_URL = import.meta.env.VITE_AUTH_API_URL || '/api';

export const SecuritySection = () => {
  const { toast } = useToast();
  const { session, user } = useAuth();
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para 2FA
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isSetup2FAOpen, setIsSetup2FAOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionActivity, setSessionActivity] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);

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
          setIs2FAEnabled(data.enabled && data.verified);
        }
      } catch (error) {
        console.error('Erro ao verificar status 2FA:', error);
      }
    }
    
    checkStatus();
    fetchSecurityInfo();
  }, [session]);

  // Buscar informações de segurança
  const fetchSecurityInfo = async () => {
    if (!session) return;
    
    setLoading(true);
    
    try {
      // Buscar atividade de sessão
      const sessionsResponse = await fetch(`${API_URL}/auth/sessions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include'
      });
      
      if (sessionsResponse.ok) {
        const data = await sessionsResponse.json();
        setSessionActivity(data.sessions || []);
      }
      
      // Buscar alertas de segurança
      const alertsResponse = await fetch(`${API_URL}/auth/security-alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include'
      });
      
      if (alertsResponse.ok) {
        const data = await alertsResponse.json();
        setSecurityAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Erro ao buscar informações de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));
  };

  const toggleShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSavePassword = () => {
    if (password.new !== password.confirm) {
      toast({
        title: "Erro ao alterar senha",
        description: "As senhas não coincidem. Tente novamente.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso.",
    });
    
    setPassword({
      current: "",
      new: "",
      confirm: ""
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados estão sendo preparados para download.",
    });
    // Implementação real exportaria para CSV/JSON
  };

  const handleDeleteAccount = () => {
    // Aqui deveria haver uma confirmação adicional
    toast({
      title: "Conta excluída",
      description: "Sua conta foi programada para exclusão.",
      variant: "destructive"
    });
  };
  
  // Gerenciar 2FA
  const handle2FAComplete = () => {
    setIsSetup2FAOpen(false);
    setIs2FAEnabled(true);
    
    toast({
      title: "2FA Ativado",
      description: "Autenticação de dois fatores configurada com sucesso.",
    });
    
    fetchSecurityInfo();
  };
  
  const severityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* 2FA Card */}
      <Card className="border-gray-700/50 bg-gray-850/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-400" />
              <CardTitle className="text-xl text-white">Autenticação de Dois Fatores</CardTitle>
            </div>
            {is2FAEnabled && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Ativado
              </Badge>
            )}
          </div>
          <CardDescription className="text-gray-300">
            Adicione uma camada extra de segurança à sua conta exigindo um segundo fator de autenticação além da senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSetup2FAOpen ? (
            <TwoFactorSetup onSuccess={handle2FAComplete} onCancel={() => setIsSetup2FAOpen(false)} />
          ) : (
            <div className="space-y-4">
              {is2FAEnabled ? (
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Autenticação de dois fatores está ativa</AlertTitle>
                  <AlertDescription>
                    Sua conta está protegida com autenticação de dois fatores. Isso significa que além da sua senha, 
                    você precisará de um código gerado pelo seu aplicativo autenticador ao fazer login.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertTitle>Recomendação de segurança</AlertTitle>
                  <AlertDescription>
                    Recomendamos fortemente ativar a autenticação de dois fatores para proteger sua conta. 
                    Isso adiciona uma camada extra de segurança além da sua senha.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end">
                <Button 
                  variant={is2FAEnabled ? "destructive" : "default"}
                  onClick={() => setIsSetup2FAOpen(true)}
                >
                  {is2FAEnabled ? "Desativar 2FA" : "Configurar 2FA"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Password Card */}
      <Card className="border-gray-700/50 bg-gray-850/40">
        <CardHeader>
          <CardTitle className="text-xl text-white">Alteração de Senha</CardTitle>
          <CardDescription className="text-gray-300">Altere sua senha para manter sua conta segura.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password" className="text-white">Senha Atual</Label>
            <div className="relative">
              <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                id="current-password" 
                name="current" 
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Sua senha atual" 
                className="pl-9 pr-9 bg-gray-700/50 border-gray-600 text-white" 
                value={password.current}
                onChange={handlePasswordChange}
              />
              <button 
                type="button"
                className="absolute right-2.5 top-2.5 text-gray-400"
                onClick={toggleShowCurrentPassword}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password" className="text-white">Nova Senha</Label>
              <div className="relative">
                <Input 
                  id="new-password" 
                  name="new" 
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nova senha" 
                  className="pr-9 bg-gray-700/50 border-gray-600 text-white"
                  value={password.new}
                  onChange={handlePasswordChange}
                />
                <button 
                  type="button"
                  className="absolute right-2.5 top-2.5 text-gray-400"
                  onClick={toggleShowNewPassword}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="text-white">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input 
                  id="confirm-password" 
                  name="confirm" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme a nova senha" 
                  className="pr-9 bg-gray-700/50 border-gray-600 text-white"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                />
                <button 
                  type="button"
                  className="absolute right-2.5 top-2.5 text-gray-400"
                  onClick={toggleShowConfirmPassword}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSavePassword} className="bg-blue-600 hover:bg-blue-700">
              <Save size={16} className="mr-2" />
              Alterar senha
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Sessões Ativas */}
      <Card className="border-gray-700/50 bg-gray-850/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-blue-400" />
            <CardTitle className="text-xl text-white">Gerenciamento de Sessões</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Veja e gerencie dispositivos e navegadores conectados à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionActivity.length > 0 ? (
            <div className="space-y-4">
              {sessionActivity.map((session, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-800/40 rounded-md">
                  <div>
                    <p className="font-medium text-white">{session.device || 'Dispositivo desconhecido'}</p>
                    <p className="text-sm text-gray-400">
                      {session.ip_address} · {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Encerrar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">Nenhuma sessão ativa encontrada</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
            Encerrar todas as sessões
          </Button>
        </CardFooter>
      </Card>
      
      {/* Alertas de Segurança */}
      <Card className="border-gray-700/50 bg-gray-850/40">
        <CardHeader>
          <CardTitle className="text-xl text-white">Alertas de Segurança</CardTitle>
          <CardDescription className="text-gray-300">
            Notificações sobre atividades suspeitas na sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityAlerts.length > 0 ? (
            <div className="space-y-4">
              {securityAlerts.map((alert, index) => (
                <div key={index} className="p-3 bg-gray-800/40 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={severityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <p className="font-medium text-white">{alert.message}</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(alert.created_at).toLocaleDateString()} · 
                    {alert.resolved ? ' Resolvido' : ' Não resolvido'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">Nenhum alerta de segurança encontrado</p>
          )}
        </CardContent>
      </Card>
      
      {/* Gerenciamento da Conta */}
      <Card className="border-gray-700/50 bg-gray-850/40">
        <CardHeader>
          <CardTitle className="text-xl text-white">Gerenciamento da Conta</CardTitle>
          <CardDescription className="text-gray-300">Opções avançadas para sua conta e seus dados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Download size={20} className="text-blue-400" />
              <div>
                <h3 className="font-medium text-white">Baixar Dados da Conta</h3>
                <p className="text-sm text-gray-300">Exportar histórico de eventos e pagamentos</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="w-full sm:w-auto border-gray-600 text-white hover:bg-gray-700"
            >
              Exportar
            </Button>
          </div>
          
          <Separator className="bg-gray-700/50" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Trash2 size={20} className="text-red-400" />
              <div>
                <h3 className="font-medium text-red-400">Excluir Conta</h3>
                <p className="text-sm text-gray-300">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto"
            >
              Excluir conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
