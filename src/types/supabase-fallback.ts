// Tipos mínimos necessários para funcionamento do sistema
// Usado como fallback quando o arquivo types.ts gerado automaticamente tem problemas

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
        Relationships: any[]
      }
    }
  }
}

// Tipos básicos para autenticação
export interface User {
  id: string
  email?: string
  user_metadata?: Record<string, any>
  app_metadata?: Record<string, any>
}

export interface Session {
  user: User
  access_token: string
  refresh_token?: string
}