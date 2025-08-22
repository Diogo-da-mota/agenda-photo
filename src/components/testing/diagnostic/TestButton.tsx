
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface TestButtonProps {
  onClick: () => Promise<void>;
  loading: boolean;
  disabled: boolean;
}

const TestButton: React.FC<TestButtonProps> = ({ onClick, loading, disabled }) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={loading || disabled}
      className="w-full gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Testando...
        </>
      ) : (
        <>
          🧪 Testar envio com Supabase
        </>
      )}
    </Button>
  );
};

export default TestButton;
