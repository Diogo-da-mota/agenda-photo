
import React from 'react';
import TestSupabaseForm from '@/components/TestSupabaseForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestSupabase = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
            Ferramenta de Teste Supabase
          </h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="mb-6 text-gray-600">
            Esta página permite testar o envio de dados para o Supabase sem interferir com o formulário principal.
            Use-a para verificar se a conexão com o banco de dados está funcionando corretamente.
          </p>
          
          <TestSupabaseForm />
          
          <div className="mt-8 text-sm text-gray-500">
            <h3 className="font-medium mb-2">Instruções:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Use "Testar com Dados Padrão" para enviar um conjunto de dados predefinido.</li>
              <li>Use "Testar com Dados Personalizados" para enviar dados específicos no formato JSON.</li>
              <li>Verifique o console do navegador para logs detalhados (F12 &gt; Console).</li>
              <li>Os resultados também serão exibidos na interface após o envio.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSupabase;
