
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PolicyInfo {
  nome_politica: string;
  tabela: string;
  esquema: string;
  funcoes: string[];
  comando: string;
  usando: string;
  verificacao: string;
}

interface PolicyCardProps {
  policy: PolicyInfo;
  index: number;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, index }) => {
  return (
    <div key={index} className="p-4 border rounded-lg bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-lg mb-2">{policy.nome_politica}</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Tabela:</strong> {policy.tabela}</p>
            <p><strong>Esquema:</strong> {policy.esquema}</p>
            <p><strong>Comando:</strong> <Badge variant="outline">{policy.comando}</Badge></p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <strong className="text-sm">Funções:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {policy.funcoes.map((funcao, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {funcao}
                </Badge>
              ))}
            </div>
          </div>
          {policy.usando && (
            <div>
              <strong className="text-sm">Usando:</strong>
              <p className="text-xs bg-gray-100 p-2 rounded mt-1 font-mono">
                {policy.usando}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
