
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CustomerMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

const ADMIN_PASSWORD = "agenda123"; // Simple password for protection

const Admin = () => {
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated from previous session
    const storedAuth = localStorage.getItem("adminAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
      fetchMessages();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = () => {
    setError(null);
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuthenticated", "true");
      fetchMessages();
    } else {
      setError("Senha incorreta. Tente novamente.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Mensagens dos clientes</p>
          </div>
          <Button variant="outline" onClick={isAuthenticated ? handleLogout : () => window.location.href = '/'}>
            {isAuthenticated ? "Sair" : "Voltar"}
          </Button>
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
    </div>
  );
};

export default Admin;
