
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const SupabaseConnectionTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Testar conexão básica
      const { data, error } = await supabase
        .from('clientes')
        .select('count(*)', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      setResult('✅ Conexão com Supabase funcionando!');
      toast({
        title: "Sucesso!",
        description: "Conexão com Supabase está funcionando corretamente"
      });
    } catch (error: any) {
      console.error('Erro de conexão:', error);
      setResult(`❌ Erro: ${error.message}`);
      toast({
        title: "Erro de Conexão",
        description: "Verifique as configurações do Supabase",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Teste de Conexão Supabase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? "Testando..." : "Testar Conexão"}
        </Button>
        
        {result && (
          <div className="p-3 rounded-md bg-gray-100 dark:bg-gray-800">
            <p className="text-sm">{result}</p>
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Não configurada'}</p>
          <p><strong>Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTest;
