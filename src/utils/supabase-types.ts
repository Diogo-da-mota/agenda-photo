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
      agenda_eventos: {
        Row: {
          atualizado_em: string | null
          cliente_id: string | null
          cor: string | null
          criado_em: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          local: string | null
          notificacao_enviada: boolean | null
          observacoes: string | null
          status: string | null
          telefone: string | null
          tipo: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          atualizado_em?: string | null
          cliente_id?: string | null
          cor?: string | null
          criado_em?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          local?: string | null
          notificacao_enviada?: boolean | null
          observacoes?: string | null
          status?: string | null
          telefone?: string | null
          tipo?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          atualizado_em?: string | null
          cliente_id?: string | null
          cor?: string | null
          criado_em?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          local?: string | null
          notificacao_enviada?: boolean | null
          observacoes?: string | null
          status?: string | null
          telefone?: string | null
          tipo?: string | null
          titulo?: string
          user_id?: string
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
      clientes: {
        Row: {
          criado_em: string | null
          email: string | null
          empresa: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          user_id: string | null
        }
        Insert: {
          criado_em?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Update: {
          criado_em?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clientes_completo_obsoleto: {
        Row: {
          created_at: string | null
          email: string | null
          empresa: string | null
          id: string
          nascimento: string | null
          nome: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          nascimento?: string | null
          nome?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          nascimento?: string | null
          nome?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      configuracoes_empresa: {
        Row: {
          atualizado_em: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          criado_em: string | null
          email_empresa: string | null
          endereco: string | null
          estado: string | null
          facebook: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          nome_empresa: string | null
          site: string | null
          telefone: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          criado_em?: string | null
          email_empresa?: string | null
          endereco?: string | null
          estado?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nome_empresa?: string | null
          site?: string | null
          telefone?: string | null
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          criado_em?: string | null
          email_empresa?: string | null
          endereco?: string | null
          estado?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nome_empresa?: string | null
          site?: string | null
          telefone?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      configuracoes_integracoes: {
        Row: {
          company_logo: string | null
          created_at: string | null
          custom_domain: string | null
          id: string
          logo_url: string | null
          updated_at: string | null
          user_id: string | null
          webhook_enabled: boolean | null
          webhook_url: string | null
        }
        Insert: {
          company_logo?: string | null
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          webhook_enabled?: boolean | null
          webhook_url?: string | null
        }
        Update: {
          company_logo?: string | null
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          webhook_enabled?: boolean | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      contratos: {
        Row: {
          cliente_id: string | null
          criado_em: string | null
          descricao: string | null
          evento_id: string | null
          id: string
          status: string | null
          titulo: string
          user_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          evento_id?: string | null
          id?: string
          status?: string | null
          titulo: string
          user_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          evento_id?: string | null
          id?: string
          status?: string | null
          titulo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_pagamentos: {
        Row: {
          cliente_id: string | null
          criado_em: string | null
          forma: string | null
          id: string
          status: string | null
          user_id: string | null
          valor: number
          vencimento: string | null
        }
        Insert: {
          cliente_id?: string | null
          criado_em?: string | null
          forma?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
          valor: number
          vencimento?: string | null
        }
        Update: {
          cliente_id?: string | null
          criado_em?: string | null
          forma?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
          valor?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_transacoes: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          cliente_id: string | null
          clientename: string | null
          criado_em: string | null
          data_evento: string | null
          data_pagamento: string | null
          data_transacao: string
          data_vencimento: string | null
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          status: string
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          cliente_id?: string | null
          clientename?: string | null
          criado_em?: string | null
          data_evento?: string | null
          data_pagamento?: string | null
          data_transacao?: string
          data_vencimento?: string | null
          descricao: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          cliente_id?: string | null
          clientename?: string | null
          criado_em?: string | null
          data_evento?: string | null
          data_pagamento?: string | null
          data_transacao?: string
          data_vencimento?: string | null
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      indicacoes: {
        Row: {
          atualizado_em: string | null
          cliente_indicado_id: string | null
          cliente_indicador_id: string | null
          criado_em: string | null
          data_conversao: string | null
          data_indicacao: string | null
          email_indicado: string | null
          id: string
          nome_indicado: string | null
          observacoes: string | null
          status: string | null
          telefone_indicado: string | null
          user_id: string
        }
        Insert: {
          atualizado_em?: string | null
          cliente_indicado_id?: string | null
          cliente_indicador_id?: string | null
          criado_em?: string | null
          data_conversao?: string | null
          data_indicacao?: string | null
          email_indicado?: string | null
          id?: string
          nome_indicado?: string | null
          observacoes?: string | null
          status?: string | null
          telefone_indicado?: string | null
          user_id: string
        }
        Update: {
          atualizado_em?: string | null
          cliente_indicado_id?: string | null
          cliente_indicador_id?: string | null
          criado_em?: string | null
          data_conversao?: string | null
          data_indicacao?: string | null
          email_indicado?: string | null
          id?: string
          nome_indicado?: string | null
          observacoes?: string | null
          status?: string | null
          telefone_indicado?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "indicacoes_cliente_indicado_id_fkey"
            columns: ["cliente_indicado_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicacoes_cliente_indicador_id_fkey"
            columns: ["cliente_indicador_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      media_imagens: {
        Row: {
          created_at: string | null
          criado_em: string | null
          filename: string | null
          filesize: number | null
          id: string
          mimetype: string | null
          referencia_id: string | null
          tipo: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          criado_em?: string | null
          filename?: string | null
          filesize?: number | null
          id?: string
          mimetype?: string | null
          referencia_id?: string | null
          tipo?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          criado_em?: string | null
          filename?: string | null
          filesize?: number | null
          id?: string
          mimetype?: string | null
          referencia_id?: string | null
          tipo?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          cliente_id: string | null
          conteudo: string
          criado_em: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          conteudo: string
          criado_em?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          conteudo?: string
          criado_em?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_configuracoes: {
        Row: {
          atualizado_em: string | null
          canal_email: boolean | null
          canal_sms: boolean | null
          canal_whatsapp: boolean | null
          criado_em: string | null
          id: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          atualizado_em?: string | null
          canal_email?: boolean | null
          canal_sms?: boolean | null
          canal_whatsapp?: boolean | null
          criado_em?: string | null
          id?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          atualizado_em?: string | null
          canal_email?: boolean | null
          canal_sms?: boolean | null
          canal_whatsapp?: boolean | null
          criado_em?: string | null
          id?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      mensagens_gatilhos: {
        Row: {
          antecedencia: unknown | null
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          frequencia: unknown | null
          id: string
          template_id: string
          trigger: string
          user_id: string
        }
        Insert: {
          antecedencia?: unknown | null
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          frequencia?: unknown | null
          id?: string
          template_id: string
          trigger: string
          user_id: string
        }
        Update: {
          antecedencia?: unknown | null
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          frequencia?: unknown | null
          id?: string
          template_id?: string
          trigger?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_gatilhos_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mensagens_modelos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_gatilhos_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mensagens_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_logs: {
        Row: {
          canal: string
          criado_em: string | null
          enviado_em: string | null
          erro: string | null
          gatilho_id: string
          id: string
          status: string
          template_id: string
          user_id: string
        }
        Insert: {
          canal: string
          criado_em?: string | null
          enviado_em?: string | null
          erro?: string | null
          gatilho_id: string
          id?: string
          status: string
          template_id: string
          user_id: string
        }
        Update: {
          canal?: string
          criado_em?: string | null
          enviado_em?: string | null
          erro?: string | null
          gatilho_id?: string
          id?: string
          status?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_logs_gatilho_id_fkey"
            columns: ["gatilho_id"]
            isOneToOne: false
            referencedRelation: "mensagens_gatilhos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mensagens_modelos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mensagens_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_modelos: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          categoria: string | null
          conteudo: string
          criado_em: string | null
          id: string
          tags: string[] | null
          titulo: string
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          conteudo: string
          criado_em?: string | null
          id?: string
          tags?: string[] | null
          titulo: string
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          conteudo?: string
          criado_em?: string | null
          id?: string
          tags?: string[] | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          corpo: string | null
          criado_em: string | null
          id: string
          lida: boolean | null
          titulo: string | null
          user_id: string | null
        }
        Insert: {
          corpo?: string | null
          criado_em?: string | null
          id?: string
          lida?: boolean | null
          titulo?: string | null
          user_id?: string | null
        }
        Update: {
          corpo?: string | null
          criado_em?: string | null
          id?: string
          lida?: boolean | null
          titulo?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          atualizado_em: string | null
          cliente_id: string | null
          criado_em: string | null
          data_validade: string | null
          descricao: string | null
          id: string
          itens: Json | null
          observacoes: string | null
          status: string | null
          titulo: string
          user_id: string
          valor_total: number
        }
        Insert: {
          atualizado_em?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          data_validade?: string | null
          descricao?: string | null
          id?: string
          itens?: Json | null
          observacoes?: string | null
          status?: string | null
          titulo: string
          user_id: string
          valor_total: number
        }
        Update: {
          atualizado_em?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          data_validade?: string | null
          descricao?: string | null
          id?: string
          itens?: Json | null
          observacoes?: string | null
          status?: string | null
          titulo?: string
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          avatar_url: string | null
          criado_em: string | null
          email: string
          id: string
          nome: string
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          criado_em?: string | null
          email: string
          id: string
          nome: string
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          criado_em?: string | null
          email?: string
          id?: string
          nome?: string
          role?: string | null
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          cliente_id: string | null
          criado_em: string | null
          data_evento: string | null
          descricao: string | null
          destaque: boolean | null
          id: string
          imagem_capa: string | null
          imagens: string[] | null
          publicado: boolean | null
          tags: string[] | null
          titulo: string
          user_id: string
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          data_evento?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem_capa?: string | null
          imagens?: string[] | null
          publicado?: boolean | null
          tags?: string[] | null
          titulo: string
          user_id: string
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          data_evento?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem_capa?: string | null
          imagens?: string[] | null
          publicado?: boolean | null
          tags?: string[] | null
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_trabalhos: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          id: string
          imagens: string[] | null
          local: string | null
          tags: string[] | null
          titulo: string
          user_id: string
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          imagens?: string[] | null
          local?: string | null
          tags?: string[] | null
          titulo: string
          user_id: string
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          imagens?: string[] | null
          local?: string | null
          tags?: string[] | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      sistema_atividades: {
        Row: {
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string | null
          table_name: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      mensagens_templates: {
        Row: {
          atualizado_em: string | null
          conteudo: string | null
          criado_em: string | null
          id: string | null
          nome: string | null
          tags: string[] | null
          tipo: string | null
          user_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          conteudo?: string | null
          criado_em?: string | null
          id?: string | null
          nome?: string | null
          tags?: string[] | null
          tipo?: string | null
          user_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          conteudo?: string | null
          criado_em?: string | null
          id?: string | null
          nome?: string | null
          tags?: string[] | null
          tipo?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      execute_sql: {
        Args: { statement: string }
        Returns: Json[]
      }
      extrair_valor_entrada: {
        Args: { obs: string }
        Returns: number
      }
      pg_table_exists: {
        Args: { table_name: string }
        Returns: {
          table_found: boolean
        }[]
      }
      verificar_politicas_rls: {
        Args: { nome_tabela: string }
        Returns: {
          nome_politica: string
          tabela: string
          esquema: string
          funcoes: string[]
          comando: string
          usando: string
          verificacao: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
