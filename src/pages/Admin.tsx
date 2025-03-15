
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, RefreshCcw } from "lucide-react";
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
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const ADMIN_PASSWORD = "agenda123"; // Simple password for protection

const Admin = () => {
  const [customerMessages, setCustomerMessages] = useState<CustomerMessage[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        const { error } = await supabase.removeAllChannels();
        if (error) console.error('Error removing channels:', error);
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
            console.log('New message received:', payload);
            const newMessage = payload.new as Message;
            setMessages(prevMessages => [...prevMessages, newMessage]);
            toast({
              title: "Nova mensagem recebida",
              description: "Uma nova mensagem foi adicionada",
            });
          }
        )
        .subscribe();

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
            console.log('New customer message received:', payload);
            const newMessage = payload.new as CustomerMessage;
            setCustomerMessages(prevMessages => [newMessage, ...prevMessages]);
            toast({
              title: "Nova mensagem de cliente recebida",
              description: `Nova mensagem de ${newMessage.name}`,
            });
          }
        )
        .subscribe();

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
      console.log('Checking if tables exist...');
      // Check if customer_messages table exists by querying it
      const { data: customerData, error: customerError } = await supabase
        .from('customer_messages')
        .select('count(*)', { count: 'exact', head: true });

      console.log('Customer messages table check:', { customerData, customerError });
      
      // If no error, table exists
      if (!customerError) {
        setTablesExist(prev => ({ ...prev, customerMessages: true }));
        fetchCustomerMessages();
      } else {
        console.log('customer_messages table error:', customerError);
        setTablesExist(prev => ({ ...prev, customerMessages: false }));
      }

      // Check if messages table exists
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('count(*)', { count: 'exact', head: true });
      
      console.log('Messages table check:', { messagesData, messagesError });

      // If no error, table exists
      if (!messagesError) {
        setTablesExist(prev => ({ ...prev, messages: true }));
        fetchMessages();
      } else {
        console.log('messages table error:', messagesError);
        setTablesExist(prev => ({ ...prev, messages: false }));
      }
    } catch (error) {
      console.error('Error checking tables:', error);
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
      console.log('Fetching customer messages...');
      const { data, error } = await supabase
        .from('customer_messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log('Customer messages fetched:', data);
      setCustomerMessages(data || []);
    } catch (error) {
      console.error('Error fetching customer messages:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens dos clientes",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages...');
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log('Messages fetched:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
    checkTables();
    toast({
      title: "Atualizando",
      description: "Buscando novas mensagens..."
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
                className="flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Atualizar
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
          <div className="text-center py-12">
            <p>Carregando mensagens...</p>
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
            
            {/* New Messages Section */}
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
                          <TableHead>Usuário ID</TableHead>
                          <TableHead>Conteúdo</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((message) => (
                          <TableRow key={message.id}>
                            <TableCell className="font-medium">{message.user_id}</TableCell>
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
