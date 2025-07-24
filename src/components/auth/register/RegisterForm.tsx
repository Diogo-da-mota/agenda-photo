import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ErrorAlert } from '../AuthUtils';
import FormField from './FormField';
import PasswordField from './PasswordField';
import { normalizeEmail, isValidEmailFormat } from '@/utils/authUtils';
import { securityLogger } from '@/utils/securityLogger';
import { Mail, User, Phone, Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// ++ ADICIONADO: Função de validação de senha forte
const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  
  const errors: string[] = [];
  
  if (password.length < minLength) {
    errors.push('Deve ter no mínimo 8 caracteres');
  }
  if (!hasUpperCase || !hasLowerCase) {
    errors.push('Deve conter letras maiúsculas e minúsculas');
  }
  if (!hasNumbers) {
    errors.push('Deve conter números');
  }
  if (!hasSpecialChar) {
    errors.push('Deve conter um caractere especial (!@#$%^&*)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

interface RegisterFormProps {
  onSuccess: () => void;
}

interface AuthResult {
  success: boolean;
  error?: string;
  data?: {
    user: SupabaseUser | null;
    session: any;
  };
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ++ ADICIONADO: Estado para erros específicos da senha
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { signUp, signInWithGoogle, user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Carrega o código de indicação da sessão
  useEffect(() => {
    const code = sessionStorage.getItem('referral_code');
    if (code) {
      setReferralCode(code);
      // Limpa o código da sessão para não ser usado novamente
      sessionStorage.removeItem('referral_code');
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
  };

  // Processa a indicação após o registro
  const processarIndicacao = async (userId: string) => {
    if (!referralCode) return;

    try {
      // Busca a indicação
      const { data: indicacao, error: fetchError } = await supabase
        .from('indicacoes')
        .select('*')
        .eq('codigo_referencia', referralCode)
        .single();

      if (fetchError || !indicacao) {
        console.error('Erro ao buscar indicação:', fetchError);
        return;
      }

      // Atualiza a indicação com o ID do usuário indicado
      const { error: updateError } = await supabase
        .from('indicacoes')
        .update({
          cliente_indicado_id: userId,
          status: 'pendente',
          data_indicacao: new Date().toISOString()
        })
        .eq('id', indicacao.id);

      if (updateError) {
        console.error('Erro ao atualizar indicação:', updateError);
      }
    } catch (err) {
      console.error('Erro ao processar indicação:', err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // ++ ADICIONADO: Limpar erros de senha anteriores
    setPasswordErrors([]);
    
    try {
      // Validação básica
      if (!name || !email || !password || !confirmPassword) {
        setError("Por favor, preencha todos os campos obrigatórios.");
        setIsLoading(false);
        return;
      }
      
      // ++ ADICIONADO: Nova validação de senha forte
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setError("A senha não atende aos requisitos de segurança.");
        setPasswordErrors(passwordValidation.errors);
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
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
      
      // Formatar telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      
      // Log seguro sem expor email
      securityLogger.logLoginAttempt(normalizedEmail, false, 'Tentativa de registro iniciada');
      
      // Tentativa de registro com timeout para evitar espera infinita
      const registerPromise = signUp(normalizedEmail, password, { 
        full_name: name, 
        phone: formattedPhone 
      });
      
      // Adicionar timeout de 30 segundos
      const timeoutPromise = new Promise<AuthResult>((_, reject) => {
        setTimeout(() => reject(new Error("Tempo esgotado. A operação demorou muito para responder.")), 30000);
      });
      
      // Competir entre o registro e o timeout
      const result = await Promise.race([registerPromise, timeoutPromise]);
      
      // Se chegou aqui, o registro foi bem-sucedido
      console.log("[REGISTRO] Registro concluído com sucesso");

      // Processa a indicação se houver
      if (user?.id && referralCode) {
        await processarIndicacao(user.id);
      }

      resetForm();
      onSuccess();
      
    } catch (error) {
      console.error("[REGISTRO] Erro durante registro:", error);
      
      // Determinar mensagem de erro amigável baseada no erro
      let mensagemErro = "Falha ao criar conta. Verifique suas informações ou tente novamente mais tarde.";
      
      if (error instanceof Error) {
        if (error.message.includes("timeout") || error.message.includes("Tempo esgotado")) {
          mensagemErro = "A operação demorou muito para responder. Verifique sua conexão e tente novamente.";
        } else if (error.message.includes("User already registered") || 
                   error.message.includes("already been registered") ||
                   error.message.includes("já está cadastrado") ||
                   error.message.includes("email already exists")) {
          mensagemErro = "Já existe uma conta cadastrada com este e-mail. Tente fazer login ou use outro e-mail.";
        } else if (error.message.includes("Password") || error.message.includes("senha")) {
          mensagemErro = "A senha não atende aos requisitos mínimos. Use pelo menos 6 caracteres.";
        } else if (error.message.includes("network") || error.message.includes("conexão")) {
          mensagemErro = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else {
          mensagemErro = error.message || mensagemErro;
        }
      }
      
      setError(mensagemErro);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      console.log("[REGISTRO] Iniciando registro com Google");
      const result = await signInWithGoogle('register');
      
      if (!result.success) {
        setError(result.error || "Falha no registro com Google. Tente novamente.");
      } else if (user?.id && referralCode) {
        // Processa a indicação se houver
        await processarIndicacao(user.id);
      }
    } catch (error) {
      console.error("[REGISTRO] Erro no registro com Google:", error);
      setError("Falha no registro com Google. Tente novamente.");
    }
  };

  return (
    <>
      <ErrorAlert error={error} />
      
      <form onSubmit={handleRegister} className="space-y-3">
        <FormField
          id="name"
          label="Nome"
          type="text"
          placeholder="Digite seu nome completo"
          value={name}
          onChange={setName}
          icon={<User className="h-4 w-4" />}
          required
          disabled={isLoading}
        />
        
        <FormField
          id="email"
          label="E-mail"
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={setEmail}
          icon={<Mail className="h-4 w-4" />}
          required
          disabled={isLoading}
        />
        
        <FormField
          id="phone"
          label="Celular"
          type="tel"
          placeholder="Digite seu número de celular"
          value={phone}
          onChange={setPhone}
          icon={<Phone className="h-4 w-4" />}
          required
          disabled={isLoading}
        />
        
        <PasswordField
          id="password"
          label="Senha"
          placeholder="Crie uma senha (mín. 6 caracteres)"
          value={password}
          onChange={setPassword}
          showPassword={showPassword}
          toggleVisibility={togglePasswordVisibility}
          required
          disabled={isLoading}
        />

        {/* ++ ADICIONADO: Exibição dos erros de senha */}
        {passwordErrors.length > 0 && (
          <ul className="mt-1 list-disc list-inside text-xs text-red-500 pl-2">
            {passwordErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        )}
        
        <PasswordField
          id="confirmPassword"
          label="Confirmar Senha"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChange={setConfirmPassword}
          showPassword={showConfirmPassword}
          toggleVisibility={toggleConfirmPasswordVisibility}
          required
          disabled={isLoading}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-full shadow-md h-10 text-sm font-medium transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando conta...
            </span>
          ) : (
            "Criar Conta"
          )}
        </Button>
      </form>

      {/* Divisor */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou inscreva-se com
          </span>
        </div>
      </div>

      {/* Botão do Google */}
      <Button 
        type="button"
        variant="outline" 
        className="w-full rounded-full border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 h-10 transition-all duration-200 font-medium"
        onClick={handleGoogleRegister}
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
          <path fill="none" d="M1 1h22v22H1z" />
        </svg>
        Google
      </Button>
    </>
  );
};

export default RegisterForm;
