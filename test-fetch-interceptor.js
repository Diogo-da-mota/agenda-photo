// Script para testar conflitos entre interceptador fetch e headers Supabase

// Simular o interceptador do apiMonitoring.ts
const originalFetch = globalThis.fetch;
let interceptorActive = false;
let capturedRequests = [];

// Implementar o interceptador exatamente como no apiMonitoring.ts
function enableInterceptor() {
  if (interceptorActive) return;
  
  globalThis.fetch = async function(input, init) {
    const startTime = performance.now();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method || 'GET';
    
    console.log('\n🔍 INTERCEPTADOR ATIVO:');
    console.log('URL:', url);
    console.log('Method:', method);
    console.log('Headers originais:', init?.headers);
    
    try {
      const response = await originalFetch(input, init);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Só monitorar requisições do Supabase (como no código original)
      if (url.includes('supabase.co') || url.includes('/rest/v1/')) {
        const requestInfo = {
          url,
          method,
          duration,
          status: response.status,
          success: response.ok,
          headers: init?.headers,
          timestamp: Date.now()
        };
        
        capturedRequests.push(requestInfo);
        
        console.log('📊 Requisição Supabase capturada:');
        console.log('  Status:', response.status);
        console.log('  Success:', response.ok);
        console.log('  Duration:', Math.round(duration) + 'ms');
        
        if (!response.ok) {
          console.log('❌ ERRO DETECTADO:');
          console.log('  Status:', response.status);
          console.log('  StatusText:', response.statusText);
          
          // Tentar ler o corpo da resposta para mais detalhes
          try {
            const responseClone = response.clone();
            const errorText = await responseClone.text();
            console.log('  Corpo da resposta:', errorText);
          } catch (e) {
            console.log('  Não foi possível ler o corpo da resposta');
          }
        }
      }
      
      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log('❌ ERRO NA REQUISIÇÃO:');
      console.log('  Error:', error.message);
      console.log('  Duration:', Math.round(duration) + 'ms');
      
      if (url.includes('supabase.co') || url.includes('/rest/v1/')) {
        capturedRequests.push({
          url,
          method,
          duration,
          status: 0,
          success: false,
          headers: init?.headers,
          error: error.message,
          timestamp: Date.now()
        });
      }
      
      throw error;
    }
  };
  
  interceptorActive = true;
  console.log('✅ Interceptador de fetch ativado');
}

function disableInterceptor() {
  if (!interceptorActive) return;
  
  globalThis.fetch = originalFetch;
  interceptorActive = false;
  console.log('❌ Interceptador de fetch desativado');
}

// Função para testar requisição Supabase com e sem interceptador
async function testarComESemInterceptador() {