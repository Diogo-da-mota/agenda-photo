import { supabase } from '@/lib/supabase';

export interface Relatorio {
  id?: string;
  user_id: string;
  tipo: 'mensal' | 'categoria' | 'cliente' | 'trimestral' | 'anual';
  periodo: string;
  dados: any;
  receita_total: number;
  despesas_total: number;
  categoria?: string;
  cliente_id?: string;
  status?: 'ativo' | 'arquivado' | 'excluido';
  observacoes?: string;
  criado_em?: Date;
  atualizado_em?: Date;
}

export const salvarRelatorio = async (relatorio: Omit<Relatorio, 'id' | 'criado_em' | 'atualizado_em'>) => {
  const { data, error } = await supabase
    .from('relatorios')
    .upsert([relatorio], {
      onConflict: 'user_id,tipo,periodo',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const buscarRelatorios = async (userId: string, filtros?: {
  tipo?: Relatorio['tipo'];
  periodo?: string;
  status?: Relatorio['status'];
}) => {
  let query = supabase
    .from('relatorios')
    .select('*')
    .eq('user_id', userId)
    .eq('status', filtros?.status || 'ativo');

  if (filtros?.tipo) {
    query = query.eq('tipo', filtros.tipo);
  }

  if (filtros?.periodo) {
    query = query.eq('periodo', filtros.periodo);
  }

  const { data, error } = await query.order('criado_em', { ascending: false });

  if (error) throw error;
  return data;
};

export const excluirRelatorio = async (id: string) => {
  const { error } = await supabase
    .from('relatorios')
    .update({ status: 'excluido' })
    .eq('id', id);

  if (error) throw error;
};

export const arquivarRelatorio = async (id: string) => {
  const { error } = await supabase
    .from('relatorios')
    .update({ status: 'arquivado' })
    .eq('id', id);

  if (error) throw error;
};

export const formatarPeriodo = (data: Date, tipo: Relatorio['tipo']): string => {
  const ano = data.getFullYear();
  const mes = data.getMonth() + 1;
  
  switch (tipo) {
    case 'mensal':
      return `${ano}-${mes.toString().padStart(2, '0')}`;
    case 'trimestral':
      const trimestre = Math.floor((mes - 1) / 3) + 1;
      return `${ano}-T${trimestre}`;
    case 'anual':
      return ano.toString();
    default:
      return `${ano}-${mes.toString().padStart(2, '0')}`;
  }
}; 