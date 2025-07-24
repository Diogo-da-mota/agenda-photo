
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert } from 'lucide-react';
import { useRLSAudit } from './rls/useRLSAudit';
import AuditStats from './rls/AuditStats';
import TableStatusDisplay from './rls/TableStatusDisplay';
import TableDetailsCard from './rls/TableDetailsCard';
import { getSuggestionForTable } from './rls/rlsAuditUtils';

const RLSAuditTool = () => {
  const {
    loading,
    auditResults,
    showDetails,
    auditTables,
    getStats,
    setShowDetails
  } = useRLSAudit();

  const stats = getStats();

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Auditoria de Políticas RLS
        </CardTitle>
        <CardDescription>
          Verifica a implementação e efetividade das políticas de segurança Row Level Security (RLS) nas tabelas do banco de dados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={auditTables}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⚙️</span> Auditando...
              </>
            ) : (
              <>🔍 Iniciar Auditoria de Políticas RLS</>
            )}
          </Button>
          
          {auditResults.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Esconder Detalhes" : "Mostrar Detalhes"}
            </Button>
          )}
        </div>

        {auditResults.length > 0 && (
          <>
            <AuditStats 
              total={stats.total}
              success={stats.success}
              warning={stats.warning}
              error={stats.error}
            />

            <TableStatusDisplay auditResults={auditResults} />

            {showDetails && (
              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-medium">Detalhes por Tabela</h3>
                {auditResults.map((result) => (
                  <TableDetailsCard 
                    key={result.tableName}
                    result={result}
                    getSuggestion={getSuggestionForTable}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RLSAuditTool;
