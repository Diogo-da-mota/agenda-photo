/**
 * ✅ CONFIGURAÇÕES CORS OTIMIZADAS - S3 Upload Function
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true'
}

/**
 * Resposta CORS para preflight requests
 */
export const handleCORS = () => {
  return new Response('ok', { 
    status: 200,
    headers: corsHeaders 
  })
}

/**
 * Adiciona headers CORS a uma resposta
 */
export const addCorsHeaders = (response: Response): Response => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
} 