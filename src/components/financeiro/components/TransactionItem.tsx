import React from 'react';
import { Edit } from 'lucide-react';
import { financeColors } from '@/utils/themeConfig';
import { TransactionItemProps } from '../types';

/**
 * Componente para exibir uma transação individual
 */
export const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  onEdit, 
  formatarMoeda, 
  formatDate 
}) => {
  const isReceita = transaction.tipo === 'receita';
  const isRestante = transaction.status === 'restante';
  
  return (
    <div 
      className={`
        flex items-center p-4 rounded-lg border border-l-4 
        ${isRestante ? financeColors.border.aReceber : isReceita ? financeColors.border.entrada : financeColors.border.saida}
        bg-white dark:bg-gray-800
        mb-2
      `}
    >
      <div className="flex-1">
        <h4 className="font-medium">{transaction.clienteName || transaction.descricao}</h4>
        <div className="flex flex-wrap gap-2 mt-1">
          <p className="text-xs text-gray-400">
            {formatDate(transaction.data_transacao)}
          </p>
          {transaction.data_evento && (
            <p className="text-xs text-gray-400">
              • Evento: {formatDate(transaction.data_evento)}
            </p>
          )}
          {transaction.categoria && (
            <p className={`text-xs ${isRestante 
              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
              : isReceita 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'} px-2 py-0.5 rounded`}>
              {transaction.categoria}
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isRestante ? financeColors.text.aReceber : isReceita ? financeColors.text.entrada : financeColors.text.saida}`}>
          {isReceita ? '+' : '-'} R$ {formatarMoeda(transaction.valor)}
        </p>
      </div>
      <div className="flex space-x-1 ml-2">
        <button 
          onClick={() => onEdit(transaction)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white" 
          title="Editar transação"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem; 