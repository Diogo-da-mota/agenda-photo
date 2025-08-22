
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TestResult } from './types';

interface TestResultsProps {
  results: TestResult[];
}

const TestResults: React.FC<TestResultsProps> = ({ results }) => {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Resultados dos Testes:</h4>
      
      {results.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum teste executado ainda. Clique em um dos botões acima para iniciar.
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? '✅' : '❌'}
                </Badge>
                
                <div>
                  <div className="font-medium text-sm">{result.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {result.timestamp}
                    {result.responseTime && ` | ${result.responseTime}ms`}
                  </div>
                </div>
              </div>
              
              {result.error && (
                <div className="text-xs text-red-600 max-w-xs truncate">
                  {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestResults;
