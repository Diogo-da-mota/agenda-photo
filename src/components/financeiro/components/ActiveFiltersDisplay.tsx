import React from 'react';
import { Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateRange } from '../utils/formatters';

interface ActiveFiltersDisplayProps {
  dateRange: { start: Date | null; end: Date | null };
  typeFilter: string;
  categoryFilter: string[];
  onClearAllFilters: () => void;
}

/**
 * Componente para exibir filtros ativos no financeiro
 */
const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({
  dateRange,
  typeFilter,
  categoryFilter,
  onClearAllFilters
}) => {
  // Verificar se há filtros ativos
  const hasActiveFilters = dateRange.start || dateRange.end || categoryFilter.length > 0 || typeFilter !== 'all';
  
  if (!hasActiveFilters) {
    return null;
  }

  const getTypeFilterLabel = () => {
    switch (typeFilter) {
      case 'income': return 'Entradas';
      case 'pending': return 'A Receber';
      case 'expense': return 'Saídas';
      default: return null;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4 flex flex-wrap items-center gap-2">
      <h3 className="text-sm font-medium mr-2">Filtros ativos:</h3>
      
      {typeFilter !== 'all' && (
        <div className="flex items-center bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
          <Filter className="h-3 w-3 mr-1" />
          {getTypeFilterLabel()}
        </div>
      )}
      
      {(dateRange.start || dateRange.end) && (
        <div className="flex items-center bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDateRange(dateRange)}
        </div>
      )}
      
      {categoryFilter.map(category => (
        <div key={category} className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
          {category}
        </div>
      ))}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs h-6 ml-auto"
        onClick={onClearAllFilters}
      >
        Limpar todos
      </Button>
    </div>
  );
};

export default ActiveFiltersDisplay; 