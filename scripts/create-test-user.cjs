// Script para criar um usuário de teste no Supabase
const { createClient } = require('@supabase/supabase-js');

// Configurar cliente Supabase com valores do ambiente
const supabaseUrl = "https://adxwgpfkvizpqdvortpu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o";

const supabase = createClient(supabaseUrl, supabaseKey);

// URLs de exemplo para testes
const urlsExemplo = [
  "https://drive.google.com/file/d/1abcdefghijklmnopqrstuvwxyz/view",
  "https://drive.google.com/file/d/2abcdefghijklmnopqrstuvwxyz/view",
  "https://drive.google.com/file/d/3abcdefghijklmnopqrstuvwxyz/view",
  "https://drive.google.com/file/d/4abcdefghijklmnopqrstuvwxyz/view"
];

// Imagens de exemplo (miniaturas)
const imagensExemplo = [
  "https://utfs.io/f/4c2815c6-3a51-4f9d-b961-599595ac919b-1j9ayv.png",
  "https://utfs.io/f/7b2815c6-3a51-4f9d-b961-599595ac919b-2j9ayv.png",
  "https://utfs.io/f/9c2815c6-3a51-4f9d-b961-599595ac919b-3j9ayv.png"
];

// Registros de teste para o portfólio
const registrosTeste = [
  {
    titulo: "Casamento João e Maria",
    categoria: "Casamento",
    local: "Jardim Botânico, São Paulo",
    descricao: "Um belo casamento realizado no jardim botânico com decoração rústica.",
    tags: ["casamento", "externo", "jardim", "rústico"],
    imagens: [imagensExemplo[0]],
    urls_drive: [urlsExemplo[0], urlsExemplo[1]],
    url_imagem_drive: urlsExemplo[0]
  },
  {
    titulo: "Ensaio Ana Luiza - 15 anos",
    categoria: "Ensaio",
    local: "Estúdio Central",
    descricao: "Ensaio fotográfico para festa de debutante.",
    tags: ["15anos", "estúdio", "retrato"],
    imagens: [imagensExemplo[1]],
    urls_drive: [urlsExemplo[1]],
    url_imagem_drive: urlsExemplo[1]
  },
  {
    titulo: "Batizado Pedro",
    categoria: "Evento",
    local: "Igreja Nossa Senhora da Paz",
    descricao: "Batizado seguido de recepção no salão de festas.",
    tags: ["batizado", "igreja", "evento"],
    imagens: [imagensExemplo[2]],
    urls_drive: [urlsExemplo[2], urlsExemplo[3]],
    url_imagem_drive: urlsExemplo[2]
  },
  {
    titulo: "Book Profissional Carlos",
    categoria: "Book",
    local: "Parque da Cidade",
    descricao: "Fotos para LinkedIn e currículo profissional.",
    tags: ["profissional", "externo", "retrato"],
    imagens: [imagensExemplo[0]],
    urls_drive: [urlsExemplo[3]],
    url_imagem_drive: urlsExemplo[3]
  }
];

// Função principal
async function main() {
  console.log('Iniciando criação de usuário e registros de teste...');
  
  try {
    // 1. Fazer login com um usuário existente
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
      await criarRegistrosPortfolio(signUpData.user.id);
      
    } else {
      console.log('✅ Login realizado com sucesso!', authData.user.id);
      await criarRegistrosPortfolio(authData.user.id);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para criar registros de portfólio
async function criarRegistrosPortfolio(userId) {
  console.log(`Criando registros de portfólio para o usuário ${userId}...`);
  
  // Adicionar user_id e timestamps aos registros
  const agora = new Date().toISOString();
  const registrosCompletos = registrosTeste.map(registro => ({
    ...registro,
    user_id: userId,
    criado_em: agora,
    atualizado_em: agora
  }));
  
  // Inserir registros
  const { data, error } = await supabase
    .from('portfolio_trabalhos')
    .insert(registrosCompletos)
    .select();
  
  if (error) {
    console.error('❌ Erro ao inserir registros:', error);
  } else {
    console.log(`✅ ${data.length} registros inseridos com sucesso!`);
    
    // Listar registros criados
    console.log('\nRegistros criados:');
    data.forEach((registro, index) => {
      console.log(`${index + 1}. ${registro.titulo} (ID: ${registro.id})`);
    });
  }
}

// Executar script
main(); 