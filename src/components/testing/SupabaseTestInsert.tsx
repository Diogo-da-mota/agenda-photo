
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SupabaseTestInsert = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  const handleTestInsertion = async () => {
    // Reset logs
    setLogs([]);

    if (!user) {
      toast({
        title: "Usuário não autenticado.",
        variant: "destructive"
      });
      setLogs(["❌ Falha: Usuário não autenticado."]);
      return;
    }

    try {
      const { error } = await supabase
        .from('clientes')
        .insert({
          nome: "Teste Final",
          email: "teste@lovable.com",
          telefone: "11999999999",
          empresa: "Empresa Final",
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "✅ Salvamento realizado com sucesso."
      });
      setLogs(["✅ Dados inseridos com sucesso."]);
    } catch (error) {
      toast({
        title: "❌ Supabase retornou erro.",
        variant: "destructive"
      });
      setLogs([`❌ Erro completo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleTestInsertion} className="gap-2">
        🧪 Testar Insert com Log
      </Button>
      
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Relatório de Resposta do Supabase
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

export default SupabaseTestInsert;
