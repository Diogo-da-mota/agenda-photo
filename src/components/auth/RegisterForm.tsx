import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Facebook, LockKeyhole, Mail, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { isValidEmailFormat, normalizeEmail } from '@/utils/authUtils';
import DOMPurify from 'dompurify';

// Schema de validação para o formulário
const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().email("E-mail inválido").max(254),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").max(100),
});

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    try {
      // Sanitizar entrada
      const sanitizedName = DOMPurify.sanitize(name.trim());
      const sanitizedEmail = DOMPurify.sanitize(email.trim());
      
      // Validar com Zod
      registerSchema.parse({
        name: sanitizedName,
        email: sanitizedEmail,
        password,
      });
      
      return {
        isValid: true,
        sanitizedData: {
          name: sanitizedName,
          email: sanitizedEmail,
          password,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return { isValid: false, sanitizedData: null };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validation = validateForm();
    if (!validation.isValid || !validation.sanitizedData) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      });
      return;
    }
    
    const { name: sanitizedName, email: sanitizedEmail, password } = validation.sanitizedData;
    
    setIsLoading(true);
    
    try {
      // Normalizar email antes de enviar
      const normalizedEmail = normalizeEmail(sanitizedEmail);
      
      // Registro real com Supabase
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: sanitizedName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('Erro no registro:', error.message);
        
        if (error.message.includes('email') || error.message.includes('Email')) {
          toast({
            title: "E-mail inválido ou já utilizado",
            description: "Por favor, verifique seu e-mail ou tente fazer login se já possui uma conta.",
            variant: "destructive",
          });
        } else if (error.message.includes('password') || error.message.includes('Password')) {
          toast({
            title: "Senha inválida",
            description: "A senha deve ter pelo menos 8 caracteres.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no registro",
            description: error.message,
            variant: "destructive",
          });
        }
        
        setIsLoading(false);
        return;
      }
      
      // Criar registro na tabela usuarios (após autenticação bem-sucedida)
      if (data.user) {
        // Inserir perfil usando metadados de usuário ao invés de inserção direta
        // Isso é mais seguro e usa as APIs oficiais do Supabase
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: sanitizedName,
            avatar_url: null
          }
        });
          
        if (updateError) {
          console.error('Erro ao atualizar perfil de usuário:', updateError);
        }
      }
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu e-mail para confirmar seu cadastro.",
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro no servidor",
        description: "Não foi possível processar seu cadastro. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = async (provider: 'google' | 'facebook' | 'apple') => {
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
      console.error(`Erro no cadastro com ${provider}:`, error);
      toast({
        title: `Erro no cadastro com ${provider}`,
        description: "Não foi possível realizar o cadastro social. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-200">Nome Completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder="Digite seu nome completo"
              className="pl-10 bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>
        </div>
        
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
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-200">Senha</Label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Crie sua senha"
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
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Mínimo de 8 caracteres
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox id="terms" className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" required />
          <Label 
            htmlFor="terms" 
            className="text-sm text-gray-300 leading-tight"
          >
            Concordo com os{" "}
            <Link to="/termos" className="text-blue-400 hover:text-blue-300 hover:underline">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link to="/privacidade" className="text-blue-400 hover:text-blue-300 hover:underline">
              Política de Privacidade
            </Link>
          </Label>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white mt-2"
        >
          {isLoading ? "Criando conta..." : "Criar conta"}
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
          onClick={() => handleSocialRegister('google')}
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

export default RegisterForm;
