// Script para criar eventos de teste com autenticação adequada
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurar cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função principal
async function main() {
  console.log('🔍 Criando eventos de teste com autenticação...');
  
  try {
    // 1. Fazer login com um usuário existente ou criar um novo
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'senha123'
    });
    
    if (authError) {
      console.log('❌ Erro ao fazer login:', authError.message);
      console.log('Tentando registrar novo usuário...');
      
      // 2. Tentar criar um novo usuário
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'senha123',
        options: {
          data: {
            nome: 'Usuário Teste',
            tipo: 'fotografo'
          }
        }
      });
      
      if (signUpError) {
        console.error('❌ Erro ao criar usuário:', signUpError.message);
        return;
      }
      
      console.log('✅ Usuário criado com sucesso!', signUpData.user.id);
      await criarEventosTeste(signUpData.user.id);
      
    } else {
      console.log('✅ Login realizado com sucesso!', authData.user.id);
      await criarEventosTeste(authData.user.id);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para criar eventos de teste
async function criarEventosTeste(userId) {
  console.log(`Criando eventos de teste para o usuário ${userId}...`);
  
  // Gerar eventos para os próximos 10 dias
  const eventos = [];
  const hoje = new Date();
  
  const tiposEvento = ['Casamento', 'Ensaio', 'Aniversário', 'Batizado', 'Formatura'];
  const locais = ['Buffet Tulipas', 'Igreja São José', 'Estúdio Central', 'Parque da Cidade', 'Salão de Festas'];
  const status = ['confirmado', 'agendado', 'concluido'];
  
  for (let i = 0; i < 10; i++) {
    const dataEvento = new Date(hoje);
    dataEvento.setDate(hoje.getDate() + i + 1); // Próximos 10 dias
    
    const evento = {
      user_id: userId,
      titulo: `${tiposEvento[i % tiposEvento.length]} - ${dataEvento.getDate()}/${dataEvento.getMonth() + 1}`,
      tipo: tiposEvento[i % tiposEvento.length],
      data_inicio: dataEvento.toISOString(),
      data_fim: new Date(dataEvento.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 horas depois
      local: locais[i % locais.length],
      status: status[i % status.length],
      descricao: `Evento de teste criado automaticamente para ${dataEvento.toLocaleDateString()}`,
      // Removido campo 'valor' - não existe na tabela agenda_eventos
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };
    
    eventos.push(evento);
  }
  
  // Inserir eventos
  const { data, error } = await supabase
    .from('agenda_eventos')
    .insert(eventos)
    .select();
  
  if (error) {
    console.error('❌ Erro ao inserir eventos:', error);
  } else {
    console.log(`✅ ${data.length} eventos inseridos com sucesso!`);
    
    // Listar eventos criados
    console.log('\nEventos criados:');
    data.forEach((evento, index) => {
      const dataEvento = new Date(evento.data_inicio).toLocaleDateString();
      console.log(`${index + 1}. ${evento.titulo} - ${dataEvento} (${evento.status})`);
    });
    
    // Verificar se os eventos aparecem na consulta dos próximos 10 dias
    console.log('\n🔍 Verificando consulta dos próximos 10 dias...');
    await verificarEventosProximos(userId);
  }
}

// Função para verificar eventos dos próximos 10 dias
async function verificarEventosProximos(userId) {
  const hoje = new Date();
  const proximosDias = new Date();
  proximosDias.setDate(hoje.getDate() + 10);
  
  const { data: eventos, error } = await supabase
    .from('agenda_eventos')
    .select('*')
    .eq('user_id', userId)
    .gte('data_inicio', hoje.toISOString())
    .lte('data_inicio', proximosDias.toISOString())
    .neq('status', 'cancelado')
    .order('data_inicio', { ascending: true });
  
  if (error) {
    console.error('❌ Erro ao buscar eventos dos próximos 10 dias:', error);
  } else {
    console.log(`✅ Encontrados ${eventos.length} eventos nos próximos 10 dias:`);
    eventos.forEach((evento, index) => {
      const dataEvento = new Date(evento.data_inicio).toLocaleDateString();
      console.log(`${index + 1}. ${evento.titulo} - ${dataEvento}`);
    });
  }
}

// Executar script
main();