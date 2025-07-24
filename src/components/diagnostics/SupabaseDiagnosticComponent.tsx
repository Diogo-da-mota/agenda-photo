import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import RLSAuditTool from './RLSAuditTool';
import DiagnosticTools from '@/components/clientes/DiagnosticTools';
import { checkTableRLS } from './rls/rlsAuditUtils';

interface SupabaseDiagnosticComponentProps {
  defaultTab?: string;
}

const SupabaseDiagnosticComponent: React.FC<SupabaseDiagnosticComponentProps> = ({ 
  defaultTab = "rls-audit" 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <Card className="shadow-md">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger value="rls-audit">Auditoria RLS</TabsTrigger>
          <TabsTrigger value="tabelas">Diagnóstico Tabelas</TabsTrigger>
          <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
        </TabsList>
        <TabsContent value="rls-audit">
          <RLSAuditTool />
        </TabsContent>
        <TabsContent value="tabelas">
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Essa ferramenta verifica o estado atual das tabelas e suas políticas.
            </p>
            {/* Componente para verificação de tabelas */}
          </div>
        </TabsContent>
        <TabsContent value="ferramentas">
          <div className="space-y-6">
            <DiagnosticTools />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SupabaseDiagnosticComponent;
