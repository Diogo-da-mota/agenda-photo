
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TestControls, TestResults, TestInstructions, useRateLimitTest } from './rate-limit';

export const RateLimitTest: React.FC = () => {
  const {
    isRunning,
    results,
    testAuthRateLimit,
    testFinanceiroRateLimit,
    clearResults
  } = useRateLimitTest();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛡️ Teste de Rate Limiting
        </CardTitle>
        <CardDescription>
          Valida se o rate limiting está funcionando corretamente nas rotas críticas.
          <br />
          <strong>Auth:</strong> Máximo 50 req/min | <strong>Financeiro:</strong> Máximo 100 req/min
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <TestControls
          isRunning={isRunning}
          onTestAuth={testAuthRateLimit}
          onTestFinanceiro={testFinanceiroRateLimit}
          onClear={clearResults}
        />

        <Separator />

        <TestResults results={results} />

        <TestInstructions />
      </CardContent>
    </Card>
  );
};
