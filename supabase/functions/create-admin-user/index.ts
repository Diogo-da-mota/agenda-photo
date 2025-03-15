
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request")
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    })
  }

  try {
    console.log("Request received to create admin user")
    
    // Create Supabase client with service key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    console.log("Environment variables status:", { 
      urlExists: !!supabaseUrl, 
      keyExists: !!supabaseServiceKey 
    })

    if (!supabaseServiceKey || !supabaseUrl) {
      console.error("Missing environment variables")
      
      return new Response(
        JSON.stringify({ error: 'Service role key or URL is missing' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log("Attempting to create admin user: agenda@gmail.com")
    
    // Create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'agenda@gmail.com',
      password: 'agenda123',
      email_confirm: true, // Auto-confirm email
    })

    if (error) {
      console.error("Error creating user:", error.message)
      
      // Check if user already exists
      if (error.message.includes('already exists')) {
        return new Response(
          JSON.stringify({ message: 'User already exists, try logging in' }),
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

    console.log("User created successfully:", data.user.id)
    
    return new Response(
      JSON.stringify({ 
        message: 'Admin user created successfully',
        userId: data.user.id 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error("Unexpected error:", error.message, error.stack)
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
