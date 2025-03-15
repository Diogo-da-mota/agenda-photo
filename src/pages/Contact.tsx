
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('customer_messages')
        .insert([{ name, email, phone, message }]);
        
      if (error) throw error;
      
      toast({
        title: "Mensagem enviada",
        description: "Agradecemos seu contato, retornaremos em breve!",
        duration: 5000,
      });
      
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua mensagem. Por favor, tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      // Using a fixed admin email for simplicity
      const { error } = await supabase.auth.signInWithPassword({
        email: 'agenda@gmail.com',
        password: password
      });
      
      if (error) throw error;
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao painel administrativo",
        duration: 3000,
      });
      
      setIsLoginOpen(false);
      navigate('/admin');
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
    <div className="min-h-screen">
      {/* Login button in top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          onClick={() => setIsLoginOpen(true)}
          variant="outline" 
          className="bg-white/80 backdrop-blur-sm"
        >
          Admin
        </Button>
      </div>
      
      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
              <p className="text-xs text-muted-foreground">Email: agenda@gmail.com</p>
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

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <img 
            src="https://storage.alboom.ninja/sites/82835/albuns/1409267/logo-vertical-cores-e-preto.png?t=1741391284" 
            alt="Logo Agenda PRO" 
            className="h-20 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold mb-2">Entre em Contato</h1>
          <p className="text-muted-foreground">Estamos aqui para ajudar. Preencha o formulário abaixo.</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name" 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea 
                id="message" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem aqui..." 
                rows={5}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
