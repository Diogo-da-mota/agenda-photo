import { supabase } from '@/lib/supabase';

export interface Indicacao {
  id: string;
  user_id: string;
  cliente_indicador_id: string | null;
  cliente_indicado_id: string | null;
  nome_indicado: string;
  email_indicado: string;
  telefone_indicado: string;
  status: 'pendente' | 'convertido' | 'expirado';
  data_indicacao: string;
  data_conversao: string | null;
  observacoes: string | null;
  codigo_referencia: string;
  link_indicacao: string;
}

export const indicacoesService = {
  // Busca todas as indicações do usuário
  async listarIndicacoes(userId: string): Promise<Indicacao[]> {
    const { data, error } = await supabase
      .from('indicacoes')
      .select('*')
      .eq('user_id', userId)
      .order('data_indicacao', { ascending: false });

    if (error) {
      console.error('Erro ao listar indicações:', error);
      throw error;
    }

    return data || [];
  },

  // Cria uma nova indicação
  async criarIndicacao(dados: Omit<Indicacao, 'id' | 'codigo_referencia' | 'link_indicacao'>): Promise<Indicacao> {
    const { data, error } = await supabase
      .from('indicacoes')
      .insert([dados])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar indicação:', error);
      throw error;
    }

    return data;
  },

  // Atualiza uma indicação
  async atualizarIndicacao(id: string, dados: Partial<Indicacao>): Promise<Indicacao> {
    const { data, error } = await supabase
      .from('indicacoes')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar indicação:', error);
      throw error;
    }

    return data;
  },

  // Busca uma indicação pelo código de referência
  async buscarPorCodigo(codigo: string): Promise<Indicacao | null> {
    const { data, error } = await supabase
      .from('indicacoes')
      .select('*')
      .eq('codigo_referencia', codigo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Erro ao buscar indicação:', error);
      throw error;
    }

    return data;
  },

  // Busca estatísticas das indicações do usuário
  async buscarEstatisticas(userId: string): Promise<{
    total: number;
    convertidas: number;
    pendentes: number;
    nivel: number;
    proximoNivel: number;
    faltamParaProximo: number;
  }> {
    const { data, error } = await supabase
      .from('indicacoes')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }

    const total = data.length;
    const convertidas = data.filter(i => i.status === 'convertido').length;
    const pendentes = data.filter(i => i.status === 'pendente').length;

    // Calcula o nível baseado no número de indicações convertidas
    let nivel = 1;
    let proximoNivel = 3;
    let faltamParaProximo = 3;

    if (convertidas >= 30) {
      nivel = 4;
      proximoNivel = 30;
      faltamParaProximo = 0;
    } else if (convertidas >= 5) {
      nivel = 3;
      proximoNivel = 30;
      faltamParaProximo = 30 - convertidas;
    } else if (convertidas >= 3) {
      nivel = 2;
      proximoNivel = 5;
      faltamParaProximo = 5 - convertidas;
    } else {
      faltamParaProximo = 3 - convertidas;
    }

    return {
      total,
      convertidas,
      pendentes,
      nivel,
      proximoNivel,
      faltamParaProximo
    };
  }
}; 