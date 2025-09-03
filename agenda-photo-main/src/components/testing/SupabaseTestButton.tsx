
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SupabaseTestButton = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  const handleTestInsertion = async () => {
    // Reset logs
    setLogs([]);

    if (!user) {
      const errorLog = "❌ Usuário não autenticado. Não é possível salvar.";
      setLogs([errorLog]);
      toast({
        title: "Erro: Usuário não autenticado",
        description: errorLog,
        variant: "destructive"
      });
      return;
    }

    try {
      // Use direct supabase call to check functionality with existing table
      const { error } = await supabase
        .from('clientes')
        .insert({
          nome: "Teste Lovable",
          email: "teste@lovable.com",
          telefone: "11999999999",
          empresa: "Empresa Teste",
          user_id: user.id
        });

      if (error) throw error;

      const successLog = "✅ Dados inseridos na tabela `clientes` com sucesso.";
      setLogs([successLog]);
      
    } catch (error) {
      const errorLog = `❌ Supabase retornou erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      console.error('Erro ao inserir dados:', error);
      setLogs([errorLog]);
      toast({
        title: "❌ Erro ao salvar",
        description: errorLog,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleTestInsertion} className="gap-2">
        🧪 Testar salvamento no Supabase
      </Button>
      
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧾 Relatório do Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.map((linha, index) => (
                <div key={index} className="text-sm">
                  {linha}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupabaseTestButton;
