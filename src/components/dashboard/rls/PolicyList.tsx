
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import PolicyCard from './PolicyCard';

interface PolicyInfo {
  nome_politica: string;
  tabela: string;
  esquema: string;
  funcoes: string[];
  comando: string;
  usando: string;
  verificacao: string;
}

interface PolicyListProps {
  policies: PolicyInfo[];
  selectedTable: string;
}

const PolicyList: React.FC<PolicyListProps> = ({ policies, selectedTable }) => {
  if (policies.length > 0) {
    return (
      <div className="space-y-4">
        {policies.map((policy, index) => (
          <PolicyCard key={index} policy={policy} index={index} />
        ))}
      </div>
    );
  }

  return (
    <Alert>
      <AlertTriangle className="w-4 h-4" />
      <AlertDescription>
        Nenhuma política RLS encontrada para a tabela {selectedTable}. 
        Isso pode representar um risco de segurança.
      </AlertDescription>
    </Alert>
  );
};

export default PolicyList;
