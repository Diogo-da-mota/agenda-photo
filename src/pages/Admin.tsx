
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, RefreshCcw, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface CustomerMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

interface Message {
  id: number | string;
  user_id: string;
  content: string;
  created_at: string;
}

const ADMIN_PASSWORD = "agenda123"; // Simple password for protection

const Admin = () => {
  const [customerMessages, setCustomerMessages] = useState<CustomerMessage[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tablesExist, setTablesExist] = useState({
    customerMessages: false,
    messages: false
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated from previous session
    const storedAuth = localStorage.getItem("adminAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
      checkTables();
    } else {
      setIsLoading(false);
    }

    return () => {
      // Cleanup function to remove subscription when component unmounts
      const cleanup = async () => {
        // Fix: removeAllChannels returns an array of statuses, not an object with error property
        const statuses = await supabase.removeAllChannels();
        if (statuses.includes('error')) {
          console.error('Erro ao remover canais:', statuses);
        }
      };
      
      if (isAuthenticated) {
        cleanup();
      }
    };
  }, []);

  useEffect(() => {
    // Only set up realtime subscription if authenticated
    if (isAuthenticated) {
      // Set up realtime subscription to messages table
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('Nova mensagem recebida:', payload);
            const newMessage = payload.new as Message;
            setMessages(prevMessages => [newMessage, ...prevMessages]);
            toast({
              title: "Nova mensagem recebida",
              description: `Nova mensagem: ${newMessage.content.substring(0, 30)}${newMessage.content.length > 30 ? '...' : ''}`,
            });
          }
        )
        .subscribe((status) => {
          console.log('Status da inscrição em messages:', status);
        });

      // Set up realtime subscription to customer_messages table
      const customerChannel = supabase
        .channel('customer-messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'customer_messages'
          },
          (payload) => {
            console.log('Nova mensagem de cliente recebida:', payload);
            const newMessage = payload.new as CustomerMessage;
            setCustomerMessages(prevMessages => [newMessage, ...prevMessages]);
            toast({
              title: "Nova mensagem de cliente recebida",
              description: `Nova mensagem de ${newMessage.name}`,
            });
          }
        )
        .subscribe((status) => {
          console.log('Status da inscrição em customer_messages:', status);
        });

      // Cleanup function
      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(customerChannel);
      };
    }
  }, [isAuthenticated, toast]);

  const checkTables = async () => {
    setIsLoading(true);
    try {
      console.log('Verificando tabelas...');
      
      // Verificar tabela customer_messages tentando buscar dados diretamente
      const { data: customerData, error: customerError } = await supabase
        .from('customer_messages')
        .select('*')
        .limit(1);
      
      console.log('Verificação de customer_messages:', { customerData, customerError });
      
      if (!customerError) {
        console.log('Tabela customer_messages existe e está acessível');
        setTablesExist(prev => ({ ...prev, customerMessages: true }));
        fetchCustomerMessages();
      } else {
        console.error('Erro ao acessar customer_messages:', customerError);
        setTablesExist(prev => ({ ...prev, customerMessages: false }));
      }

      // Verificar tabela messages tentando buscar dados diretamente
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .limit(1);
      
      console.log('Verificação de messages:', { messagesData, messagesError });
      
      if (!messagesError) {
        console.log('Tabela messages existe e está acessível');
        setTablesExist(prev => ({ ...prev, messages: true }));
        fetchMessages();
      } else {
        console.error('Erro ao acessar messages:', messagesError);
        setTablesExist(prev => ({ ...prev, messages: false }));
      }
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar tabelas no Supabase",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setError(null);
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuthenticated", "true");
      checkTables();
    } else {
      setError("Senha incorreta. Tente novamente.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
  };

  const fetchCustomerMessages = async () => {
    try {
      console.log('Buscando mensagens de clientes...');
      const { data, error } = await supabase
        .from('customer_messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log('Mensagens de clientes recebidas:', data);
      setCustomerMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens de clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens dos clientes",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async () => {
    try {
      console.log('Buscando mensagens...');
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log('Mensagens recebidas:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
    }
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      tablesExist.customerMessages ? fetchCustomerMessages() : Promise.resolve(),
      tablesExist.messages ? fetchMessages() : Promise.resolve()
    ]).finally(() => {
      setIsRefreshing(false);
      toast({
        title: "Atualizado",
        description: "As mensagens foram atualizadas com sucesso"
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Mensagens dos clientes</p>
          </div>
          <div className="flex gap-2">
            {isAuthenticated && (
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                {isRefreshing ? "Atualizando..." : "Atualizar"}
              </Button>
            )}
            <Button variant="outline" onClick={isAuthenticated ? handleLogout : () => window.location.href = '/'}>
              {isAuthenticated ? "Sair" : "Voltar"}
            </Button>
          </div>
        </div>
        
        {!isAuthenticated ? (
          <Card className="max-w-md mx-auto my-8">
            <CardHeader>
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Digite a senha para acessar as mensagens dos clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha de administrador"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Acessar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando mensagens...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Customer Messages Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Mensagens dos Clientes</h2>
              {!tablesExist.customerMessages ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        A tabela de mensagens de clientes não foi encontrada no Supabase.
                      </AlertDescription>
                    </Alert>
                    <Button onClick={checkTables}>Verificar novamente</Button>
                  </CardContent>
                </Card>
              ) : customerMessages.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p>Nenhuma mensagem de cliente encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {customerMessages.map((message) => (
                    <Card key={message.id}>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div>
                            <CardTitle>{message.name}</CardTitle>
                            <CardDescription>{message.email}</CardDescription>
                          </div>
                          <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
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
            
            {/* Messages Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Mensagens em Tempo Real</h2>
              {!tablesExist.messages ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        A tabela de mensagens em tempo real não foi encontrada no Supabase.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              ) : messages.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p>Nenhuma mensagem em tempo real encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Usuário ID</TableHead>
                          <TableHead>Conteúdo</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((message) => (
                          <TableRow key={message.id}>
                            <TableCell className="font-medium">{message.id}</TableCell>
                            <TableCell>{message.user_id}</TableCell>
                            <TableCell>{message.content}</TableCell>
                            <TableCell>{formatDate(message.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
