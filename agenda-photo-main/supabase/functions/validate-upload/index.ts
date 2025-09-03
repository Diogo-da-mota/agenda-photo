/// <reference types="https://deno.land/x/supafunctions/types.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Adicionado para lidar com a chamada de CORS (preflight) do navegador
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    } })
  }

  try {
    const { file } = await req.json()
    
    // Lista de tipos permitidos (remover SVG)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ]
    
    // Validar magic numbers (primeiros bytes do arquivo)
    const magicNumbers = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/gif': [0x47, 0x49, 0x46],
      'application/pdf': [0x25, 0x50, 0x44, 0x46],
      // Adicionado webp para um suporte mais completo
      'image/webp': [0x52, 0x49, 0x46, 0x46]
    }
    
    // Decodificar o arquivo de base64 para um buffer de bytes
    const fileBuffer = new Uint8Array(atob(file).split('').map(char => char.charCodeAt(0)))
    let realType: string | null = null
    
    for (const [type, signature] of Object.entries(magicNumbers)) {
      if (signature.every((byte, index) => fileBuffer[index] === byte)) {
        realType = type
        break
      }
    }
    
    if (!realType || !allowedTypes.includes(realType)) {
      return new Response(JSON.stringify({ error: 'Tipo de arquivo inválido ou não permitido.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Limitar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024
    if (fileBuffer.length > maxSize) {
      return new Response(JSON.stringify({ error: 'Arquivo excede o tamanho máximo de 5MB.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    return new Response(JSON.stringify({ valid: true, type: realType }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Payload inválido ou erro no processamento.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}) 