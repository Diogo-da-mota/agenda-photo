import { supabase } from '@/lib/supabase';
import { buscarTransacoes, buscarDespesas, buscarResumoFinanceiro } from '@/services/financeiroService';
import { buscarEventosComValoresEntradas, buscarEventosComValoresRestantes } from '@/services/agendaService';

export interface RelatorioData {
  id?: string;
  user_id: string;
  tipo: string;
  periodo: string;
  receita_total: number;
  despesas_total: number;
  lucro_liquido: number;
  dados_detalhados?: any;
  criado_em?: string;
}

export const reportsService = {
  // Função para salvar relatório
  async salvarRelatorio(relatorio: RelatorioData): Promise<void> {
    const { error } = await supabase
      .from('relatorios')
      .insert([relatorio]);

    if (error) {
      console.error('Erro ao salvar relatório:', error);
      throw error;
    }
  },

  // Função para carregar relatórios
  async carregarRelatorios(userId: string): Promise<RelatorioData[]> {
    const { data, error } = await supabase
      .from('relatorios')
      .select('*')
      .eq('user_id', userId)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao carregar relatórios:', error);
      throw error;
    }

    return data || [];
  },

  // Função para buscar clientes duplicados
  async buscarClientesDuplicados(userId: string): Promise<any[]> {
    try {
      // Buscar diretamente do banco com todos os campos necessários
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('id, nome, valor_evento, evento, telefone, user_id')
        .eq('user_id', userId)
        .order('nome');
      
      if (error) {
        console.error('[DEBUG] Erro na consulta:', error);
        throw error;
      }
      
      if (!clientes || clientes.length === 0) {
        return [];
      }
      
      // Contar ocorrências de cada nome e somar valores
      const contagemNomes: { [key: string]: number } = {};
      const valoresNomes: { [key: string]: number } = {};
      
      clientes.forEach(cliente => {
        const nome = cliente.nome?.trim();
        if (nome) {
          contagemNomes[nome] = (contagemNomes[nome] || 0) + 1;
          
          // Converter valor_evento para número e somar
          const valor = Number(cliente.valor_evento) || 0;
          valoresNomes[nome] = (valoresNomes[nome] || 0) + valor;
        }
      });
      
      // Filtrar apenas nomes que aparecem mais de uma vez
      const duplicados = Object.entries(contagemNomes)
        .filter(([nome, count]) => count > 1)
        .map(([nome, count]) => ({
          nome,
          valor: valoresNomes[nome],
          ocorrencias: count
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5); // Pegar apenas os 5 primeiros
      
      return duplicados;
    } catch (error) {
      console.error('Erro ao buscar clientes duplicados:', error);
      return [];
    }
  },

  // Função para carregar dados financeiros do ano atual
  async carregarDadosAnoAtual(userId: string) {
    const anoAtual = new Date().getFullYear();
    const inicioAno = new Date(anoAtual, 0, 1);
    const fimAno = new Date(anoAtual, 11, 31, 23, 59, 59, 999);
    
    // Buscar transações
    const todasTransacoes = await buscarTransacoes(userId, {
      dataInicio: inicioAno,
      dataFim: fimAno
    });
    
    const transacoesEntrada = todasTransacoes.filter(t => t.tipo === 'receita' && t.status === 'entrada');
    const totalTransacoesEntrada = transacoesEntrada.reduce((sum, t) => sum + t.valor, 0);
    
    // Buscar valores de entrada da agenda
    const eventosEntradas = await buscarEventosComValoresEntradas(userId);
    const eventosEntradasAnoAtual = eventosEntradas.filter(evento => {
      const dataEvento = new Date(evento.data_transacao);
      return dataEvento >= inicioAno && dataEvento <= fimAno;
    });
    const totalEventosEntradas = eventosEntradasAnoAtual.reduce((sum, e) => sum + e.valor, 0);
    
    const totalEntradas = totalTransacoesEntrada + totalEventosEntradas;
    
    // Buscar valores restantes
    const transacoesRestantes = todasTransacoes.filter(t => t.tipo === 'receita' && t.status === 'restante');
    const totalTransacoesRestantes = transacoesRestantes.reduce((sum, t) => sum + t.valor, 0);
    
    const eventosRestantes = await buscarEventosComValoresRestantes(userId);
    const eventosRestantesAnoAtual = eventosRestantes.filter(evento => {
      const dataEvento = new Date(evento.data_transacao);
      return dataEvento >= inicioAno && dataEvento <= fimAno;
    });
    const totalEventosRestantes = eventosRestantesAnoAtual.reduce((sum, e) => sum + e.valor, 0);
    
    const totalAReceber = totalTransacoesRestantes + totalEventosRestantes;
    
    // Receita total
    const receitaTotalAnoAtual = totalEntradas + totalAReceber;
    
    // Buscar despesas
    const resumo = await buscarResumoFinanceiro(userId, {
      dataInicio: inicioAno,
      dataFim: fimAno
    });
    
    // Calcular lucro líquido
    const lucroLiquido = receitaTotalAnoAtual - resumo.totalDespesas;
    
    return {
      receitaTotal: receitaTotalAnoAtual,
      despesasTotal: resumo.totalDespesas,
      lucroLiquido
    };
  }
};