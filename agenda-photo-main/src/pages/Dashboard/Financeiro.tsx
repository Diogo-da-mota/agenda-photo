import React, { useState, useEffect } from 'react';
import { InfoIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useQueryClient } from '@tanstack/react-query';
import './Financeiro.css';

// Imports dos componentes financeiros refatorados
import {
  SummaryCards,
  ActiveFiltersDisplay,
  FinanceiroHeader,
  TransactionGroupCard,
  formatDate,
  formatarMoeda,
  groupTransactionsByMonth,
  applyAllFilters,
  calcularTotaisDosFiltros,
  useFinanceiroData,
  useFinanceiroActions
} from '@/components/financeiro';

// Tipos do serviço financeiro
import { Transacao } from '@/services/financeiroService';

// Os tipos e constantes agora são importados dos arquivos refatorados

// AdvancedFilters agora é importado dos componentes refatorados

// TransactionItem agora é importado dos componentes refatorados

// Componente principal do Fluxo de Caixa
const Financeiro = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // Verifica se o usuário é admin
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';
  
  // Inicializar sincronização automática
  useAutoSync();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  });
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [transacaoParaEditar, setTransacaoParaEditar] = useState<Transacao | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [valoresRestantes, setValoresRestantes] = useState(0);
  const [transacoesRestantes, setTransacoesRestantes] = useState<any[]>([]);
  const [transacoesEntradas, setTransacoesEntradas] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Estado para mensagem da correção
  const [mensagemCorrecao, setMensagemCorrecao] = useState<string | null>(null);

  // Usar hook personalizado para gerenciar todos os dados financeiros
  const { 
    transactions, 
    resumoFinanceiro, 
    despesas, 
    isLoading 
  } = useFinanceiroData({
      typeFilter, 
    dateRange,
      categoryFilter,
    searchQuery
  });

  // Filtrar e agrupar as transações e despesas com verificação de segurança
  const allGroupedTransactions = React.useMemo(() => {
    try {
      return groupTransactionsByMonth(transactions || [], despesas || [], transacoesRestantes, transacoesEntradas);
    } catch (error) {
      // console.error('[Financeiro] Erro ao agrupar transações:', error); // Removido para produção
      return [];
    }
  }, [transactions, despesas, transacoesRestantes, transacoesEntradas]);
  
  const groupedTransactions = React.useMemo(() => {
    try {
      return applyAllFilters(allGroupedTransactions, { dateRange, typeFilter, categoryFilter });
    } catch (error) {
      // console.error('[Financeiro] Erro ao aplicar filtros:', error); // Removido para produção
      return [];
    }
  }, [allGroupedTransactions, dateRange, typeFilter, categoryFilter]);
  
  // Usar hook personalizado para gerenciar todas as ações financeiras
  const {
    handleEditTransaction,
    handleTransactionSuccess,
    handleExportClick,
    handleCorrigirTransacoesDiogo,
    handleSincronizarEventosFinanceiro,
    isLoadingSecondaryData
  } = useFinanceiroActions(
    groupedTransactions,
    setTransacaoParaEditar,
    setIsTransactionModalOpen,
    setMensagemCorrecao,
    setTransacoesRestantes,
    setTransacoesEntradas
  );

  // Estado de carregamento unificado
  const isFullyLoaded = !isLoading && !isLoadingSecondaryData;

  
  // Calcular valores do balanço usando a função utilitária com verificação de segurança
  const { totalReceitas, totalDespesas, saldo, totalAReceber, totalEntradas } = React.useMemo(() => {
    // Guard clause para proteger contra dados inválidos ou não prontos
    if (!Array.isArray(groupedTransactions) || !resumoFinanceiro || !Array.isArray(transactions) || !Array.isArray(transacoesRestantes) || !Array.isArray(transacoesEntradas)) {
      return { totalReceitas: 0, totalDespesas: 0, saldo: 0, totalAReceber: 0, totalEntradas: 0 };
    }
    try {
      return calcularTotaisDosFiltros(
        groupedTransactions,
        resumoFinanceiro,
        transactions || [],
        transacoesRestantes,
        transacoesEntradas,
        { typeFilter, dateRange, categoryFilter }
      );
    } catch (error) {
      // console.error('[Financeiro] Erro ao calcular totais:', error); // Removido para produção
      return {
        totalReceitas: 0,
        totalDespesas: 0,
        saldo: 0,
        totalAReceber: 0,
        totalEntradas: 0
      };
    }
  }, [groupedTransactions, resumoFinanceiro, transactions, transacoesRestantes, transacoesEntradas, typeFilter, dateRange, categoryFilter]);

  // Função para limpar todos os filtros
  const handleClearAllFilters = () => {
    setDateRange({start: null, end: null});
    setCategoryFilter([]);
    setTypeFilter('all');
  };

  // Verificação adicional para prevenir o erro React #31
  if (!user) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6 financeiro-container" data-page="financeiro">
        <FinanceiroHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          isFilterDialogOpen={isFilterDialogOpen}
          setIsFilterDialogOpen={setIsFilterDialogOpen}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
          onExportClick={handleExportClick}
          transacaoParaEditar={transacaoParaEditar}
          onTransactionSuccess={handleTransactionSuccess}
          isTransactionModalOpen={isTransactionModalOpen}
          setIsTransactionModalOpen={setIsTransactionModalOpen}
        />

        {/* Mostrar mensagem da correção quando houver */}
        {mensagemCorrecao && (
          <Alert className="mb-4 border-blue-500">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Sincronização Agenda ↔ Financeiro</AlertTitle>
            <AlertDescription>
              {mensagemCorrecao}
            </AlertDescription>
          </Alert>
        )}

        {/* Filtros ativos */}
        <ActiveFiltersDisplay
          dateRange={dateRange}
          typeFilter={typeFilter}
          categoryFilter={categoryFilter}
          onClearAllFilters={handleClearAllFilters}
        />

        {/* Cards de resumo */}
        <SummaryCards 
          totalEntradas={totalEntradas}
          totalAReceber={totalAReceber}
          totalDespesas={totalDespesas}
          saldo={saldo}
          formatarMoeda={formatarMoeda}
          isAdmin={isAdmin}
        />

        {/* Estado de carregamento unificado */}
        {!isFullyLoaded ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p>Carregando transações...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Transações agrupadas por mês */}
            <div className="space-y-6">
              {groupedTransactions.length > 0 ? (
                groupedTransactions.map((group, index) => (
                  <TransactionGroupCard
                    key={index}
                    group={group}
                    onEditTransaction={handleEditTransaction}
                            formatarMoeda={formatarMoeda}
                            formatDate={formatDate}
                          />
                ))
              ) : (
                <Card>
                  <CardContent className="py-10 text-center text-gray-500">
                    Nenhuma transação encontrada com os filtros selecionados.
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default Financeiro;

