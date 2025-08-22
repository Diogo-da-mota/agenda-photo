import React from 'react';

interface ActiveFiltersDisplayProps {
  dateRange?: any;
  typeFilter?: string;
  categoryFilter?: string[];
  onClearAllFilters?: () => void;
}

export const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = (props) => {
  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground">Filtros ativos aparecerão aqui</p>
    </div>
  );
};

export default ActiveFiltersDisplay;