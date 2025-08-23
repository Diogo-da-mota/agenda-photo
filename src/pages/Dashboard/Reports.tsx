import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Removido import de Tabs - não será mais usado
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componentes extraídos
import { ReportsHeader } from './components/Reports/ReportsHeader';
import { KPICards } from './components/Reports/KPICards';
import { RevenueExpenseChart } from './components/Reports/RevenueExpenseChart';
import { CategoryChart } from './components/Reports/CategoryChart';
import { TopClientsChart } from './components/Reports/TopClientsChart';
import { PeriodAnalysis } from './components/Reports/PeriodAnalysis';
import { SavedReports } from './components/Reports/SavedReports';

// Serviços
import { reportsService, RelatorioData } from '@/services/reportsService';
import { buscarEventosComValoresEntradas, buscarEventosComValoresRestantes, buscarEventos } from '@/services/agendaService';
import { buscarTransacoes } from '@/services/financeiroService';
import { buscarDespesas } from '@/services/financeiroDespesasService';
import { salvarRelatorio, buscarRelatorios, formatarPeriodo } from '@/services/relatoriosService';
import { buscarResumoFinanceiro } from '@/services/financeiroService';
import type { Relatorio } from '@/services/relatoriosService';

// Dados mock para fallback
const monthlyData = [
  { name: 'Jan', receita: 8500, despesas: 3200 },
  { name: 'Fev', receita: 7800, despesas: 3100 },
  { name: 'Mar', receita: 9200, despesas: 3500 },
  { name: 'Abr', receita: 10500, despesas: 3800 },
  { name: 'Mai', receita: 11200, despesas: 4100 },
  { name: 'Jun', receita: 10800, despesas: 4000 },
  { name: 'Jul', receita: 12500, despesas: 4500 },
  { name: 'Ago', receita: 13200, despesas: 4800 },
  { name: 'Set', receita: 12800, despesas: 4600 },
  { name: 'Out', receita: 14500, despesas: 5100 },
  { name: 'Nov', receita: 15200, despesas: 5400 },
  { name: 'Dez', receita: 16800, despesas: 5800 },
];

const categoryData = [
  { nome: 'Sessões de Retrato', valor: 8500 },
  { nome: 'Casamentos', valor: 5500 },
  { nome: 'Eventos Corporativos', valor: 3800 },
  { nome: 'Produtos Físicos', valor: 1200 },
  { nome: 'Outros', valor: 800 },
];

const Reports: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estados
  const [period, setPeriod] = useState('monthly');
  const [category, setCategory] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [receitaTotal, setReceitaTotal] = useState<number | null>(null);
  const [despesasTotal, setDespesasTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [dadosMensaisReais, setDadosMensaisReais] = useState<any[]>([]);
  const [dadosTrimestraisReais, setDadosTrimestraisReais] = useState<any[]>([]);
  const [dadosAnuaisReais, setDadosAnuaisReais] = useState<any[]>([]);
  const [dadosCategoriaReais, setDadosCategoriaReais] = useState<any[]>([]);
  const [clientesDuplicados, setClientesDuplicados] = useState<any[]>([]);

  // Funções de manipulação
  const handleExport = (format: 'pdf' | 'excel') => {
    setTimeout(() => {
      toast({
        title: "Exportação concluída",
        description: `Relatório em ${format === 'pdf' ? 'PDF' : 'Excel'} exportado com sucesso.`,
      });
    }, 2000);
  };

  const handleSaveReport = async (tipo: Relatorio['tipo']) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      let dados;
      let receita_total = 0;
      let despesas_total = 0;
      
      switch (tipo) {
        case 'mensal':
          dados = dadosMensaisReais.length > 0 ? dadosMensaisReais : monthlyData;
          receita_total = (dadosMensaisReais.length > 0 ? dadosMensaisReais : monthlyData).reduce((acc, item) => acc + item.receita, 0);
          despesas_total = (dadosMensaisReais.length > 0 ? dadosMensaisReais : monthlyData).reduce((acc, item) => acc + item.despesas, 0);
          break;
        case 'categoria':
          dados = dadosCategoriaReais.length > 0 ? dadosCategoriaReais : categoryData;
          receita_total = (dadosCategoriaReais.length > 0 ? dadosCategoriaReais : categoryData).reduce((acc, item) => acc + item.valor, 0);
          break;
        case 'cliente':
          dados = clientesDuplicados;
          receita_total = clientesDuplicados.reduce((acc, item) => acc + item.valor, 0);
          break;
        default:
          throw new Error('Tipo de relatório inválido');
      }

      const novoRelatorio: Omit<Relatorio, 'id' | 'criado_em' | 'atualizado_em'> = {
        user_id: user.id,
        tipo,
        periodo: formatarPeriodo(new Date(), tipo),
        dados,
        receita_total,
        despesas_total,
        status: 'ativo'
      };

      await salvarRelatorio(novoRelatorio);
      await carregarRelatorios();

    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o relatório.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const carregarRelatorios = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await buscarRelatorios(user.id);
      setRelatorios(data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os relatórios.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buscarClientesDuplicados = async () => {
    if (!user) return;
    
    try {
      const duplicados = await reportsService.buscarClientesDuplicados(user.id);
      setClientesDuplicados(duplicados);
    } catch (error) {
      console.error('Erro ao buscar clientes duplicados:', error);
    }
  };

  const carregarDadosFinanceirosAnoAtual = async () => {
    if (!user) return;
    
    try {
      const dados = await reportsService.carregarDadosAnoAtual(user.id);
      setReceitaTotal(dados.receitaTotal);
      setDespesasTotal(dados.despesasTotal);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    }
  };

  const carregarDadosMensaisReais = async () => {
    if (!user) return;
    
    try {
      const anoAtual = new Date().getFullYear();
      const dadosMensais = [];
      
      for (let mes = 0; mes < 12; mes++) {
        const inicioMes = new Date(anoAtual, mes, 1);
        const fimMes = new Date(anoAtual, mes + 1, 0, 23, 59, 59, 999);
        
        const resumo = await buscarResumoFinanceiro(user.id, {
          dataInicio: inicioMes,
          dataFim: fimMes
        });
        
        const transacoes = await buscarTransacoes(user.id, {
          dataInicio: inicioMes,
          dataFim: fimMes
        });
        
        const eventosEntradas = await buscarEventosComValoresEntradas(user.id);
        const eventosEntradasMes = eventosEntradas.filter(evento => {
          const dataEvento = new Date(evento.data_transacao);
          return dataEvento >= inicioMes && dataEvento <= fimMes;
        });
        
        const totalTransacoes = transacoes
          .filter(t => t.tipo === 'receita' && t.status === 'entrada')
          .reduce((sum, t) => sum + t.valor, 0);
        
        const totalEventos = eventosEntradasMes.reduce((sum, e) => sum + e.valor, 0);
        const receitaMes = totalTransacoes + totalEventos;
        
        dadosMensais.push({
          name: format(inicioMes, 'MMM', { locale: ptBR }),
          receita: receitaMes,
          despesas: resumo.totalDespesas
        });
      }
      
      setDadosMensaisReais(dadosMensais);
    } catch (error) {
      console.error('Erro ao carregar dados mensais:', error);
    }
  };

  const carregarDadosCategoriaReais = async () => {
    if (!user) return;
    
    try {
      const anoAtual = new Date().getFullYear();
      const inicioAno = new Date(anoAtual, 0, 1);
      const fimAno = new Date(anoAtual, 11, 31, 23, 59, 59, 999);
      
      // Buscar transações financeiras
      const transacoes = await buscarTransacoes(user.id, {
        dataInicio: inicioAno,
        dataFim: fimAno
      });
      
      // Buscar eventos do ano atual
      const eventos = await buscarEventos(user.id);
      const eventosAnoAtual = eventos.filter(evento => {
        const dataEvento = new Date(evento.date || evento.data_inicio);
        return dataEvento >= inicioAno && dataEvento <= fimAno;
      });
      
      // Agrupar transações por categoria
      const categoriasTransacoes = transacoes
        .filter(t => t.tipo === 'receita')
        .reduce((acc, transacao) => {
          const categoria = transacao.categoria || 'Outros';
          if (!acc[categoria]) {
            acc[categoria] = { valor: 0, quantidade: 0 };
          }
          acc[categoria].valor += transacao.valor;
          acc[categoria].quantidade += 1;
          return acc;
        }, {} as Record<string, { valor: number; quantidade: number }>);
      
      // Agrupar eventos por tipo
      const categoriasEventos = eventosAnoAtual.reduce((acc, evento) => {
        const categoria = evento.eventType || evento.tipo || evento.titulo || 'Outros';
        const valorEvento = (evento.totalValue || evento.valor_total || 0) + 
                           (evento.downPayment || evento.valor_entrada || 0) + 
                           (evento.remainingValue || evento.valor_restante || 0);
        
        if (!acc[categoria]) {
          acc[categoria] = { valor: 0, quantidade: 0 };
        }
        acc[categoria].valor += valorEvento;
        acc[categoria].quantidade += 1;
        return acc;
      }, {} as Record<string, { valor: number; quantidade: number }>);
      
      // Combinar dados de transações e eventos
      const todasCategorias = { ...categoriasTransacoes };
      
      Object.entries(categoriasEventos).forEach(([categoria, dados]) => {
        if (!todasCategorias[categoria]) {
          todasCategorias[categoria] = { valor: 0, quantidade: 0 };
        }
        todasCategorias[categoria].valor += dados.valor;
        todasCategorias[categoria].quantidade += dados.quantidade;
      });
      
      const dadosCategoria = Object.entries(todasCategorias).map(([nome, dados]) => ({
        nome,
        valor: dados.valor,
        quantidade: dados.quantidade
      }));
      
      setDadosCategoriaReais(dadosCategoria);
    } catch (error) {
      console.error('Erro ao carregar dados de categoria:', error);
    }
  };

  // Efeitos
  useEffect(() => {
    if (user) {
      carregarRelatorios();
      carregarDadosFinanceirosAnoAtual();
      carregarDadosMensaisReais();
      carregarDadosCategoriaReais();
      buscarClientesDuplicados();
    }
  }, [user]);

  // Cálculos derivados
  const lucroLiquido = (receitaTotal || 0) - (despesasTotal || 0);
  const anoAtual = new Date().getFullYear();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <ReportsHeader
        isSaving={isSaving}
        handleSaveReport={handleSaveReport}
        handleExport={handleExport}
        category={category}
        setCategory={setCategory}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
      />

      <KPICards
        receitaTotal={receitaTotal}
        despesasTotal={despesasTotal}
        lucroLiquido={lucroLiquido}
        isLoading={isLoading}
        formatarMoeda={formatCurrency}
        obterAnoAtual={() => anoAtual}
      />

      {/* Card grande: Receita vs. Despesas no topo */}
      <div className="w-full">
        <RevenueExpenseChart
          period={period}
          setPeriod={setPeriod}
          obterDadosPorPeriodo={() => {
            switch (period) {
              case 'monthly':
                return dadosMensaisReais.length > 0 ? dadosMensaisReais : monthlyData;
              case 'quarterly':
                return dadosTrimestraisReais.length > 0 ? dadosTrimestraisReais : [
                  { name: 'Q1', receita: 25500, despesas: 9800 },
                  { name: 'Q2', receita: 32500, despesas: 11900 },
                  { name: 'Q3', receita: 38500, despesas: 13900 },
                  { name: 'Q4', receita: 46500, despesas: 16300 }
                ];
              case 'yearly':
                return dadosAnuaisReais.length > 0 ? dadosAnuaisReais : [
                  { name: '2022', receita: 120000, despesas: 45000 },
                  { name: '2023', receita: 143000, despesas: 51900 },
                  { name: '2024', receita: 165000, despesas: 58200 }
                ];
              default:
                return dadosMensaisReais.length > 0 ? dadosMensaisReais : monthlyData;
            }
          }}
        />
      </div>

      {/* Cards lado a lado: Receita por Categoria e Principais Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart
          dadosCategoriaReais={dadosCategoriaReais}
          categoryData={categoryData}
        />
        <TopClientsChart
          clientesDuplicados={clientesDuplicados}
          buscarClientesDuplicados={buscarClientesDuplicados}
        />
      </div>

      {/* Card grande: Tendência de Receita no final */}
      <div className="w-full">
        <PeriodAnalysis
          dadosMensaisReais={dadosMensaisReais}
          dadosTrimestraisReais={dadosTrimestraisReais}
          dadosAnuaisReais={dadosAnuaisReais}
          monthlyData={monthlyData}
        />
      </div>

      <SavedReports
        relatorios={relatorios}
        isLoading={isLoading}
        formatarMoeda={formatCurrency}
      />
    </div>
  );
};

export default Reports;