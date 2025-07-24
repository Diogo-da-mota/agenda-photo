
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import TestFictitiousClient from '@/components/testing/TestFictitiousClient';
import SupabaseConnectionTester from '@/components/testing/SupabaseConnectionTester';
import SupabaseTestInsert from '@/components/testing/SupabaseTestInsert';
import { Database } from 'lucide-react';

const DiagnosticTools: React.FC = () => {
  return (
    <>
      {/* Fictitious Client Test Card */}
      <Card className="border-amber-300 bg-amber-50 mb-6 shadow-lg shadow-amber-100/50">
        <CardHeader className="bg-amber-100/50">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Teste de Cliente Fictício
          </CardTitle>
          <CardDescription>
            Este teste completo tenta inserir um cliente fictício na tabela e fornece um diagnóstico detalhado dos problemas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestFictitiousClient />
        </CardContent>
      </Card>
      
      {/* Advanced Supabase Connection Tester */}
      <SupabaseConnectionTester />
      
      {/* Supabase Test Insert Button */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Teste Simples de Inserção</CardTitle>
          <CardDescription>
            Teste básico de inserção no Supabase com log simplificado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupabaseTestInsert />
        </CardContent>
      </Card>
    </>
  );
};

export default DiagnosticTools;
