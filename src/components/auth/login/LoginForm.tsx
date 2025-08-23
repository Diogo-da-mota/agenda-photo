import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ErrorAlert } from '../AuthUtils';
import FormField from './FormField';
import PasswordField from './PasswordField';
import { normalizeEmail, isValidEmailFormat } from '@/utils/authUtils';
import { isBlocked as checkIfBlocked, recordFailedLogin, recordSuccessfulLogin, detectSuspiciousActivity } from '@/utils/authSecurity';
import { useCSRF } from '@/components/security/CSRFProtection';
import { securityLogger } from '@/utils/securityLogger';
import { saveCredentials, loadCredentials, clearCredentials } from '@/utils/rememberMe';
import { Mail, Shield } from "lucide-react";

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [rememberMe, setRememberMe] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const { toast } = useToast();
  const { signIn, signInWithGoogle, session } = useAuth();
  const { validateToken } = useCSRF();
  const navigate = useNavigate();
  const location = useLocation();



  // Carregar credenciais salvas e tentar auto-login
  useEffect(() => {
    const attemptAutoLogin = async () => {
      // Só tentar auto-login se não há sessão ativa e ainda não foi tentado
      if (autoLoginAttempted || session) return;
      
      // Verificar se signIn está disponível
      if (!signIn) {
        console.log('[REMEMBER_ME] signIn não está disponível ainda, aguardando...');
        return;
      }
      
      const savedCredentials = loadCredentials();
      if (savedCredentials) {
        // Credenciais encontradas, tentando auto-login - logs removidos para produção
        setEmail(savedCredentials.email);
        setPassword(savedCredentials.password);
        setRememberMe(true);
        setAutoLoginAttempted(true);
        
        // Tentar login automático
        try {
          setIsLoading(true);
          const result = await signIn(savedCredentials.email, savedCredentials.password);
          
          if (result.success) {
            // Auto-login bem-sucedido - logs removidos para produção
            toast({
              title: "Login automático realizado",
              description: "Bem-vindo de volta!",
            });
          } else {
            // Auto-login falhou, limpando credenciais salvas - logs removidos para produção
            clearCredentials();
            setPassword(''); // Limpar senha do formulário por segurança
          }
        } catch (error) {
          // Erro no auto-login - logs removidos para produção
          clearCredentials();
          setPassword('');
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('[REMEMBER_ME] Nenhuma credencial salva encontrada');
        setAutoLoginAttempted(true);
      }
    };
    
    attemptAutoLogin();
  }, [signIn, session, autoLoginAttempted, toast]);

  // Monitorar mudanças na sessão para redirecionar após login bem-sucedido
  useEffect(() => {
    if (session) {
      // Sessão detectada, redirecionando para o dashboard - logs removidos para produção
      
      toast({
        title: "Login realizado com sucesso",
        description: "Redirecionando...",
      });
      
      setTimeout(() => {
        navigate('/dashboard');
        onSuccess();
      }, 500);
    }
  }, [session, navigate, location.search, onSuccess, toast]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validação básica
      if (!email || !password) {
        setError("Por favor, preencha todos os campos.");
        setIsLoading(false);
        return;
      }

      // Validar formato do email
      if (!isValidEmailFormat(email)) {
        setError("Por favor, insira um e-mail válido.");
        setIsLoading(false);
        return;
      }
      
      // Normalizar email
      const normalizedEmail = normalizeEmail(email);
      
      // Verificar se está bloqueado por tentativas excessivas
      if (checkIfBlocked(normalizedEmail)) {
        setError("Muitas tentativas de login. Aguarde 15 minutos antes de tentar novamente.");
        setIsBlocked(true);
        setIsLoading(false);
        return;
      }
      
      // Detectar atividade suspeita
      if (detectSuspiciousActivity(normalizedEmail, navigator.userAgent)) {
        setError("Atividade suspeita detectada. Tente novamente mais tarde.");
        setIsLoading(false);
        return;
      }
      
      // Log seguro sem expor email
      securityLogger.logLoginAttempt(normalizedEmail, false, 'Tentativa de login iniciada');
      
      // Login direto com Supabase
      const result = await signIn(normalizedEmail, password);
      
      // Log do resultado sem dados sensíveis
      securityLogger.logLoginAttempt(normalizedEmail, result.success, result.error);
      
      if (!result.success) {
        // Login falhou - logs removidos para produção
        
        // Registrar tentativa falhada
        recordFailedLogin(normalizedEmail);
        
        // Melhorar mensagens de erro baseadas no erro retornado
        let errorMessage = result.error || "Falha na autenticação. Verifique suas credenciais.";
        
        if (result.error?.includes('Invalid login credentials')) {
          errorMessage = "E-mail ou senha incorretos. Verifique suas credenciais ou crie uma nova conta se ainda não possui uma.";
        } else if (result.error?.includes('Email not confirmed')) {
          errorMessage = "E-mail não confirmado. Verifique sua caixa de entrada e confirme seu e-mail.";
        } else if (result.error?.includes('Too many requests')) {
          errorMessage = "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.";
        } else if (result.error?.includes('User not found')) {
          errorMessage = "Não existe uma conta cadastrada com este e-mail. Verifique o e-mail ou crie uma nova conta.";
        }
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }
      
      // Registrar login bem-sucedido
      recordSuccessfulLogin(normalizedEmail);
      
      // Salvar credenciais se "Lembrar de mim" estiver marcado
      if (rememberMe) {
        // Salvando credenciais para próximo login - logs removidos para produção
        saveCredentials(normalizedEmail, password);
      } else {
        // Limpar credenciais salvas se "Lembrar de mim" não estiver marcado
        clearCredentials();
      }
      
      // Login bem-sucedido, aguardando sessão - logs removidos para produção
      // O redirecionamento será tratado pelo useEffect que monitora a sessão
      
    } catch (error) {
      // Exceção durante login - logs removidos para produção
      if (error instanceof Error) {
        setError(error.message || "Falha na autenticação. Verifique suas credenciais.");
      } else {
        setError("Falha na autenticação. Verifique suas credenciais.");
      }
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Iniciando login com Google - logs removidos para produção
      const result = await signInWithGoogle('login');
      
      if (!result.success) {
        setError(result.error || "Falha no login com Google. Tente novamente.");
      }
    } catch (error) {
      // Erro no login com Google - logs removidos para produção
      setError("Falha no login com Google. Tente novamente.");
    }
  };



  return (
    <>
      <ErrorAlert error={error} />
      
      {isBlocked && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          <Shield className="h-4 w-4" />
          <span>Conta temporariamente bloqueada por segurança</span>
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-3">
        <FormField
          id="email"
          label="E-mail"
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={setEmail}
          icon={<Mail className="h-4 w-4" />}
          required
        />
        
        <PasswordField
          id="password"
          label="Senha"
          placeholder="Digite sua senha"
          value={password}
          onChange={setPassword}
          showPassword={showPassword}
          toggleVisibility={togglePasswordVisibility}
          required
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="text-xs text-gray-600 cursor-pointer">
              Lembrar de mim
            </label>
          </div>
          <Link to="/reset-password" className="text-xs text-gray-500 hover:text-blue-600 hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-full shadow-md h-10 text-sm font-medium transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      {/* Divisor */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou continue com
          </span>
        </div>
      </div>

      {/* Botão do Google */}
      <Button 
        type="button"
        variant="outline" 
        className="w-full rounded-full border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 h-10 transition-all duration-200 font-medium"
        onClick={handleGoogleLogin}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continuar com Google
      </Button>
    </>
  );
};

export default LoginForm;
