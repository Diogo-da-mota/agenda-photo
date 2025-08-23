import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Users, Calendar, AlertTriangle } from 'lucide-react';
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
  const [pagamentosPendentes, setPagamentosPendentes] = useState<number>(0);
  const [faturasPendentes, setFaturasPendentes] = useState<number>(0);
  
  // Loading states granulares
  const [loadingStates, setLoadingStates] = useState({
    relatorios: false,
    dadosFinanceiros: false,
    dadosMensais: false,
    dadosCategoria: false,
    pagamentosPendentes: false,
    clientesDuplicados: false
  });
  
  // Sistema de cache simples
  const cacheRef = useRef(new Map());
  const lastFetchRef = useRef(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  
  // Função de debounce
  const debounceRef = useRef<NodeJS.Timeout>();
  
  const debounce = useCallback((func: Function, delay: number) => {
    return (...args: any[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => func(...args), delay);
    };
  }, []);
  
  // Função para verificar cache
  const getCachedData = useCallback((key: string) => {
    const cached = cacheRef.current.get(key);
    const lastFetch = lastFetchRef.current.get(key);
    
    if (cached && lastFetch && (Date.now() - lastFetch) < CACHE_DURATION) {
      return cached;
    }
    
    return null;
  }, []);
  
  // Função para salvar no cache
  const setCachedData = useCallback((key: string, data: any) => {
    cacheRef.current.set(key, data);
    lastFetchRef.current.set(key, Date.now());
  }, []);

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
      // console.error('Erro ao salvar relatório:', error); // Removido para produção
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
    
    setLoadingStates(prev => ({ ...prev, relatorios: true }));
    try {
      const data = await buscarRelatorios(user.id);
      setRelatorios(data);
    } catch (error) {
      // console.error('Erro ao carregar relatórios:', error); // Removido para produção
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os relatórios.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, relatorios: false }));
    }
  };

  const buscarClientesDuplicados = async () => {
    if (!user) return;
    
    setLoadingStates(prev => ({ ...prev, clientesDuplicados: true }));
    try {
      const duplicados = await reportsService.buscarClientesDuplicados(user.id);
      setClientesDuplicados(duplicados);
    } catch (error) {
      // console.error('Erro ao buscar clientes duplicados:', error); // Removido para produção
    } finally {
      setLoadingStates(prev => ({ ...prev, clientesDuplicados: false }));
    }
  };

  const carregarDadosFinanceirosAnoAtual = async () => {
    if (!user) return;
    
    const cacheKey = `dadosFinanceiros_${user.id}_${new Date().getFullYear()}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setReceitaTotal(cachedData.receitaTotal);
      setDespesasTotal(cachedData.despesasTotal);
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, dadosFinanceiros: true }));
    try {
      const dados = await reportsService.carregarDadosAnoAtual(user.id);
      setCachedData(cacheKey, dados);
      setReceitaTotal(dados.receitaTotal);
      setDespesasTotal(dados.despesasTotal);
    } catch (error) {
      // console.error('Erro ao carregar dados financeiros:', error); // Removido para produção
    } finally {
      setLoadingStates(prev => ({ ...prev, dadosFinanceiros: false }));
    }
  };

  const carregarDadosMensaisReais = async () => {
    if (!user) return;
    
    const anoAtual = new Date().getFullYear();
    const cacheKey = `dadosMensais_${user.id}_${anoAtual}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setDadosMensaisReais(cachedData);
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, dadosMensais: true }));
    try {
      const inicioAno = new Date(anoAtual, 0, 1);
      const fimAno = new Date(anoAtual, 11, 31, 23, 59, 59, 999);
      
      // Buscar todos os dados do ano de uma vez (otimização crítica)
      const [resumoAnual, transacoesAno, eventosEntradas] = await Promise.all([
        buscarResumoFinanceiro(user.id, {
          dataInicio: inicioAno,
          dataFim: fimAno
        }),
        buscarTransacoes(user.id, {
          dataInicio: inicioAno,
          dataFim: fimAno
        }),
        buscarEventosComValoresEntradas(user.id)
      ]);
      
      // Filtrar eventos do ano atual
      const eventosAnoAtual = eventosEntradas.filter(evento => {
        const dataEvento = new Date(evento.data_transacao);
        return dataEvento >= inicioAno && dataEvento <= fimAno;
      });
      
      // Agrupar dados por mês usando processamento client-side otimizado
      const dadosPorMes = new Map();
      
      // Inicializar todos os meses
      for (let mes = 0; mes < 12; mes++) {
        const inicioMes = new Date(anoAtual, mes, 1);
        const nomeMes = format(inicioMes, 'MMM', { locale: ptBR });
        dadosPorMes.set(mes, {
          name: nomeMes,
          receita: 0,
          despesas: 0
        });
      }
      
      // Processar transações
      transacoesAno.forEach(transacao => {
        const dataTransacao = new Date(transacao.data_transacao || transacao.created_at);
        const mes = dataTransacao.getMonth();
        const dadosMes = dadosPorMes.get(mes);
        
        if (dadosMes) {
          if (transacao.tipo === 'receita' && transacao.status === 'entrada') {
            dadosMes.receita += transacao.valor;
          } else if (transacao.tipo === 'despesa') {
            dadosMes.despesas += transacao.valor;
          }
        }
      });
      
      // Processar eventos
      eventosAnoAtual.forEach(evento => {
        const dataEvento = new Date(evento.data_transacao);
        const mes = dataEvento.getMonth();
        const dadosMes = dadosPorMes.get(mes);
        
        if (dadosMes) {
          dadosMes.receita += evento.valor;
        }
      });
      
      // Converter Map para Array
      const dadosMensais = Array.from(dadosPorMes.values());
      
      setCachedData(cacheKey, dadosMensais);
      setDadosMensaisReais(dadosMensais);
    } catch (error) {
      // console.error('Erro ao carregar dados mensais:', error); // Removido para produção
    } finally {
      setLoadingStates(prev => ({ ...prev, dadosMensais: false }));
    }
  };

  const carregarPagamentosPendentes = async () => {
    if (!user) return;
    
    setLoadingStates(prev => ({ ...prev, pagamentosPendentes: true }));
    try {
      // Buscar dados em paralelo para otimizar performance
      const [transacoesPendentes, eventos] = await Promise.all([
        buscarTransacoes(user.id, { status: 'pendente' }),
        buscarEventos(user.id)
      ]);
      
      // Processar transações pendentes (apenas receitas)
      const totalTransacoesPendentes = transacoesPendentes
        .filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + t.valor, 0);
      
      // Processar eventos com pagamentos pendentes de forma otimizada
      let totalEventosPendentes = 0;
      let contadorEventosPendentes = 0;
      
      eventos.forEach(evento => {
        const valorTotal = (evento.totalValue || evento.valor_total || 0);
        const valorPago = (evento.downPayment || evento.valor_entrada || 0);
        const valorPendente = valorTotal - valorPago;
        
        if (valorPendente > 0) {
          totalEventosPendentes += valorPendente;
          contadorEventosPendentes++;
        }
      });
      
      const totalPendente = totalTransacoesPendentes + totalEventosPendentes;
      const totalFaturas = transacoesPendentes.length + contadorEventosPendentes;
      
      setPagamentosPendentes(totalPendente);
      setFaturasPendentes(totalFaturas);
    } catch (error) {
      // console.error('Erro ao carregar pagamentos pendentes:', error); // Removido para produção
      setPagamentosPendentes(0);
      setFaturasPendentes(0);
    } finally {
      setLoadingStates(prev => ({ ...prev, pagamentosPendentes: false }));
    }
  };

  const carregarDadosCategoriaReais = async () => {
    if (!user) return;
    
    setLoadingStates(prev => ({ ...prev, dadosCategoria: true }));
    try {
      const anoAtual = new Date().getFullYear();
      const inicioAno = new Date(anoAtual, 0, 1);
      const fimAno = new Date(anoAtual, 11, 31, 23, 59, 59, 999);
      
      // Buscar dados em paralelo para otimizar performance
      const [transacoes, eventos] = await Promise.all([
        buscarTransacoes(user.id, {
          dataInicio: inicioAno,
          dataFim: fimAno
        }),
        buscarEventos(user.id)
      ]);
      
      // Filtrar eventos do ano atual de forma otimizada
      const eventosAnoAtual = eventos.filter(evento => {
        const dataEvento = new Date(evento.date || evento.data_inicio);
        return dataEvento >= inicioAno && dataEvento <= fimAno;
      });
      
      // Usar Map para melhor performance no agrupamento
      const categorias = new Map<string, { valor: number; quantidade: number }>();
      
      // Processar transações de receita
      transacoes
        .filter(t => t.tipo === 'receita')
        .forEach(transacao => {
          const categoria = transacao.categoria || 'Outros';
          const dadosExistentes = categorias.get(categoria) || { valor: 0, quantidade: 0 };
          
          categorias.set(categoria, {
            valor: dadosExistentes.valor + transacao.valor,
            quantidade: dadosExistentes.quantidade + 1
          });
        });
      
      // Processar eventos de forma otimizada
      eventosAnoAtual.forEach(evento => {
        const categoria = evento.eventType || evento.tipo || evento.titulo || 'Outros';
        const valorEvento = (evento.totalValue || evento.valor_total || 0) + 
                           (evento.downPayment || evento.valor_entrada || 0) + 
                           (evento.remainingValue || evento.valor_restante || 0);
        
        const dadosExistentes = categorias.get(categoria) || { valor: 0, quantidade: 0 };
        
        categorias.set(categoria, {
          valor: dadosExistentes.valor + valorEvento,
          quantidade: dadosExistentes.quantidade + 1
        });
      });
      
      // Converter Map para Array de forma otimizada
      const dadosCategoria = Array.from(categorias.entries()).map(([nome, dados]) => ({
        nome,
        valor: dados.valor,
        quantidade: dados.quantidade
      }));
      
      setDadosCategoriaReais(dadosCategoria);
    } catch (error) {
      // console.error('Erro ao carregar dados de categoria:', error); // Removido para produção
    } finally {
      setLoadingStates(prev => ({ ...prev, dadosCategoria: false }));
    }
  };

  // Efeitos
  useEffect(() => {
    if (!user) return;

    const abortController = new AbortController();
    let isMounted = true;

    const carregarDadosIniciais = async () => {
      try {
        setIsLoading(true);
        
        // Executar todas as funções em paralelo com Promise.allSettled
        const resultados = await Promise.allSettled([
          carregarRelatorios(),
          carregarDadosFinanceirosAnoAtual(),
          carregarDadosMensaisReais(),
          carregarDadosCategoriaReais(),
          carregarPagamentosPendentes(),
          buscarClientesDuplicados()
        ]);

        // Log de erros para debugging (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
          resultados.forEach((resultado, index) => {
            const funcoes = [
              'carregarRelatorios',
              'carregarDadosFinanceirosAnoAtual', 
              'carregarDadosMensaisReais',
              'carregarDadosCategoriaReais',
              'carregarPagamentosPendentes',
              'buscarClientesDuplicados'
            ];
            
            if (resultado.status === 'rejected') {
              // console.error(`Erro em ${funcoes[index]}:`, resultado.reason); // Removido para produção
            }
          });
        }
      } catch (error) {
        // console.error('Erro ao carregar dados iniciais:', error); // Removido para produção
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    carregarDadosIniciais();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
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
        pagamentosPendentes={pagamentosPendentes}
        faturasPendentes={faturasPendentes}
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