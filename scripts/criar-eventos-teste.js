import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para criar eventos de teste nos próximos 10 dias
async function criarEventosTeste() {
  try {
    console.log('🔍 Criando eventos de teste para os próximos 10 dias...');
    
    // Primeiro, vamos tentar buscar um usuário existente em diferentes tabelas
    let userId = null;
    
    // Tentar buscar na tabela usuarios
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);
    
    if (usuarios && usuarios.length > 0) {
      userId = usuarios[0].id;
      console.log(`✅ Usuário encontrado na tabela usuarios: ${userId}`);
    } else {
      // Se não encontrar, tentar na tabela profiles
      const { data: profiles, error: errorProfiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (profiles && profiles.length > 0) {
        userId = profiles[0].id;
        console.log(`✅ Usuário encontrado na tabela profiles: ${userId}`);
      } else {
        // Se não encontrar em nenhuma tabela, usar um UUID de exemplo
        userId = '00000000-0000-0000-0000-000000000001';
        console.log('⚠️ Nenhum usuário encontrado, usando UUID de exemplo para demonstração');
        console.log('💡 Dica: Os eventos serão criados, mas você precisará fazer login para vê-los');
      }
    }
    
    // Gerar eventos para os próximos 10 dias
    const agora = new Date();
    const eventosParaCriar = [];
    
    const nomes = [
      'João Silva - Casamento',
      'Maria Santos - Book Gestante',
      'Pedro Costa - Aniversário 15 anos',
      'Ana Oliveira - Ensaio Casal',
      'Carlos Pereira - Formatura',
      'Fernanda Lima - Book Família',
      'Roberto Alves - Evento Corporativo',
      'Juliana Rocha - Casamento Civil',
      'Marcos Ferreira - Batizado',
      'Lucia Mendes - Book Infantil'
    ];
    
    const tipos = [
      'casamento',
      'book',
      'aniversario',
      'ensaio',
      'formatura',
      'familia',
      'corporativo',
      'civil',
      'batizado',
      'infantil'
    ];
    
    const locais = [
      'Igreja São José, São Paulo',
      'Estúdio Fotográfico, Vila Madalena',
      'Buffet Alegria, Moema',
      'Parque Ibirapuera, São Paulo',
      'Universidade Mackenzie, São Paulo',
      'Residência da Família, Jardins',
      'Hotel Copacabana Palace, Rio de Janeiro',
      'Cartório Central, São Paulo',
      'Igreja Nossa Senhora, Santana',
      'Parque Villa-Lobos, São Paulo'
    ];
    
    const telefones = [
      '(11) 99999-1111',
      '(11) 99999-2222',
      '(11) 99999-3333',
      '(11) 99999-4444',
      '(11) 99999-5555',
      '(11) 99999-6666',
      '(11) 99999-7777',
      '(11) 99999-8888',
      '(11) 99999-9999',
      '(11) 99999-0000'
    ];
    
    const statusOptions = ['agendado', 'confirmado', 'agendado', 'confirmado', 'agendado'];
    const cores = ['#3b82f6', '#10b981', '#3b82f6', '#10b981', '#3b82f6'];
    
    for (let i = 0; i < 10; i++) {
      const dataEvento = new Date(agora);
      dataEvento.setDate(agora.getDate() + i + 1); // Próximos 10 dias
      dataEvento.setHours(9 + (i % 8), 0, 0, 0); // Horários entre 9h e 16h
      
      const dataFim = new Date(dataEvento);
      dataFim.setHours(dataFim.getHours() + 2); // 2 horas de duração
      
      const statusIndex = i % statusOptions.length;
      
      const evento = {
        user_id: userId,
        titulo: nomes[i],
        tipo: tipos[i],
        data_inicio: dataEvento.toISOString(),
        data_fim: dataFim.toISOString(),
        local: locais[i],
        telefone: telefones[i],
        status: statusOptions[statusIndex],
        cor: cores[statusIndex],
        valor_total: 1500 + (i * 200), // Valores entre R$ 1.500 e R$ 3.300
        valor_entrada: 500 + (i * 50),  // Entrada entre R$ 500 e R$ 950
        valor_restante: 1000 + (i * 150), // Restante
        observacoes: `Evento de teste ${i + 1} - Criado automaticamente`,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };
      
      eventosParaCriar.push(evento);
    }
    
    // Inserir eventos no banco
    const { data, error } = await supabase
      .from('agenda_eventos')
      .insert(eventosParaCriar)
      .select();
    
    if (error) {
      console.error('❌ Erro ao criar eventos:', error);
      return;
    }
    
    console.log(`✅ ${data.length} eventos de teste criados com sucesso!`);
    console.log('\n📅 Eventos criados:');
    
    data.forEach((evento, index) => {
      const dataFormatada = new Date(evento.data_inicio).toLocaleString('pt-BR');
      console.log(`${index + 1}. ${evento.titulo} - ${dataFormatada}`);
    });
    
    console.log('\n🎉 Agora você pode ver os eventos na seção "Próximos Eventos" do dashboard!');
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
  }
}

// Executar o script
criarEventosTeste();