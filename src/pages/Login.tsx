
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/admin');
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
        duration: 3000,
      });
      
      navigate('/admin');
    } catch (error) {
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
            <h1 className="text-3xl md:text-4xl font-display font-medium">Área administrativa</h1>
            <p className="text-sm md:text-base opacity-80 mt-2">Entre para acessar as respostas da pesquisa</p>
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
            <h2 className="text-2xl font-medium">Área Administrativa</h2>
            <p className="text-muted-foreground mt-2">Entre para ver as respostas da pesquisa</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  className="input-focus h-12 pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="input-focus h-12 pl-10"
                  required
                />
              </div>
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

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              <a href="/survey" className="text-primary font-medium hover:underline">
                Ir para o formulário de pesquisa
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
