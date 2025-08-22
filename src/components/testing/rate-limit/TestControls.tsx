
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, DollarSign, RotateCcw } from 'lucide-react';

interface TestControlsProps {
  isRunning: boolean;
  onTestAuth: () => void;
  onTestFinanceiro: () => void;
  onClear: () => void;
}

const TestControls: React.FC<TestControlsProps> = ({
  isRunning,
  onTestAuth,
  onTestFinanceiro,
  onClear
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={onTestAuth}
        disabled={isRunning}
        className="flex items-center gap-2"
        variant="outline"
      >
        <Shield className="w-4 h-4" />
        Testar Auth Rate Limit
      </Button>
      
      <Button
        onClick={onTestFinanceiro}
        disabled={isRunning}
        className="flex items-center gap-2"
        variant="outline"
      >
        <DollarSign className="w-4 h-4" />
        Testar Financeiro Rate Limit
      </Button>
      
      <Button
        onClick={onClear}
        disabled={isRunning}
        variant="ghost"
        className="flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Limpar Resultados
      </Button>
    </div>
  );
};

export default TestControls;
export { TestControls };
