import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ExtendedClientForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState('');

  const salvarClienteCompleto = async () => {
    if (!user) {
      const errorMsg = "Usuário não autenticado.";
      // console.error(errorMsg); // Removido para produção
      setLog(`❌ Falha: ${errorMsg}`);
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    // console.log("Usuário autenticado:", user.id); // Removido para produção
    setLog(`🔍 Usuário autenticado: ${user.id}`);

    if (!nome || !email) {
      const errorMsg = "Preencha nome e email.";
      // console.error(errorMsg); // Removido para produção
      setLog(`❌ Falha: ${errorMsg}`);
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setLog("");
    
    const clienteData = {
      nome,
      email,
      telefone: telefone || null,
      empresa: empresa || null,
      user_id: user.id
    };
    
    // console.log("Tentando salvar cliente:", clienteData); // Removido para produção
    setLog(`🔄 Enviando dados: ${JSON.stringify(clienteData, null, 2)}`);
    
    try {
      // First check Supabase connection
      setLog(prev => `${prev}\n🔄 Verificando conexão com Supabase...`);
      
      // Using direct supabase client
      const { error: pingError } = await supabase
        .from('clientes')
        .select('count')
        .limit(1);
      
      if (pingError) {
        setLog(prev => `${prev}\n❌ Erro na conexão: ${pingError.message}`);
        throw new Error(`Conexão falhou: ${pingError.message}`);
      }
      
      setLog(prev => `${prev}\n✅ Conexão com Supabase estabelecida`);
      
      // Check if the table exists
      setLog(prev => `${prev}\n🔍 Verificando se a tabela clientes existe...`);
      
      // Using direct supabase client
      const { data: tableCheck, error: tableError } = await supabase
        .from('clientes')
        .select()
        .limit(1);
        
      if (tableError) {
        setLog(prev => `${prev}\n❌ Erro ao verificar tabela: ${tableError.message} (${tableError.code})`);
        throw new Error(`Erro ao verificar tabela: ${tableError.message}`);
      }
      
      setLog(prev => `${prev}\n✅ Tabela clientes existe e está acessível`);
      
      // Now try to fetch current user's clients to check RLS
      setLog(prev => `${prev}\n🔍 Verificando permissões de acesso (RLS)...`);
      
      // Using direct supabase client
      const { data: clients, error: clientsError } = await supabase
        .from('clientes')
        .select('id, nome')
        .limit(5);
      
      if (clientsError) {
        setLog(prev => `${prev}\n⚠️ Aviso ao verificar permissões: ${clientsError.message}`);
      } else {
        const clientCount = Array.isArray(clients) ? clients.length : 0;
        setLog(prev => `${prev}\n✅ Acesso a tabela confirmado. Clientes existentes: ${clientCount}`);
      }
      
      // Now attempt to insert the data
      setLog(prev => `${prev}\n🔄 Inserindo novo cliente...`);
      
      // For detailed diagnostic information, use direct Supabase call
      const { data, error, status, statusText } = await supabase
        .from('clientes')
        .insert(clienteData)
        .select();

      setLog(prev => `${prev}\n📊 Status da resposta: ${status} ${statusText || ''}`);

      if (error) {
        // console.error("Erro ao salvar no Supabase:", error); // Removido para produção
        setLog(prev => `${prev}\n❌ Erro na inserção: ${error.message} (${error.code})`);
        throw error;
      }

      setLog(prev => `${prev}\n✅ Cliente salvo com sucesso!`);
      if (data) {
        setLog(prev => `${prev}\n📄 Dados retornados: ${JSON.stringify(data, null, 2)}`);
      }

      // Reset form
      setNome('');
      setEmail('');
      setTelefone('');
      setEmpresa('');
    } catch (error) {
      // console.error("Erro detalhado:", error); // Removido para produção
      
      toast({
        title: "Erro",
        description: "Erro ao salvar. Veja os detalhes abaixo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Formulário Completo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium mb-1">Nome</label>
            <Input 
              id="nome"
              value={nome} 
              onChange={e => setNome(e.target.value)}
              placeholder="Nome"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input 
              id="email"
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium mb-1">Telefone</label>
            <Input 
              id="telefone"
              value={telefone} 
              onChange={e => setTelefone(e.target.value)}
              placeholder="Telefone"
            />
          </div>
          
          <div>
            <label htmlFor="empresa" className="block text-sm font-medium mb-1">Empresa</label>
            <Input 
              id="empresa"
              value={empresa} 
              onChange={e => setEmpresa(e.target.value)}
              placeholder="Empresa"
            />
          </div>
          
          <Button
            onClick={salvarClienteCompleto}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar cliente completo'
            )}
          </Button>
          
          {log && (
            <Card className="mt-4 bg-gray-50 border-amber-200">
              <CardContent className="pt-4">
                <div className="text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Log detalhado de operação:
                </div>
                <pre className="text-xs overflow-auto p-2 whitespace-pre-wrap bg-black text-white rounded max-h-80">
                  {log}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtendedClientForm;
