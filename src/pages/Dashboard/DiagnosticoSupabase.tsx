
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SupabaseDiagnosticTool,
  ConsolidatedSupabaseTest,
  RateLimitTest,
  TestFictitiousClient
} from '@/components/testing';

const DiagnosticoSupabase = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Diagnóstico Supabase
        </h1>
        <p className="text-gray-600">
          Ferramentas para testar e diagnosticar a conexão com o Supabase
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico Geral</CardTitle>
            <CardDescription>
              Teste abrangente de todas as funcionalidades do Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SupabaseDiagnosticTool />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teste Consolidado</CardTitle>
            <CardDescription>
              Testes consolidados de autenticação e banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConsolidatedSupabaseTest />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teste de Rate Limit</CardTitle>
            <CardDescription>
              Verifica os limites de requisições do Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RateLimitTest />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliente Fictício</CardTitle>
            <CardDescription>
              Teste com dados fictícios para validação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestFictitiousClient />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiagnosticoSupabase;
