
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LockIcon } from 'lucide-react';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'agenda@gmail.com',
        password,
      });

      if (error) {
        console.error('Error logging in:', error);
        toast.error('Senha inválida. Por favor tente novamente.');
        return;
      }

      toast.success('Login realizado com sucesso!');
      navigate('/admin');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro ao fazer login. Por favor tente novamente.');
    } finally {
      setLoginLoading(false);
      setLoginDialogOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.message) {
        toast.error('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      // Insert data into Supabase
      const { error } = await supabase
        .from('customer_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            message: formData.message
          }
        ]);

      if (error) {
        console.error('Error submitting form:', error);
        toast.error('Ocorreu um erro ao enviar sua mensagem. Por favor tente novamente.');
        setLoading(false);
        return;
      }

      toast.success('Mensagem enviada com sucesso!');
      navigate('/thank-you');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro ao enviar sua mensagem. Por favor tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl relative">
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLoginDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <LockIcon size={16} />
          Admin
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Entre em Contato</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Digite sua mensagem aqui"
              rows={5}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </form>
      </div>

      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acesso Administrativo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Senha</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                required
              />
              <p className="text-xs text-gray-500">
                Email: agenda@gmail.com
              </p>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loginLoading}>
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contact;
