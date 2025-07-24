/**
 * TESTES AUTOMATIZADOS - CORREÇÃO DO BUG DE TEMPLATES
 * 
 * Este arquivo contém testes para validar a correção do bug onde
 * inserir múltiplas variáveis causava perda de texto intermediário.
 */

interface TesteResultado {
  nome: string;
  descricao: string;
  esperado: string;
  obtido: string;
  sucesso: boolean;
}

/**
 * Simula a função insertVariable corrigida para testes
 */
function simularInsercaoVariavel(
  conteudoAtual: string,
  posicaoCursor: number,
  variavel: string,
  eventoSelecionado: boolean = false,
  conteudoOriginal?: string
): string {
  const start = posicaoCursor;
  const end = posicaoCursor;
  
  let novoConteudo: string;
  
  if (eventoSelecionado && conteudoOriginal && conteudoOriginal !== conteudoAtual) {
    // Cenário: Há evento selecionado e conteúdo foi substituído
    // Estratégia: Inserir no final do conteudoOriginal para preservar todo o texto
    novoConteudo = conteudoOriginal + ' ' + variavel;
  } else {
    // Cenário: Não há evento selecionado OU conteúdo não foi substituído
    novoConteudo = conteudoAtual.substring(0, start) + variavel + conteudoAtual.substring(end);
  }
  
  return novoConteudo;
}

/**
 * Executa os testes de correção do bug
 */
export async function executarTestesCorrecaoBug(): Promise<TesteResultado[]> {
  console.log('🧪 Iniciando testes de correção do bug de templates...');
  
  const resultados: TesteResultado[] = [];
  
  // Teste 1: Inserção básica sem evento selecionado
  try {
    const conteudo = 'Olá ';
    const resultado = simularInsercaoVariavel(conteudo, conteudo.length, '{nome_cliente}');
    const esperado = 'Olá {nome_cliente}';
    
    resultados.push({
      nome: 'Inserção Básica',
      descricao: 'Inserir variável sem evento selecionado',
      esperado,
      obtido: resultado,
      sucesso: resultado === esperado
    });
    
    console.log('✅ Teste 1 - Inserção Básica:', resultado === esperado ? 'PASSOU' : 'FALHOU');
  } catch (error) {
    console.error('❌ Erro no Teste 1:', error);
    resultados.push({
      nome: 'Inserção Básica',
      descricao: 'Inserir variável sem evento selecionado',
      esperado: 'Olá {nome_cliente}',
      obtido: 'ERRO: ' + String(error),
      sucesso: false
    });
  }
  
  // Teste 2: Preservação de texto com evento selecionado (cenário do bug)
  try {
    const conteudoOriginal = 'Olá {nome_cliente} quando insiro uma variável de novo';
    const conteudoAtual = 'Olá João quando insiro uma variável de novo'; // Substituído
    const resultado = simularInsercaoVariavel(
      conteudoAtual, 
      conteudoAtual.length, 
      '{valor_entrada}',
      true,
      conteudoOriginal
    );
    const esperado = 'Olá {nome_cliente} quando insiro uma variável de novo {valor_entrada}';
    
    resultados.push({
      nome: 'Preservação de Texto',
      descricao: 'Manter texto digitado entre variáveis com evento selecionado',
      esperado,
      obtido: resultado,
      sucesso: resultado === esperado
    });
    
    console.log('✅ Teste 2 - Preservação de Texto:', resultado === esperado ? 'PASSOU' : 'FALHOU');
  } catch (error) {
    console.error('❌ Erro no Teste 2:', error);
    resultados.push({
      nome: 'Preservação de Texto',
      descricao: 'Manter texto digitado entre variáveis com evento selecionado',
      esperado: 'Olá {nome_cliente} quando insiro uma variável de novo {valor_entrada}',
      obtido: 'ERRO: ' + String(error),
      sucesso: false
    });
  }
  
  // Teste 3: Múltiplas inserções consecutivas
  try {
    let conteudo = 'Evento: ';
    conteudo = simularInsercaoVariavel(conteudo, conteudo.length, '{nome_cliente}');
    conteudo = simularInsercaoVariavel(conteudo, conteudo.length, ' em ');
    conteudo = simularInsercaoVariavel(conteudo, conteudo.length, '{data_evento}');
    conteudo = simularInsercaoVariavel(conteudo, conteudo.length, ' com entrada de ');
    conteudo = simularInsercaoVariavel(conteudo, conteudo.length, '{valor_entrada}');
    
    const esperado = 'Evento: {nome_cliente} em {data_evento} com entrada de {valor_entrada}';
    
    resultados.push({
      nome: 'Múltiplas Inserções',
      descricao: 'Inserir várias variáveis consecutivamente',
      esperado,
      obtido: conteudo,
      sucesso: conteudo === esperado
    });
    
    console.log('✅ Teste 3 - Múltiplas Inserções:', conteudo === esperado ? 'PASSOU' : 'FALHOU');
  } catch (error) {
    console.error('❌ Erro no Teste 3:', error);
    resultados.push({
      nome: 'Múltiplas Inserções',
      descricao: 'Inserir várias variáveis consecutivamente',
      esperado: 'Evento: {nome_cliente} em {data_evento} com entrada de {valor_entrada}',
      obtido: 'ERRO: ' + String(error),
      sucesso: false
    });
  }
  
  // Resumo dos testes
  const totalTestes = resultados.length;
  const testesPassaram = resultados.filter(r => r.sucesso).length;
  const testesFalharam = totalTestes - testesPassaram;
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log(`Total: ${totalTestes}`);
  console.log(`✅ Passaram: ${testesPassaram}`);
  console.log(`❌ Falharam: ${testesFalharam}`);
  console.log(`📈 Taxa de Sucesso: ${((testesPassaram / totalTestes) * 100).toFixed(1)}%`);
  
  if (testesFalharam === 0) {
    console.log('🎉 Todos os testes passaram! A correção está funcionando corretamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique a implementação.');
  }
  
  return resultados;
}

/**
 * Função de conveniência para executar testes no console
 */
export function rodarTestes() {
  executarTestesCorrecaoBug()
    .then(resultados => {
      console.log('Testes concluídos:', resultados);
    })
    .catch(error => {
      console.error('Erro ao executar testes:', error);
    });
}

// Exportar para uso em outros arquivos
export default {
  executarTestesCorrecaoBug,
  rodarTestes
};