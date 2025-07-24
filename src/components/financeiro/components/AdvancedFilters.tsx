import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Check, RefreshCcw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import { categorias } from '../constants';
import { getBrazilDate } from '../utils/dateUtils';
import { AdvancedFiltersProps } from '../types';

/**
 * Componente para filtros avançados do módulo financeiro
 */
export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  dateRange,
  setDateRange,
  categoryFilter,
  setCategoryFilter,
  onClose
}) => {
  const [startDate, setStartDate] = useState<Date | null>(
    dateRange.start || startOfMonth(getBrazilDate())
  );
  const [endDate, setEndDate] = useState<Date | null>(
    dateRange.end || endOfMonth(getBrazilDate())
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryFilter || []);

  const handleApplyFilters = () => {
    setDateRange({ start: startDate, end: endDate });
    setCategoryFilter(selectedCategories);
    onClose();
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSelectAllCategories = (type: 'receita' | 'despesa') => {
    const categoriasDoTipo = categorias[type] as readonly string[];
    const novasSelecionadas = [...new Set([...selectedCategories, ...categoriasDoTipo])];
    setSelectedCategories(novasSelecionadas);
  };

  const handleDeselectAllCategories = (type: 'receita' | 'despesa') => {
    const categoriasDoTipo = categorias[type] as readonly string[];
    const novasSelecionadas = selectedCategories.filter(cat => !categoriasDoTipo.includes(cat));
    setSelectedCategories(novasSelecionadas);
  };

  const handleSelectMonth = (monthOffset: number) => {
    const brazilDate = getBrazilDate();
    const targetMonth = monthOffset === 0
      ? brazilDate
      : monthOffset > 0
        ? addMonths(brazilDate, monthOffset)
        : subMonths(brazilDate, Math.abs(monthOffset));

    setStartDate(startOfMonth(targetMonth));
    setEndDate(endOfMonth(targetMonth));
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Período</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          <Button size="sm" variant="outline" onClick={() => handleSelectMonth(0)}>
            Mês Atual
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleSelectMonth(-1)}>
            Mês Anterior
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleSelectMonth(1)}>
            Próximo Mês
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const brazilDate = getBrazilDate();
              setStartDate(subMonths(brazilDate, 3));
              setEndDate(brazilDate);
            }}
          >
            Últimos 3 meses
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const brazilDate = getBrazilDate();
              setStartDate(new Date(brazilDate.getFullYear(), 0, 1));
              setEndDate(new Date(brazilDate.getFullYear(), 11, 31));
            }}
          >
            Ano Atual
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-sm">Data Inicial</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <label className="text-sm">Data Final</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Categorias</h4>
          {selectedCategories.length > 0 && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
              {selectedCategories.length} selecionada{selectedCategories.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-green-600">Receitas</h5>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleSelectAllCategories('receita')}
                >
                  Todos
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleDeselectAllCategories('receita')}
                >
                  Nenhum
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {categorias.receita.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-receita-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                  <label
                    htmlFor={`cat-receita-${category}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-red-600">Despesas</h5>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleSelectAllCategories('despesa')}
                >
                  Todos
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleDeselectAllCategories('despesa')}
                >
                  Nenhum
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {categorias.despesa.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-despesa-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                  <label
                    htmlFor={`cat-despesa-${category}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
            setSelectedCategories([]);
          }}
          className="w-full sm:w-auto"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
        <Button
          onClick={handleApplyFilters}
          className="w-full sm:w-auto"
        >
          <Check className="mr-2 h-4 w-4" />
          Aplicar Filtros
        </Button>
      </DialogFooter>
    </div>
  );
};

export default AdvancedFilters; 