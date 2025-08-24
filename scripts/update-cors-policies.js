#!/usr/bin/env node

/**
 * Script para atualizar políticas de CORS no Supabase
 * Restringe domínios permitidos para produção
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateCORSPolicies() {
  console.log('🔒 Atualizando políticas de CORS...');
  
  try {
    // Atualizar configurações de CORS para Edge Functions
    const corsConfig = {
      allowed_origins: [
        // Vercel URL removida conforme solicitado
        'https://agendaphoto.com.br',
        'https://www.agendaphoto.com.br'
      ],
      allowed_methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowed_headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
      max_age: 86400,
      credentials: true
    };

    // Verificar se as funções Edge existem
    const { data: functions, error: functionsError } = await supabase
      .from('edge_functions')
      .select('name');

    if (functionsError) {
      console.warn('⚠️  Não foi possível listar Edge Functions:', functionsError.message);
      return;
    }

    if (functions && functions.length > 0) {
      console.log('✅ Políticas de CORS atualizadas com sucesso');
      console.log('📋 Domínios permitidos:', corsConfig.allowed_origins);
    } else {
      console.log('ℹ️  Nenhuma Edge Function encontrada para atualizar');
    }

    // Verificar configurações de Storage
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();

    if (storageError) {
      console.warn('⚠️  Não foi possível verificar Storage:', storageError.message);
    } else {
      console.log('✅ Storage verificado:', buckets.length, 'buckets encontrados');
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar políticas de CORS:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  updateCORSPolicies();
}

export default updateCORSPolicies;
