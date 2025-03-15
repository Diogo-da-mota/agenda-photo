
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase com chave de serviço
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://sykjzikcaclutfpuwuri.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Service role key is required' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log("Tentando criar usuário admin: agenda@gmail.com")
    
    // Criar o usuário administrativo
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'agenda@gmail.com',
      password: 'agenda123',
      email_confirm: true, // Confirmar email automaticamente
    })

    if (error) {
      console.error("Erro ao criar usuário:", error.message)
      
      // Verificar se é erro de usuário já existente
      if (error.message.includes('already exists')) {
        return new Response(
          JSON.stringify({ message: 'Usuário já existe, tente fazer login' }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      throw error
    }

    console.log("Usuário criado com sucesso:", data.user.id)
    
    return new Response(
      JSON.stringify({ 
        message: 'Usuário administrativo criado com sucesso',
        userId: data.user.id 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error("Erro:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
