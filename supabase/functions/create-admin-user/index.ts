
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  console.log("Função Edge recebeu requisição:", req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Lidando com requisição preflight CORS")
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    })
  }

  try {
    console.log("Iniciando criação de usuário admin")
    
    // Create Supabase client with service key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    console.log("Status das variáveis de ambiente:", { 
      urlExiste: !!supabaseUrl, 
      keyExiste: !!supabaseServiceKey 
    })

    if (!supabaseServiceKey || !supabaseUrl) {
      console.error("Variáveis de ambiente não configuradas")
      
      return new Response(
        JSON.stringify({ error: 'Chave de serviço ou URL não configurados' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log("Tentando criar usuário admin: agenda@gmail.com")
    
    // Create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'agenda@gmail.com',
      password: 'agenda123',
      email_confirm: true, // Auto-confirm email
    })

    if (error) {
      console.error("Erro ao criar usuário:", error.message)
      
      // Check if user already exists
      if (error.message.includes('already exists')) {
        return new Response(
          JSON.stringify({ message: 'Usuário já existe, tente fazer login' }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log("Usuário criado com sucesso:", data.user.id)
    
    return new Response(
      JSON.stringify({ 
        message: 'Usuário admin criado com sucesso',
        userId: data.user.id 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error("Erro inesperado:", error.message, error.stack)
    return new Response(
      JSON.stringify({ error: `Erro inesperado: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
