import React from 'react';
import { ArrowUp, ArrowDown, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { financeColors } from '@/utils/themeConfig';
import { SummaryCardsProps } from '../types';

/**
 * Componente para exibir cards de resumo financeiro
 */
export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalEntradas,
  totalAReceber,
  totalDespesas,
  saldo,
  formatarMoeda,
  isAdmin
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* Card Entradas */}
      <Card className={`border-l-4 ${financeColors.border.entrada}`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg flex items-center ${financeColors.text.entrada}`}>
            <ArrowUp className="mr-2 h-5 w-5" />
            Entradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${financeColors.text.entrada}`}>
            R$ {formatarMoeda(totalEntradas)}
          </p>
        </CardContent>
      </Card>
      
      {/* Card A Receber */}
      <Card className={`border-l-4 ${financeColors.border.aReceber}`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg flex items-center ${financeColors.text.aReceber}`}>
            <Clock className="mr-2 h-5 w-5" />
            A Receber
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${financeColors.text.aReceber}`}>
            R$ {formatarMoeda(totalAReceber)}
          </p>
        </CardContent>
      </Card>
      
      {/* Card Saídas */}
      <Card className={`border-l-4 ${financeColors.border.saida}`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg flex items-center ${financeColors.text.saida}`}>
            <ArrowDown className="mr-2 h-5 w-5" />
            Saídas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${financeColors.text.saida}`}>
            R$ {formatarMoeda(totalDespesas)}
          </p>
        </CardContent>
      </Card>
      
      {/* Card Saldo */}
      {isAdmin && (
        <Card className={`border-l-4 ${financeColors.border.saldo}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-lg flex items-center ${financeColors.text.saldo}`}>
              <DollarSign className="mr-2 h-5 w-5" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${financeColors.text.saldo}`}>
              R$ {formatarMoeda(saldo)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SummaryCards; 