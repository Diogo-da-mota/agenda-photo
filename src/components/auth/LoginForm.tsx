import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Facebook, LockKeyhole, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { isValidEmailFormat, normalizeEmail } from '@/utils/authUtils';
import DOMPurify from 'dompurify';
import { TwoFactorAuthForm } from './TwoFactorAuthForm';

// Definindo a URL da API
const API_URL = import.meta.env.VITE_AUTH_API_URL || '/api';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Estados para 2FA
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [userData, setUserData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitizar entrada
    const sanitizedEmail = DOMPurify.sanitize(email.trim());
    
    // Validar entrada
    if (!sanitizedEmail || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidEmailFormat(sanitizedEmail)) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, informe um e-mail válido",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Normalizar email antes de enviar
      const normalizedEmail = normalizeEmail(sanitizedEmail);
      
      // Verificar se o servidor de autenticação está configurado
      if (API_URL && API_URL !== '/api') {
        // Usar o servidor de autenticação personalizado com suporte a 2FA
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password
          }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Credenciais inválidas');
        }
        
        const data = await response.json();
        
        // Verificar se requer 2FA
        if (data.requires2FA) {
          setRequires2FA(true);
          setTempToken(data.tempToken);
          setUserData(data.user);
          setIsLoading(false);
          return;
        }
        
        // Login bem-sucedido sem 2FA

        navigate('/dashboard');
      } else {
        // Fallback para autenticação direta com Supabase (sem 2FA)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });
        
        if (error) {
          throw new Error(error.message);
        }

        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error.message);
      toast({
        title: "Falha no login",
        description: error.message || "Credenciais inválidas. Verifique seu e-mail e senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        throw error;
      }
      
    } catch (error) {
      console.error(`Erro no login com ${provider}:`, error);
      toast({
        title: `Erro no login com ${provider}`,
        description: "Não foi possível realizar o login social. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };
  
  // Manipular o resultado bem-sucedido da validação 2FA
  const handle2FASuccess = (userData: any) => {

    navigate('/dashboard');
  };
  
  // Cancelar validação 2FA e voltar para tela de login
  const handle2FACancel = () => {
    setRequires2FA(false);
    setTempToken('');
    setUserData(null);
  };

  // Renderizar formulário de 2FA se necessário
  if (requires2FA && tempToken && userData?.email) {
    return (
      <TwoFactorAuthForm
        email={userData.email}
        tempToken={tempToken}
        onSuccess={handle2FASuccess}
        onCancel={handle2FACancel}
      />
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-200">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              className="pl-10 bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-200">Senha</Label>
            <Link 
              to="/esqueci-senha" 
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#111827] px-2 text-gray-400">ou continue com</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
          onClick={() => handleSocialLogin('google')}
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
