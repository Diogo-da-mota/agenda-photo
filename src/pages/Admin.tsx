
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

type CustomerMessage = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error('Você precisa estar logado para acessar esta página');
        navigate('/');
      } else {
        fetchMessages();
      }
    };

    checkSession();
  }, [navigate]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Erro ao carregar mensagens');
        return;
      }

      setMessages(data as CustomerMessage[]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro ao carregar as mensagens');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <Button variant="outline" onClick={handleLogout}>
          Sair
        </Button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Mensagens Recebidas ({messages.length})</h2>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Nenhuma mensagem recebida ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{message.name}</CardTitle>
                  <div className="text-sm text-gray-500">
                    {new Date(message.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="text-sm text-gray-600">{message.email}</div>
                {message.phone && (
                  <div className="text-sm text-gray-600">{message.phone}</div>
                )}
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <p className="whitespace-pre-wrap">{message.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
