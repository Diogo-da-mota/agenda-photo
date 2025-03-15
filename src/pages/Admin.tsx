
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomerMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

const Admin = () => {
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para acessar esta página",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      
      fetchMessages();
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/');
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie as mensagens dos seus clientes</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p>Carregando mensagens...</p>
          </div>
        ) : messages.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p>Nenhuma mensagem encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{message.name}</CardTitle>
                      <CardDescription>{message.email}</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {message.phone && (
                      <div>
                        <h4 className="font-medium">Telefone:</h4>
                        <p>{message.phone}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">Mensagem:</h4>
                      <p className="whitespace-pre-line">{message.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
