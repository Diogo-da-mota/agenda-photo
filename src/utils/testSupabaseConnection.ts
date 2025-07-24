import { supabase } from '@/lib/supabase';
import { logger } from './logger'; // ++ ADICIONADO: Importar o novo logger

export const testSupabaseConnection = async () => {
  logger.debug('[SUPABASE TEST] Iniciando teste de conexão...');

  if (!supabase) {
    logger.error('[SUPABASE TEST] Instância do Supabase não inicializada.');
    return;
  }

  const { data: { key }, error: keyError } = await supabase.functions.invoke('get-env', {
    body: { key: 'SUPABASE_ANON_KEY' }
  });

  if (keyError) {
    logger.error('[SUPABASE TEST] Erro ao buscar chave:', keyError);
  } else {
    logger.debug('[SUPABASE TEST] Key:', key ? 'Configurada' : 'NÃO CONFIGURADA');
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    logger.error('[SUPABASE TEST] Erro ao obter sessão:', sessionError);
  } else {
    logger.debug('[SUPABASE TEST] ✅ Sessão obtida:', sessionData.session ? 'Autenticado' : 'Não autenticado');
  }
}; 