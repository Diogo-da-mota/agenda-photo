
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      // Check if the password is correct (hardcoded for simplicity)
      if (password === 'agenda123') {
        // If password is correct, sign in with Supabase using predefined credentials
        const { error } = await supabase.auth.signInWithPassword({
          email: 'agenda@gmail.com',
          password: 'agenda123'
        });
        
        if (error) throw error;
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao painel administrativo",
          duration: 3000,
        });
        
        setIsLoginOpen(false);
        navigate('/admin');
      } else {
        throw new Error('Senha incorreta');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast({
        title: "Erro no login",
        description: "Senha incorreta. Por favor, tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/189280e7-f4b9-4654-acaa-45f59551c0b1.png" 
          alt="Fotógrafo profissional" 
          className="w-full h-full object-cover"
        />
        {/* Overlay to make text more visible */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Login button in top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          onClick={() => setIsLoginOpen(true)}
          variant="outline" 
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
        >
          Admin
        </Button>
      </div>
      
      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Acesso Administrativo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="login-password">Senha</Label>
              <Input 
                id="login-password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha" 
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Content overlaid on the image - centered with improved width and styling */}
      <div className="relative z-10 text-white text-center px-4 sm:px-6 max-w-xl mx-auto">
        <h2 className="text-sm sm:text-lg uppercase tracking-wider mb-2 text-blue-200">AGENDA PRO</h2>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
          A solução completa para fotógrafos profissionais
        </h1>
        <p className="text-base sm:text-xl opacity-90 mb-8 max-w-lg mx-auto leading-relaxed">
          Gerencie sua agenda, clientes, finanças e presença online em um único lugar
        </p>
        <Button 
          onClick={() => navigate('/survey')}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg sm:text-xl py-6 px-10 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          INICIAR
        </Button>
      </div>
    </div>
  );
};

export default Contact;
