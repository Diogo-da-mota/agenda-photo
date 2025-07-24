import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Download, Filter, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ReportsHeaderProps {
  isSaving: boolean;
  handleSaveReport: (tipo: string) => void;
  handleExport: (format: string) => void;
  category: string;
  setCategory: (category: string) => void;
  clientFilter: string;
  setClientFilter: (filter: string) => void;
  paymentStatus: string;
  setPaymentStatus: (status: string) => void;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  isSaving,
  handleSaveReport,
  handleExport,
  category,
  setCategory,
  clientFilter,
  setClientFilter,
  paymentStatus,
  setPaymentStatus
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 className="text-3xl font-bold tracking-tight text-center md:text-left w-full md:w-auto">Relatórios Financeiros</h1>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 flex-grow md:flex-grow-0"
          onClick={() => handleSaveReport('mensal')}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="text-xs sm:text-sm">Salvar Relatório</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 flex-grow md:flex-grow-0">
              <Download className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Exportar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4 text-red-500" />
                <span>PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                <span>Excel</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 flex-grow md:flex-grow-0">
              <Filter className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Filtros</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filtros Avançados</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <div className="p-2">
              <label className="text-xs font-medium block mb-1">Categoria</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="portraits">Sessões de Retrato</SelectItem>
                  <SelectItem value="weddings">Casamentos</SelectItem>
                  <SelectItem value="corporate">Eventos Corporativos</SelectItem>
                  <SelectItem value="products">Produtos Físicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-2">
              <label className="text-xs font-medium block mb-1">Cliente</label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  <SelectItem value="xyz">Empresa XYZ</SelectItem>
                  <SelectItem value="maria">Maria Silva</SelectItem>
                  <SelectItem value="joao">João Santos</SelectItem>
                  <SelectItem value="abc">Buffet ABC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-2">
              <label className="text-xs font-medium block mb-1">Status de Pagamento</label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                setCategory('all');
                setClientFilter('all');
                setPaymentStatus('all');
              }}
              className="justify-center text-center"
            >
              Limpar Filtros
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};