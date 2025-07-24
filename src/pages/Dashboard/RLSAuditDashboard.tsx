
import React from 'react';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import RLSAuditTool from '@/components/diagnostics/RLSAuditTool';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';

const RLSAuditDashboard = () => {
  return (
    <ResponsiveContainer>
      <div className="space-y-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Auditoria de Segurança RLS</h1>
          <p className="text-muted-foreground">
            Ferramenta para auditoria e verificação da implementação de políticas Row Level Security (RLS)
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Sobre políticas RLS</AlertTitle>
          <AlertDescription>
            As políticas RLS (Row Level Security) permitem restringir o acesso aos dados no nível de linha, 
            garantindo que cada usuário tenha acesso apenas aos seus próprios dados. É fundamental que todas 
            as tabelas que contêm dados de usuário tenham políticas RLS adequadas para cada operação (SELECT, INSERT, UPDATE, DELETE).
          </AlertDescription>
        </Alert>

        <RLSAuditTool />
        
        <Card>
          <CardHeader>
            <CardTitle>Melhores Práticas de Segurança RLS</CardTitle>
            <CardDescription>
              Recomendações para garantir a segurança dos dados usando políticas RLS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Ative RLS em todas as tabelas com dados sensíveis</h3>
              <p className="text-gray-600">
                Todas as tabelas que armazenam dados do usuário devem ter RLS ativado 
                para evitar que um usuário acesse dados de outro usuário.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">2. Implemente políticas para todas as operações</h3>
              <p className="text-gray-600">
                Cada operação (SELECT, INSERT, UPDATE, DELETE) deve ter uma política RLS específica, 
                garantindo que os usuários só possam realizar essas operações nos seus próprios dados.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">3. Teste regularmente as políticas</h3>
              <p className="text-gray-600">
                Execute esta auditoria regularmente para garantir que todas as tabelas 
                tenham as políticas corretas e que nenhuma alteração de esquema tenha quebrado a segurança.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">4. Use funções SECURITY DEFINER com cautela</h3>
              <p className="text-gray-600">
                Ao criar funções SECURITY DEFINER, limite o acesso apenas ao necessário e sempre 
                defina o search_path explicitamente para evitar ataques de injeção.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">5. Nunca desative RLS em produção</h3>
              <p className="text-gray-600">
                Nunca desative RLS em um ambiente de produção, mesmo temporariamente. 
                Use funções específicas ou políticas temporárias para operações administrativas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default RLSAuditDashboard;
