// Script para verificar os user_ids na tabela portfolio_trabalhos
const { createClient } = require('@supabase/supabase-js');

// Configurar cliente Supabase com valores do ambiente
const supabaseUrl = "https://adxwgpfkvizpqdvortpu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o";

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarUserIds() {
  console.log('Verificando user_ids na tabela portfolio_trabalhos...');
  
  try {
    // Obter todos os registros na tabela
    const { data: registros, error } = await supabase
      .from('portfolio_trabalhos')
      .select('id, titulo, user_id')
      .order('criado_em', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar registros:', error);
      return;
    }
    
    console.log(`✓ Total de registros: ${registros.length}`);
    
    if (registros && registros.length > 0) {
      // Criar um mapa de user_ids para contar ocorrências
      const userIdsMap = new Map();
      
      registros.forEach(registro => {
        const userId = registro.user_id;
        if (!userIdsMap.has(userId)) {
          userIdsMap.set(userId, {
            count: 1,
            registros: [registro]
          });
        } else {
          const info = userIdsMap.get(userId);
          info.count += 1;
          info.registros.push(registro);
          userIdsMap.set(userId, info);
        }
      });
      
      // Exibir contagem por user_id
      console.log('\nContagem por user_id:');
      console.log('------------------');
      
      userIdsMap.forEach((info, userId) => {
        console.log(`User ID: ${userId}`);
        console.log(`Total de registros: ${info.count}`);
        console.log('Registros:');
        info.registros.forEach((registro, index) => {
          console.log(`  ${index + 1}. ${registro.titulo} (ID: ${registro.id})`);
        });
        console.log('------------------');
      });
      
      // Agora tentar fazer login com usuário de teste para verificar o ID
      console.log('\nVerificando login com usuário de teste...');
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'senha123'
      });
      
      if (authError) {
        console.error('❌ Erro ao fazer login:', authError.message);
      } else {
        const loggedUserId = authData.user.id;
        console.log(`✅ Login realizado com sucesso! User ID: ${loggedUserId}`);
        
        // Verificar se esse usuário tem registros
        if (userIdsMap.has(loggedUserId)) {
          const userInfo = userIdsMap.get(loggedUserId);
          console.log(`✓ Usuário tem ${userInfo.count} registros na tabela.`);
        } else {
          console.log(`❌ Usuário NÃO tem registros na tabela.`);
        }
      }
      
    } else {
      console.log('\n❌ Nenhum registro encontrado na tabela.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar registros:', error);
  }
}

verificarUserIds(); 