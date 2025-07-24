
import React from 'react';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import RLSAuditTool from '@/components/diagnostics/RLSAuditTool';
import AuditLogFunction from '@/components/diagnostics/AuditLogFunction';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AuditSecurityDashboard = () => {
  return (
    <ResponsiveContainer>
      <div className="space-y-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Segurança e Auditoria</h1>
          <p className="text-muted-foreground">
            Ferramentas para auditoria de segurança e implementação de logs para rastreamento de atividades
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Visão Geral de Segurança</CardTitle>
              <CardDescription>
                Status das principais medidas de segurança no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="font-medium text-green-800 mb-1">Políticas RLS</h3>
                  <p className="text-sm text-green-700">
                    Políticas de Row Level Security implementadas em todas as tabelas principais para garantir que usuários só acessem seus próprios dados.
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <h3 className="font-medium text-amber-800 mb-1">Consolidação de Dados</h3>
                  <p className="text-sm text-amber-700">
                    Processo de consolidação das tabelas user_profiles e profiles em andamento para evitar duplicidade e inconsistência.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="font-medium text-blue-800 mb-1">Logs de Auditoria</h3>
                  <p className="text-sm text-blue-700">
                    Sistema de logs para rastreamento de operações sensíveis nas tabelas principais, importante para segurança e compliance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Componente de auditoria de RLS */}
        <RLSAuditTool />
        
        {/* Componente para implementação de logs de auditoria */}
        <AuditLogFunction />
        
        {/* Recomendações de segurança */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos de Segurança</CardTitle>
            <CardDescription>
              Recomendações para melhorar ainda mais a segurança do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">1. Completar consolidação das tabelas de usuário</h3>
                <p className="text-sm text-gray-600">
                  Finalizar a migração e consolidação das tabelas user_profiles e profiles para evitar inconsistências de dados e melhorar a segurança.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">2. Implementar validação de entrada em todas as APIs</h3>
                <p className="text-sm text-gray-600">
                  Adicionar validação rigorosa em todas as entradas de dados para prevenir injeção SQL e outros ataques.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">3. Implementar monitoramento de segurança</h3>
                <p className="text-sm text-gray-600">
                  Adicionar alertas para atividades suspeitas com base nos logs de auditoria implementados.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">4. Revisão periódica de políticas RLS</h3>
                <p className="text-sm text-gray-600">
                  Estabelecer um processo de revisão regular das políticas RLS para garantir que continuem efetivas conforme o sistema evolui.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default AuditSecurityDashboard;
