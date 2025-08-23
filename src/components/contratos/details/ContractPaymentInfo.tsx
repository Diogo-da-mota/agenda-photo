
import React from 'react';

interface ContractPaymentInfoProps {
  value: number;
  downPayment: number;
}

const ContractPaymentInfo = ({ value, downPayment }: ContractPaymentInfoProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Informações de Pagamento</h3>
      {/* Layout para desktop */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm font-medium">Valor Total</p>
          <p className="text-lg font-bold">
            {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm font-medium">Sinal</p>
          <p className="text-lg font-bold">
            {downPayment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm font-medium">Valor Restante</p>
          <p className="text-lg font-bold">
            {(value - downPayment).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>
      
      {/* Layout específico para mobile */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm font-medium text-center">Valor Total</p>
          <p className="text-base font-bold text-center">
            {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm font-medium text-center">Sinal</p>
            <p className="text-base font-bold text-center">
              {downPayment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm font-medium text-center">Valor Restante</p>
            <p className="text-base font-bold text-center">
              {(value - downPayment).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPaymentInfo;
