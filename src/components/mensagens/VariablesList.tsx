import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, User, Calendar, Clock, MapPin, DollarSign, Building, Globe } from 'lucide-react';
import { VARIAVEIS_DISPONIVEIS } from '@/services/mensagemService';

type VariablesListProps = {
  onInsert: (variable: string) => void;
};

export const VariablesList = ({ onInsert }: VariablesListProps) => {
  const getIcon = (placeholder: string) => {
    if (placeholder.includes('cliente')) return <User size={14} />;
    if (placeholder.includes('data')) return <Calendar size={14} />;
    if (placeholder.includes('hora')) return <Clock size={14} />;
    if (placeholder.includes('local')) return <MapPin size={14} />;
    if (placeholder.includes('valor')) return <DollarSign size={14} />;
    if (placeholder.includes('empresa')) return <Building size={14} />;
    return <Globe size={14} />;
  };
  
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'cliente': return 'Cliente';
      case 'evento': return 'Evento';
      case 'empresa': return 'Empresa';
      case 'sistema': return 'Sistema';
      default: return 'Outros';
    }
  };

  return (
    <div className="border rounded-md bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="h-[280px] overflow-y-auto space-y-0 divide-y">
        {Object.entries(VARIAVEIS_DISPONIVEIS).map(([category, variables]) => (
          <div key={category} className="space-y-1">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 sticky top-0">
              <h4 className="text-xs font-medium">{getCategoryName(category)}</h4>
            </div>
            <div className="space-y-0">
              {variables.map((variable, index) => (
                <div 
                  key={`${category}-${index}`}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-muted-foreground flex-shrink-0">
                      {getIcon(variable.placeholder)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{variable.descricao}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {variable.placeholder}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => onInsert(variable.placeholder)}
                    title={`Inserir ${variable.placeholder}`}
                  >
                    <PlusCircle size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
