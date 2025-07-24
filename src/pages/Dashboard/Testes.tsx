import React from 'react';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestTube, Code, Database, Settings } from 'lucide-react';

const Testes = () => {
  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Área de Testes</h1>
          <p className="text-muted-foreground">
            Ferramentas e utilitários para testes e desenvolvimento
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Teste de Componentes
              </CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">UI Tests</div>
              <p className="text-xs text-muted-foreground">
                Testes de interface e componentes
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Executar Testes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Teste de API
              </CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">API Tests</div>
              <p className="text-xs text-muted-foreground">
                Testes de endpoints e integração
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Testar APIs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Teste de Banco
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">DB Tests</div>
              <p className="text-xs text-muted-foreground">
                Testes de conexão e queries
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Testar Banco
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Ambiente de Teste</h3>
                <p className="text-sm text-muted-foreground">
                  Configurações específicas para o ambiente de desenvolvimento e testes.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Logs de Debug</h3>
                <p className="text-sm text-muted-foreground">
                  Visualização de logs e informações de debug do sistema.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="default">
                Limpar Cache
              </Button>
              <Button variant="outline">
                Exportar Logs
              </Button>
              <Button variant="outline">
                Reset Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default Testes;