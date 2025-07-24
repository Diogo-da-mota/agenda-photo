
import React from 'react';
import { Separator } from '@/components/ui/separator';

const TestInstructions: React.FC = () => {
  return (
    <>
      <Separator />
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Como interpretar:</strong></p>
        <p>• ✅ Verde: Requisição bem-sucedida (dentro do limite)</p>
        <p>• ❌ Vermelho com "Rate limit": Bloqueio funcionando corretamente</p>
        <p>• ❌ Vermelho com outro erro: Problema não relacionado ao rate limiting</p>
        <p>• Esperado: Auth falhar na 51ª tentativa, Financeiro falhar na 101ª tentativa</p>
      </div>
    </>
  );
};

export default TestInstructions;
