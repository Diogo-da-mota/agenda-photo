export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      anexos_contrato: {
        Row: {
          contrato_id: string
          created_at: string
          id: string
          nome: string
          tamanho: string
          tipo: string | null
          url: string
        }
        Insert: {
          contrato_id: string
          created_at?: string
          id?: string
          nome: string
          tamanho: string
          tipo?: string | null
          url: string
        }
        Update: {
          contrato_id?: string
          created_at?: string
          id?: string
          nome?: string
          tamanho?: string
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_contrato_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          setting_key: string
          settings: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          setting_key: string
          settings?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          setting_key?: string
          settings?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          created_at: string
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          assinatura_url: string | null
          cliente_id: string
          conteudo: string
          created_at: string
          data_assinatura: string | null
          evento_id: string | null
          id: string
          ip_assinatura: string | null
          status: Database["public"]["Enums"]["contract_status"]
          termos_aceitos: boolean | null
          titulo: string
          updated_at: string
          usuario_id: string
          valor_entrada: number | null
          valor_total: number | null
        }
        Insert: {
          assinatura_url?: string | null
          cliente_id: string
          conteudo: string
          created_at?: string
          data_assinatura?: string | null
          evento_id?: string | null
          id?: string
          ip_assinatura?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          termos_aceitos?: boolean | null
          titulo: string
          updated_at?: string
          usuario_id: string
          valor_entrada?: number | null
          valor_total?: number | null
        }
        Update: {
          assinatura_url?: string | null
          cliente_id?: string
          conteudo?: string
          created_at?: string
          data_assinatura?: string | null
          evento_id?: string | null
          id?: string
          ip_assinatura?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          termos_aceitos?: boolean | null
          titulo?: string
          updated_at?: string
          usuario_id?: string
          valor_entrada?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_clientes"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          cliente_id: string
          created_at: string
          data: string
          descricao: string | null
          id: string
          local: string | null
          status: Database["public"]["Enums"]["event_status"]
          titulo: string
          updated_at: string
          usuario_id: string
          valor: number | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data: string
          descricao?: string | null
          id?: string
          local?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          titulo: string
          updated_at?: string
          usuario_id: string
          valor?: number | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          local?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          titulo?: string
          updated_at?: string
          usuario_id?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      imagens: {
        Row: {
          created_at: string
          filename: string
          filesize: number
          id: string
          mimetype: string
          produto_id: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filename: string
          filesize: number
          id?: string
          mimetype: string
          produto_id?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          filename?: string
          filesize?: number
          id?: string
          mimetype?: string
          produto_id?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          cliente_id: string
          created_at: string
          data_pagamento: string | null
          descricao: string
          evento_id: string | null
          id: string
          metodo_pagamento: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          usuario_id: string
          valor: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_pagamento?: string | null
          descricao: string
          evento_id?: string | null
          id?: string
          metodo_pagamento?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          usuario_id: string
          valor: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_pagamento?: string | null
          descricao?: string
          evento_id?: string | null
          id?: string
          metodo_pagamento?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          usuario_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          profile_photo_url: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          profile_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          profile_photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          company_logo: string | null
          created_at: string | null
          custom_domain: string | null
          google_calendar_connected: boolean | null
          google_calendar_email: string | null
          google_calendar_last_sync: string | null
          id: string
          updated_at: string | null
          use_same_google_account: boolean | null
          user_id: string
          webhook_enabled: boolean | null
          webhook_id: string | null
        }
        Insert: {
          company_logo?: string | null
          created_at?: string | null
          custom_domain?: string | null
          google_calendar_connected?: boolean | null
          google_calendar_email?: string | null
          google_calendar_last_sync?: string | null
          id?: string
          updated_at?: string | null
          use_same_google_account?: boolean | null
          user_id: string
          webhook_enabled?: boolean | null
          webhook_id?: string | null
        }
        Update: {
          company_logo?: string | null
          created_at?: string | null
          custom_domain?: string | null
          google_calendar_connected?: boolean | null
          google_calendar_email?: string | null
          google_calendar_last_sync?: string | null
          id?: string
          updated_at?: string | null
          use_same_google_account?: boolean | null
          user_id?: string
          webhook_enabled?: boolean | null
          webhook_id?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_type: string
          id: string
          payload: Json
          photographer_id: string
          received_at: string | null
        }
        Insert: {
          event_type: string
          id?: string
          payload: Json
          photographer_id: string
          received_at?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          payload?: Json
          photographer_id?: string
          received_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contract_status: "pendente" | "assinado" | "expirado" | "cancelado"
      event_status: "agendado" | "confirmado" | "cancelado" | "concluido"
      payment_status: "pendente" | "pago" | "cancelado" | "reembolsado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
