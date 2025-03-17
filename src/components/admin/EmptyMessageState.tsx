
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyMessageStateProps {
  tableExists: boolean;
  isCreatingTable: boolean;
  createTable: () => Promise<void>;
  checkTables: () => void;
}

const EmptyMessageState: React.FC<EmptyMessageStateProps> = ({
  tableExists,
  isCreatingTable,
  createTable,
  checkTables
}) => {
  if (!tableExists) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              A tabela de mensagens não foi encontrada.
              <p className="mt-2 text-sm">
                Você pode tentar criar a tabela manualmente clicando no botão abaixo.
              </p>
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={createTable} 
              disabled={isCreatingTable}
              className="flex items-center gap-2"
            >
              {isCreatingTable ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando tabela...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Criar tabela manualmente
                </>
              )}
            </Button>
            <Button 
              onClick={checkTables} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Verificar novamente
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>A tabela será criada com as colunas: id, created_at, name, email, phone, message.</p>
            <p className="mt-2 font-medium">Se o problema persistir após várias tentativas, tente atualizar a página inteira.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="text-center py-8">
      <CardContent>
        <p>Nenhuma mensagem encontrada</p>
        <div className="mt-4">
          <Button onClick={checkTables} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyMessageState;
