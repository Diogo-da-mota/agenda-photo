// N8N REMOVIDO - Usando Supabase Storage + Amazon S3
// URL direta do webhook N8N - COMENTADA PARA REMOÇÃO
// export const N8N_WEBHOOK_URL = 'https://webhook.n8n.agendaphoto.com.br/webhook/82885565-cc4f-4431-a04e-8b87e45f6c84';

// URLs alternativas comentadas:
// const N8N_WEBHOOK_URL = '/api/n8n/webhook/82885565-cc4f-4431-a04e-8b87e45f6c84'; // ❌ Proxy com URL incorreta
// const N8N_WEBHOOK_URL = 'http://localhost:3001/n8n-proxy/webhook/82885565-cc4f-4431-a04e-8b87e45f6c84';
// const N8N_WEBHOOK_URL = 'https://5564993296649.n8nready.com.br/webhook/82885565-cc4f-4431-a04e-8b87e45f6c84'; // ❌ URL incorreta

// Configuração desabilitada - sistema usa Amazon S3
export const N8N_WEBHOOK_URL = ''; // Vazio para evitar chamadas acidentais
