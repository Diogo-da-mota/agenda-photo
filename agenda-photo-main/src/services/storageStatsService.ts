import { supabase } from '@/lib/supabase';

/**
 * Formata bytes para uma string legível (KB, MB, GB).
 * @param bytes - O número de bytes a ser formatado.
 * @returns Uma string formatada.
 */
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Busca as estatísticas de uso do armazenamento para o usuário logado
 * chamando uma função segura (RPC) no banco de dados.
 * @returns Um objeto com as estatísticas de armazenamento ou null em caso de erro.
 */
export const getStorageStats = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Retorna um estado padrão para usuários não logados.
    return {
      totalUsedBytes: 0,
      totalAvailableBytes: 3 * 1024 * 1024 * 1024,
      percentageUsed: 0,
    };
  }

  // Chama a função get_user_storage_usage() que criamos no banco de dados.
  const { data, error } = await supabase.rpc('get_storage_stats');

  if (error) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro ao buscar estatísticas de storage via RPC:', error);
    }
    throw new Error(error.message);
  }

  const totalUsedBytes = data ?? 0;
  const totalAvailableBytes = 3 * 1024 * 1024 * 1024; // 3GB
  const percentageUsed = totalUsedBytes > 0 ? (totalUsedBytes / totalAvailableBytes) * 100 : 0;

  return {
    totalUsedBytes,
    totalAvailableBytes,
    percentageUsed,
  };
}; 