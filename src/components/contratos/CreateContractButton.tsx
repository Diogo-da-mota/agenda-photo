import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CreateContractButtonProps {
  onClick: () => void;
}

const CreateContractButton: React.FC<CreateContractButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>
      <Plus className="mr-2 h-4 w-4" />
      Novo Contrato
    </Button>
  );
};

export default CreateContractButton;