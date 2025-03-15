
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Facebook, Info, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState('agenda@gmail.com');
  const [password, setPassword] = useState('agenda123');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check and create default user if needed
  const checkAndCreateUser = async (email: string, password: string) => {
    try {
      // Try to sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // If user doesn't exist, create it
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        console.log('User does not exist, creating account...');
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'user'
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        // Try signing in again after creating the account
        const { error: finalSignInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (finalSignInError) {
          throw finalSignInError;
        }

        toast({
          title: "Conta criada e conectada",
          description: "Sua conta foi criada e você foi conectado automaticamente.",
          duration: 3000,
        });
      } else if (signInError) {
        // If there's a different error, throw it
        throw signInError;
      }

      return true;
    } catch (error) {
      console.error('Error in checkAndCreateUser:', error);
      throw error;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setIsLoading(true);
    
    try {
      // Validate inputs
      if (!email) {
        setValidationError("O e-mail é obrigatório");
        throw new Error("O e-mail é obrigatório");
      }
      if (!password) {
        setValidationError("A senha é obrigatória");
        throw new Error("A senha é obrigatória");
      }
      
      // Check if user exists, create if not, and then sign in
      await checkAndCreateUser(email, password);
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
        duration: 3000,
      });
      
      navigate('/survey');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante o login",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-white to-gray-100">
      {/* Image Section */}
      <div className="md:w-1/2 relative overflow-hidden hidden md:block">
        <img 
          src="https://www.javigonzalez.com/wp-content/uploads/2023/02/a-professional-photographer-using-a-big-DSLR-feeling-threatened-by-an-evil-computer-photorealistic-dark-mood-low-key-orange-light-with-a-blue-cut-light-v-4.png" 
          alt="Fotógrafo profissional" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-12">
          <div className="text-white space-y-2 max-w-xl animate-fade-in">
            <p className="text-sm uppercase tracking-wider mb-1 opacity-80">AGENDA PRO</p>
            <h1 className="text-3xl md:text-4xl font-display font-medium">A solução completa para fotógrafos profissionais</h1>
            <p className="text-sm md:text-base opacity-80 mt-2">Gerencie sua agenda, clientes, finanças e presença online em um único lugar</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="md:w-1/2 flex flex-col justify-center items-center p-6 md:p-16 animate-slide-up">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="https://storage.alboom.ninja/sites/82835/albuns/1409267/logo-vertical-cores-e-preto.png?t=1741391284" 
              alt="Logo Agenda PRO" 
              className="h-20 mx-auto mb-6 animate-fade-in"
            />
            <h2 className="text-2xl font-medium">Bem-vindo à Agenda PRO</h2>
            <p className="text-muted-foreground mt-2">Entre para acessar sua conta</p>
          </div>
          
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-700">
              Utilize o email <strong>agenda@gmail.com</strong> e senha <strong>agenda123</strong> para acessar o sistema.
            </AlertDescription>
          </Alert>

          {validationError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com" 
                className="input-focus h-12"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-sm text-primary/80 hover:text-primary transition-colors">
                  Esqueceu?
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="input-focus h-12"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-black hover:bg-black/90 button-hover flex items-center justify-center gap-2 group"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">ou continue com</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                className="h-12 button-hover flex items-center justify-center gap-2"
                onClick={() => {
                  toast({
                    title: "Login com Google",
                    description: "Esta funcionalidade estará disponível em breve.",
                    duration: 3000,
                  });
                }}
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262">
                  <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                  <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                  <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path>
                  <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                </svg>
                Continuar com Google
              </Button>
              
              <Button 
                variant="outline" 
                className="h-12 button-hover flex items-center justify-center gap-2"
                onClick={() => {
                  toast({
                    title: "Login com Facebook",
                    description: "Esta funcionalidade estará disponível em breve.",
                    duration: 3000,
                  });
                }}
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                Continuar com Facebook
              </Button>
            </div>
          </div>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            Não tem uma conta? <a href="#" className="text-primary font-medium hover:underline">Inscreva-se agora</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
