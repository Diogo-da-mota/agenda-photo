import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  console.error('URL atual:', supabaseUrl);
  console.error('Key atual:', supabaseAnonKey ? 'Configurada' : 'Não configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para buscar eventos e gerar Markdown
async function gerarEventosOrdenados() {
  try {
    console.log('🔍 Verificando estrutura da tabela agenda_eventos...');
    
    // Primeiro, vamos verificar se a tabela existe e sua estrutura
    const { data: estrutura, error: errorEstrutura } = await supabase
      .from('agenda_eventos')
      .select('*')
      .limit(1);

    if (errorEstrutura) {
      console.error('❌ Erro ao verificar estrutura:', errorEstrutura);
      return;
    }

    console.log('✅ Tabela agenda_eventos encontrada');
    
    // Agora buscar todos os eventos
    console.log('🔍 Buscando eventos na tabela agenda_eventos...');
    
    // Query para buscar todos os eventos ordenados por data_inicio
    const { data: eventos, error } = await supabase
      .from('agenda_eventos')
      .select('id, titulo, data_inicio')
      .order('data_inicio', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      return;
    }

    console.log(`📊 Total de registros encontrados: ${eventos ? eventos.length : 0}`);

    if (!eventos || eventos.length === 0) {
      console.log('⚠️ Nenhum evento encontrado na tabela agenda_eventos');
      
      // Vamos buscar uma amostra de qualquer dados que existam
      const { data: amostra, error: errorAmostra } = await supabase
        .from('agenda_eventos')
        .select('*')
        .limit(5);
        
      if (!errorAmostra && amostra && amostra.length > 0) {
        console.log('📋 Amostra de registros encontrados:');
        console.log(JSON.stringify(amostra, null, 2));
      } else {
        console.log('📝 Gerando arquivo Markdown com dados de exemplo...');
        
        // Gerar dados de exemplo para demonstração
        const eventosExemplo = [
          { id: '1', titulo: 'João da Silva', data_inicio: '2025-06-26T05:30:00Z' },
          { id: '2', titulo: 'Maria Santos', data_inicio: '2025-06-26T11:00:00Z' },
          { id: '3', titulo: 'Pedro Costa', data_inicio: '2025-06-27T06:15:00Z' },
          { id: '4', titulo: 'Ana Oliveira', data_inicio: '2025-06-28T07:30:00Z' },
          { id: '5', titulo: 'Carlos Pereira', data_inicio: '2025-06-28T12:45:00Z' },
          { id: '6', titulo: 'Fernanda Lima', data_inicio: '2025-06-29T08:00:00Z' },
          { id: '7', titulo: 'Roberto Alves', data_inicio: '2025-06-30T05:00:00Z' },
          { id: '8', titulo: 'Juliana Rocha', data_inicio: '2025-07-01T06:30:00Z' },
          { id: '9', titulo: 'Marcos Ferreira', data_inicio: '2025-07-01T13:20:00Z' },
          { id: '10', titulo: 'Lucia Mendes', data_inicio: '2025-07-02T07:00:00Z' },
          { id: '11', titulo: 'Gabriel Torres', data_inicio: '2025-07-03T11:15:00Z' },
          { id: '12', titulo: 'Camila Souza', data_inicio: '2025-07-04T08:45:00Z' },
          { id: '13', titulo: 'Rafael Barbosa', data_inicio: '2025-07-05T10:30:00Z' },
          { id: '14', titulo: 'Beatriz Gomes', data_inicio: '2025-07-06T06:00:00Z' },
          { id: '15', titulo: 'Diego Martins', data_inicio: '2025-07-07T12:00:00Z' },
          { id: '16', titulo: 'Larissa Silva', data_inicio: '2025-07-08T07:15:00Z' },
          { id: '17', titulo: 'Thiago Reis', data_inicio: '2025-07-09T11:30:00Z' },
          { id: '18', titulo: 'Natália Castro', data_inicio: '2025-07-10T05:45:00Z' },
          { id: '19', titulo: 'Felipe Moura', data_inicio: '2025-07-11T09:00:00Z' },
          { id: '20', titulo: 'Priscila Campos', data_inicio: '2025-07-12T13:10:00Z' }
        ];
        
        // Gerar markdown com dados de exemplo
        let markdown = '# Eventos Agendados Ordenados\n\n';
        markdown += '*⚠️ Dados de exemplo - A tabela agenda_eventos está vazia no banco de dados atual.*\n\n';
        markdown += '| Ordem | Nome               | Data e Hora            |\n';
        markdown += '|-------|--------------------|------------------------|\n';

        eventosExemplo.forEach((evento, index) => {
          const dataFormatada = new Date(evento.data_inicio).toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          markdown += `| ${index + 1}     | ${evento.titulo.padEnd(18)} | ${dataFormatada} |\n`;
        });

        // Salvar arquivo Markdown
        const nomeArquivo = 'eventos-agendados-ordenados.md';
        const caminhoCompleto = path.join(process.cwd(), nomeArquivo);
        
        fs.writeFileSync(caminhoCompleto, markdown, 'utf8');
        
        console.log(`✅ Arquivo Markdown gerado com dados de exemplo: ${caminhoCompleto}`);
        console.log('\n📊 Resumo:');
        console.log(`- Total de eventos (exemplo): ${eventosExemplo.length}`);
        console.log(`- Primeiro evento: ${new Date(eventosExemplo[0].data_inicio).toLocaleString('pt-BR')}`);
        console.log(`- Último evento: ${new Date(eventosExemplo[eventosExemplo.length - 1].data_inicio).toLocaleString('pt-BR')}`);

        console.log('\n📄 Arquivo Markdown gerado:');
        console.log(markdown);
      }
      
      return;
    }

    console.log(`✅ ${eventos.length} eventos encontrados`);

    // Gerar conteúdo Markdown
    let markdown = '# Eventos Agendados Ordenados\n\n';
    markdown += '| Ordem | Nome               | Data e Hora            |\n';
    markdown += '|-------|--------------------|------------------------|\n';

    eventos.forEach((evento, index) => {
      const dataFormatada = new Date(evento.data_inicio).toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      markdown += `| ${index + 1}     | ${evento.titulo.padEnd(18)} | ${dataFormatada} |\n`;
    });

    // Salvar arquivo Markdown
    const nomeArquivo = 'eventos-agendados-ordenados.md';
    const caminhoCompleto = path.join(process.cwd(), nomeArquivo);
    
    fs.writeFileSync(caminhoCompleto, markdown, 'utf8');
    
    console.log(`✅ Arquivo Markdown gerado: ${caminhoCompleto}`);
    console.log('\n📊 Resumo:');
    console.log(`- Total de eventos: ${eventos.length}`);
    
    if (eventos.length > 0) {
      const primeiroEvento = new Date(eventos[0].data_inicio);
      const ultimoEvento = new Date(eventos[eventos.length - 1].data_inicio);
      
      console.log(`- Primeiro evento: ${primeiroEvento.toLocaleString('pt-BR')}`);
      console.log(`- Último evento: ${ultimoEvento.toLocaleString('pt-BR')}`);
    }

    console.log('\n📄 Arquivo Markdown:');
    console.log(markdown);

  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
  }
}

// Executar o script
gerarEventosOrdenados();
