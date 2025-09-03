import { supabase } from '@/lib/supabase';

export const dashboardService = {
  async getDashboardData(userId: string) {
    try {
      // Buscar contratos com eventos
      const { data: contratos } = await supabase
        .from('contratos')
        .select(`
          *,
          agenda_eventos(
            id,
            titulo,
            data_inicio,
            cliente_id,
            valor_total
          )
        `)
        .eq('user_id', userId)
        .order('criado_em', { ascending: false })
        .limit(5);

      // Buscar portfolio
      const { data: portfolio } = await supabase
        .from('portfolio_trabalhos')
        .select('id, titulo, imagem_capa, criado_em')
        .eq('user_id', userId)
        .order('criado_em', { ascending: false })
        .limit(6);
      
      return {
        contratos: contratos || [],
        portfolio: portfolio || [],
        error: null
      };
    } catch (error) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao buscar dados do dashboard:', error);
      }
      throw new Error(`Erro ao buscar dados do dashboard: ${error.message}`);
    }
  }
}; 