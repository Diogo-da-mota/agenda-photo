
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import TableStatusGrid from './diagnostic/TableStatusGrid';
import { useSupabaseTables } from './diagnostic/useSupabaseTables';

const ConsolidatedSupabaseTest = () => {
  const { tablesToTest, results, loading, runTests } = useSupabaseTables();

  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Testes Consolidados Supabase</h2>
          <Button 
            size="sm" 
            onClick={runTests} 
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              'Executar Testes'
            )}
          </Button>
        </div>
        
        {loading && Object.keys(results).length === 0 ? (
          <div className="flex items-center space-x-2 justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Executando testes...</p>
          </div>
        ) : (
          <TableStatusGrid 
            tables={Array.from(tablesToTest)} 
            results={results} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ConsolidatedSupabaseTest;
