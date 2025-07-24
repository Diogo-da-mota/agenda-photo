import React from 'react';
import { ArrowUp, ArrowDown, Clock, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { financeColors } from '@/utils/themeConfig';
import TransactionItem from './TransactionItem';
import { Transacao } from '@/services/financeiroService';
import { converterDespesaParaTransacao } from '../utils/converters';

interface TransactionGroupCardProps {
  group: {
    label: string;
    totalEntradas: number;
    totalRestantes: number;
    totalDespesas: number;
    transactions: Transacao[];
    transacoesRestantes?: any[];
    transacoesEntradas?: any[];
    despesas: any[];
  };
  onEditTransaction: (transaction: Transacao) => void;
  formatarMoeda: (value: number) => string;
  formatDate: (date: string | Date) => string;
}

/**
 * Componente para renderizar um grupo de transações mensais
 */
const TransactionGroupCard: React.FC<TransactionGroupCardProps> = ({
  group,
  onEditTransaction,
  formatarMoeda,
  formatDate
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4">
        <CardTitle className="capitalize text-lg mb-0">{group.label}</CardTitle>
        <CardDescription className="flex flex-wrap gap-4 items-center mt-0 text-lg">
          {group.totalEntradas > 0 && (
            <>
              <span className={`flex items-center ${financeColors.text.entrada} font-medium`}>
                <ArrowUp className="mr-1 h-5 w-5" />
                Entradas: R$ {formatarMoeda(group.totalEntradas)}
              </span>
              <span className="text-gray-400">|</span>
            </>
          )}

          {group.totalRestantes > 0 && (
            <>
              <span className={`flex items-center ${financeColors.text.aReceber} font-medium`}>
                <Clock className="mr-1 h-5 w-5" />
                A Receber: R$ {formatarMoeda(group.totalRestantes)}
              </span>
              <span className="text-gray-400">|</span>
            </>
          )}
          
          {group.totalDespesas > 0 && (
            <span className={`flex items-center ${financeColors.text.saida} font-medium`}>
              <ArrowDown className="mr-1 h-5 w-5" />
              Despesas: R$ {formatarMoeda(group.totalDespesas)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Mostrar transações regulares */}
          {group.transactions.map(transaction => (
            <TransactionItem 
              key={transaction.id} 
              transaction={transaction}
              onEdit={onEditTransaction}
              formatarMoeda={formatarMoeda}
              formatDate={formatDate}
            />
          ))}
          
          {/* Cards individuais de valores restantes da agenda */}
          {group.transacoesRestantes && group.transacoesRestantes.map(transacao => (
            <div 
              key={`restante-${transacao.id}`} 
              className={`flex items-center p-4 rounded-lg border border-l-4 ${financeColors.border.aReceber} bg-white dark:bg-gray-800 mb-2`}
            >
              <div className="flex-1">
                <h4 className="font-medium">{transacao.clienteName}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <p className="text-xs text-gray-400">
                    {formatDate(transacao.data_transacao)}
                  </p>
                  {transacao.data_evento && (
                    <p className="text-xs text-gray-400">
                      • Evento: {formatDate(transacao.data_evento)}
                    </p>
                  )}
                  <p className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded">
                    Valor Restante
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${financeColors.text.aReceber}`}>
                  + R$ {formatarMoeda(transacao.valor)}
                </p>
                <p className={`text-xs ${financeColors.text.aReceber} font-medium`}>
                  A Receber
                </p>
              </div>
            </div>
          ))}
          
          {/* Cards individuais de valores de entrada da agenda */}
          {group.transacoesEntradas && group.transacoesEntradas.map(transacao => (
            <div 
              key={`entrada-${transacao.id}`} 
              className={`flex items-center p-4 rounded-lg border border-l-4 ${financeColors.border.entrada} bg-white dark:bg-gray-800 mb-2`}
            >
              <div className="flex-1">
                <h4 className="font-medium">{transacao.clienteName}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <p className="text-xs text-gray-400">
                    {formatDate(transacao.data_transacao)}
                  </p>
                  {transacao.data_evento && (
                    <p className="text-xs text-gray-400">
                      • Evento: {formatDate(transacao.data_evento)}
                    </p>
                  )}
                  <p className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                    Valor de Entrada
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${financeColors.text.entrada}`}>
                  + R$ {formatarMoeda(transacao.valor)}
                </p>
                <p className={`text-xs ${financeColors.text.entrada} font-medium`}>
                  Recebido
                </p>
              </div>
            </div>
          ))}
          
          {/* Mostrar despesas específicas */}
          {group.despesas.map(despesa => (
            <TransactionItem 
              key={`despesa-${despesa.id}`} 
              transaction={converterDespesaParaTransacao(despesa)}
              onEdit={onEditTransaction}
              formatarMoeda={formatarMoeda}
              formatDate={formatDate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionGroupCard; 