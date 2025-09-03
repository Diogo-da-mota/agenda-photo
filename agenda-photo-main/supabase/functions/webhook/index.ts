
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Extract the photographer ID from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const photographerId = pathParts[pathParts.length - 1];
    
    if (!photographerId) {
      return new Response(
        JSON.stringify({ error: "ID do fotógrafo não fornecido" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get the request body
    let payload;
    try {
      payload = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Payload inválido" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variáveis de ambiente ausentes");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se o usuário existe
    const { data: userExists, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', photographerId)
      .single();
    
    if (userError || !userExists) {
      // Usuário não encontrado - logs removidos para produção
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Log the webhook event - logs removidos para produção
    // Webhook recebido para fotógrafo
    // Payload: dados sensíveis removidos

    // Save webhook data to database
    const { data, error } = await supabase
      .from('webhook_events')
      .insert({
        photographer_id: photographerId,
        event_type: payload.event || 'unknown',
        payload: payload,
        status: 'received',
        processed_at: new Date().toISOString()
      });
    
    if (error) {
      // Erro ao salvar evento de webhook - logs removidos para produção
      throw new Error(`Erro ao salvar dados: ${error.message}`);
    }

    // Verificar se há uma URL personalizada para encaminhar o webhook
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('custom_domain')
      .eq('user_id', photographerId)
      .single();
    
    let forwardResponse = null;
    
    // Se houver uma URL personalizada, encaminhar o webhook
    if (integration?.custom_domain) {
      try {
        // Encaminhar o webhook para a URL personalizada
        const forwardRequest = await fetch(integration.custom_domain, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            forwarded_by: "agenda-pro-webhook",
            original_timestamp: new Date().toISOString()
          })
        });
        
        forwardResponse = await forwardRequest.json();
        
        // Atualizar o status do evento
        await supabase
          .from('webhook_events')
          .update({
            status: 'forwarded',
            forward_response: forwardResponse
          })
          .eq('photographer_id', photographerId)
          .eq('event_type', payload.event || 'unknown')
          .eq('processed_at', new Date().toISOString());
          
        // Webhook encaminhado com sucesso - logs removidos para produção
      } catch (forwardError) {
        // Erro ao encaminhar webhook - logs removidos para produção
        
        // Atualizar o status do evento para erro
        await supabase
          .from('webhook_events')
          .update({
            status: 'forward_error',
            forward_response: { error: forwardError.message }
          })
          .eq('photographer_id', photographerId)
          .eq('event_type', payload.event || 'unknown')
          .eq('processed_at', new Date().toISOString());
      }
    }
    
    // Return a success response
    return new Response(
      JSON.stringify({ 
        status: "success", 
        message: "Webhook recebido com sucesso",
        photographer_id: photographerId,
        forwarded: integration?.custom_domain ? true : false,
        forward_response: forwardResponse
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    // Erro no webhook - logs removidos para produção
    
    return new Response(
      JSON.stringify({ 
        error: "Erro ao processar webhook",
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
