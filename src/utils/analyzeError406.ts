/**
 * Análise do Erro HTTP 406 (Not Acceptable)
 * URL: https://adxwgpfkvizpqdvortpu.supabase.co/rest/v1/agenda_eventos?select=id%2…ente&cpf_cliente=eq.705.978.501-94&titulo=eq.Yasmine+Gon%C3%A7alves+Vieira
 */

// 1. ANÁLISE DA URL E ENCODING
const urlProblematica = 'https://adxwgpfkvizpqdvortpu.supabase.co/rest/v1/agenda_eventos?select=id%2…ente&cpf_cliente=eq.705.978.501-94&titulo=eq.Yasmine+Gon%C3%A7alves+Vieira';

// Decodificar a URL para análise
const urlDecodificada = decodeURIComponent(urlProblematica);
console.log('🔍 ANÁLISE DA URL PROBLEMÁTICA:');
console.log('URL Original:', urlProblematica);
console.log('URL Decodificada:', urlDecodificada);

// Analisar os parâmetros específicos
const parametros = {
  cpf_cliente: '705.978.501-94',
  titulo: 'Yasmine Gonçalves Vieira' // %C3%A7 = ç em UTF-8
};

console.log('\n📋 PARÂMETROS DECODIFICADOS:');
console.log('CPF:', parametros.cpf_cliente);
console.log('Título:', parametros.titulo);
console.log('Encoding do ç:', '%C3%A7');

// 2. ANÁLISE DO ENCODING UTF-8
const caracteresEspeciais = {
  'ç': '%C3%A7',
  'ã': '%C3%A3',
  'õ': '%C3%B5',
  'á': '%C3%A1',
  'é': '%C3%A9',
  'í': '%C3%AD',
  'ó': '%C3%B3',
  'ú': '%C3%BA'
};

console.log('\n🔤 MAPEAMENTO DE CARACTERES ESPECIAIS:');
Object.entries(caracteresEspeciais).forEach(([char, encoded]) => {
  console.log(`${char} → ${encoded}`);
});

// 3. VERIFICAR SE O ENCODING ESTÁ CORRETO
const nomeOriginal = 'Yasmine Gonçalves Vieira';
const nomeEncodado = encodeURIComponent(nomeOriginal);
const nomeDecodificado = decodeURIComponent(nomeEncodado);

console.log('\n✅ VERIFICAÇÃO DE ENCODING:');
console.log('Nome Original:', nomeOriginal);
console.log('Nome Encodado:', nomeEncodado);
console.log('Nome Decodificado:', nomeDecodificado);
console.log('Encoding Correto:', nomeOriginal === nomeDecodificado ? '✅ SIM' : '❌ NÃO');

// 4. ANÁLISE DOS HEADERS ESPERADOS PELO SUPABASE
const headersSupabaseEsperados = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o'
};

console.log('\n📡 HEADERS ESPERADOS PELO SUPABASE:');
Object.entries(headersSupabaseEsperados).forEach(([header, value]) => {
  console.log(`${header}: ${header === 'apikey' || header === 'Authorization' ? '[REDACTED]' : value}`);
});

// 5. POSSÍVEIS CAUSAS DO ERRO 406
const possiveisCausas = [
  {
    causa: 'Header Accept incorreto',
    descricao: 'Supabase espera application/json, mas pode estar recebendo text/html',
    probabilidade: 'ALTA',
    evidencia: 'testClienteAccess.ts usa Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  },
  {
    causa: 'Encoding de caracteres especiais',
    descricao: 'Caracteres especiais como ç podem estar mal encodados',
    probabilidade: 'MÉDIA',
    evidencia: '%C3%A7 é encoding UTF-8 correto para ç'
  },
  {
    causa: 'Headers de segurança CSP',
    descricao: 'Content-Security-Policy pode estar bloqueando a requisição',
    probabilidade: 'BAIXA',
    evidencia: 'CSP permite connect-src para *.supabase.co'
  },
  {
    causa: 'Interceptador fetch modificando headers',
    descricao: 'apiMonitoring.ts pode estar interferindo nos headers',
    probabilidade: 'BAIXA',
    evidencia: 'Interceptador apenas monitora, não modifica headers'
  }
];

console.log('\n🚨 POSSÍVEIS CAUSAS DO ERRO 406:');
possiveisCausas.forEach((item, index) => {
  console.log(`\n${index + 1}. ${item.causa} (${item.probabilidade})`);
  console.log(`   Descrição: ${item.descricao}`);
  console.log(`   Evidência: ${item.evidencia}`);
});

// 6. RECOMENDAÇÕES PARA CORREÇÃO
const recomendacoes = [
  'Verificar se o cliente Supabase está enviando Accept: application/json',
  'Confirmar que não há override de headers em interceptadores',
  'Testar a mesma requisição em diferentes navegadores/sistemas',
  'Verificar logs do Supabase para detalhes do erro 406',
  'Validar se RLS policies estão configuradas corretamente'
];

console.log('\n💡 RECOMENDAÇÕES:');
recomendacoes.forEach((rec, index) => {
  console.log(`${index + 1}. ${rec}`);
});

export { urlProblematica, parametros, headersSupabaseEsperados, possiveisCausas, recomendacoes };