import React from 'react';
import { Input } from '@/components/ui/input';
import { formatarEntradaMonetaria } from '@/utils/formatters';

interface FinancialSectionProps {
  totalValueString: string;
  setTotalValueString: (value: string) => void;
  downPaymentString: string;
  setDownPaymentString: (value: string) => void;
  remainingValueString: string;
}

export const FinancialSection: React.FC<FinancialSectionProps> = ({
  totalValueString,
  setTotalValueString,
  downPaymentString,
  setDownPaymentString,
  remainingValueString
}) => {
  const handleTotalValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarEntradaMonetaria(e.target.value);
    setTotalValueString(valorFormatado);
  };

  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarEntradaMonetaria(e.target.value);
    setDownPaymentString(valorFormatado);
  };

  return (
    <div className="space-y-2">
      <div className="pt-4">
        <label className="text-sm font-medium">Valor Total (R$)</label>
        <Input 
          type="text" 
          value={totalValueString} 
          onChange={handleTotalValueChange}
          required 
          className="text-black dark:text-white"
          placeholder="0,00"
        />
      </div>
      
      <div className="pt-4">
        <label className="text-sm font-medium">Valor de Entrada (R$)</label>
        <Input 
          type="text" 
          value={downPaymentString} 
          onChange={handleDownPaymentChange}
          required 
          className="text-black dark:text-white"
          placeholder="0.00"
        />
      </div>
      
      <div className="pt-4">
        <label className="text-sm font-medium">Valor Restante (R$)</label>
        <Input 
          type="text" 
          value={remainingValueString} 
          disabled 
          className="bg-[#0f1729] text-white font-medium"
          style={{ opacity: 1 }}
        />
      </div>
    </div>
  );
};