export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agenda_eventos: {
        Row: {
          atualizado_em: string | null
          cliente_id: string | null
          cor: string | null
          cpf_cliente: string | null
          criado_em: string | null
          data_fim: string
          data_inicio: string
          data_nascimento: string | null
          descricao: string | null
          endereco_cliente: string | null
          id: string
          local: string | null
          notificacao_enviada: boolean | null
          observacoes: string | null
          status: string | null
          telefone: string | null
          tipo: string | null
          titulo: string
          user_id: string
          valor_entrada: number | null
          valor_restante: number | null
          valor_total: number | null
        }
        Insert: {
          atualizado_em?: string | null
          cliente_id?: string | null
          cor?: string | null
          cpf_cliente?: string | null
          criado_em?: string | null
          data_fim: string
          data_inicio: string
          data_nascimento?: string | null
          descricao?: string | null
          endereco_cliente?: string | null
          id?: string
          local?: string | null
          notificacao_enviada?: boolean | null
          observacoes?: string | null
          status?: string | null
          telefone?: string | null
          tipo?: string | null
          titulo: string
          user_id: string
          valor_entrada?: number | null
          valor_restante?: number | null
          valor_total?: number | null
        }
        Update: {
          atualizado_em?: string | null
          cliente_id?: string | null
          cor?: string | null
          cpf_cliente?: string | null
          criado_em?: string | null
          data_fim?: string
          data_inicio?: string
          data_nascimento?: string | null
          descricao?: string | null
          endereco_cliente?: string | null
          id?: string
          local?: string | null
          notificacao_enviada?: boolean | null
          observacoes?: string | null
          status?: string | null
          telefone?: string | null
          tipo?: string | null
          titulo?: string
          user_id?: string
          valor_entrada?: number | null
          valor_restante?: number | null
          valor_total?: number | null
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
      agendamentos: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          id_cliente: string | null
          local: string | null
          notas: string | null
          status: string
          tipo_servico: string | null
          titulo: string
          user_id: string | null
          valor: number | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          id_cliente?: string | null
          local?: string | null
          notas?: string | null
          status?: string
          tipo_servico?: string | null
          titulo: string
          user_id?: string | null
          valor?: number | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          id_cliente?: string | null
          local?: string | null
          notas?: string | null
          status?: string
          tipo_servico?: string | null
          titulo?: string
          user_id?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_id_fotografo_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      anexos_contrato: {
        Row: {
          criado_em: string | null
          id: string
          id_contrato: string | null
          id_user: string
          nome: string
          tamanho: number
          tipo: string
          url: string
        }
        Insert: {
          criado_em?: string | null
          id?: string
          id_contrato?: string | null
          id_user: string
          nome: string
          tamanho: number
          tipo: string
          url: string
        }
        Update: {
          criado_em?: string | null
          id?: string
          id_contrato?: string | null
          id_user?: string
          nome?: string
          tamanho?: number
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_contrato_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      atividades: {
        Row: {
          criado_em: string
          descricao: string
          id: string
          link_relacionado: string | null
          metadata: Json | null
          tipo: string
          user_id: string
        }
        Insert: {
          criado_em?: string
          descricao: string
          id?: string
          link_relacionado?: string | null
          metadata?: Json | null
          tipo: string
          user_id: string
        }
        Update: {
          criado_em?: string
          descricao?: string
          id?: string
          link_relacionado?: string | null
          metadata?: Json | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          data_evento: string | null
          email: string | null
          evento: string | null
          id: string
          nome: string
          telefone: string | null
          user_id: string
          valor_evento: number | null
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          data_evento?: string | null
          email?: string | null
          evento?: string | null
          id?: string
          nome: string
          telefone?: string | null
          user_id: string
          valor_evento?: number | null
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          data_evento?: string | null
          email?: string | null
          evento?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          user_id?: string
          valor_evento?: number | null
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
          user_id: string
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
          user_id: string
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
          user_id?: string
          webhook_enabled?: boolean | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      contratos: {
        Row: {
          anexos: Json | null
          assinatura_url: string | null
          cliente_id: string | null
          conteudo: string | null
          cpf_cliente: string | null
          criado_em: string | null
          data_assinatura: string | null
          data_evento: string | null
          data_expiracao: string | null
          descricao: string | null
          email_cliente: string | null
          endereco_cliente: string | null
          evento_id: string | null
          historico: Json | null
          hora_evento: string | null
          id: string
          id_amigavel: number | null
          id_contrato: string
          local_evento: string | null
          modelos_contrato: string | null
          nome_cliente: string | null
          observacoes: string | null
          status: string | null
          telefone_cliente: string | null
          tipo_evento: string | null
          titulo: string
          user_id: string
          valor: number | null
          valor_sinal: number | null
          valor_total: number | null
        }
        Insert: {
          anexos?: Json | null
          assinatura_url?: string | null
          cliente_id?: string | null
          conteudo?: string | null
          cpf_cliente?: string | null
          criado_em?: string | null
          data_assinatura?: string | null
          data_evento?: string | null
          data_expiracao?: string | null
          descricao?: string | null
          email_cliente?: string | null
          endereco_cliente?: string | null
          evento_id?: string | null
          historico?: Json | null
          hora_evento?: string | null
          id?: string
          id_amigavel?: number | null
          id_contrato: string
          local_evento?: string | null
          modelos_contrato?: string | null
          nome_cliente?: string | null
          observacoes?: string | null
          status?: string | null
          telefone_cliente?: string | null
          tipo_evento?: string | null
          titulo: string
          user_id: string
          valor?: number | null
          valor_sinal?: number | null
          valor_total?: number | null
        }
        Update: {
          anexos?: Json | null
          assinatura_url?: string | null
          cliente_id?: string | null
          conteudo?: string | null
          cpf_cliente?: string | null
          criado_em?: string | null
          data_assinatura?: string | null
          data_evento?: string | null
          data_expiracao?: string | null
          descricao?: string | null
          email_cliente?: string | null
          endereco_cliente?: string | null
          evento_id?: string | null
          historico?: Json | null
          hora_evento?: string | null
          id?: string
          id_amigavel?: number | null
          id_contrato?: string
          local_evento?: string | null
          modelos_contrato?: string | null
          nome_cliente?: string | null
          observacoes?: string | null
          status?: string | null
          telefone_cliente?: string | null
          tipo_evento?: string | null
          titulo?: string
          user_id?: string
          valor?: number | null
          valor_sinal?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "agenda_eventos"
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
      dashboard_cliente: {
        Row: {
          data_agendamento: string
          data_atualizacao: string | null
          data_criacao: string | null
          email_cliente: string | null
          forma_contato: string | null
          id: string
          ip_origem: string | null
          nome_cliente: string
          observacoes_cliente: string | null
          origem_agendamento: string | null
          status_agendamento: string | null
          telefone_cliente: string | null
          tipo_servico: string
          usuario_id: string
          valor_orcamento: number | null
        }
        Insert: {
          data_agendamento: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          email_cliente?: string | null
          forma_contato?: string | null
          id?: string
          ip_origem?: string | null
          nome_cliente: string
          observacoes_cliente?: string | null
          origem_agendamento?: string | null
          status_agendamento?: string | null
          telefone_cliente?: string | null
          tipo_servico: string
          usuario_id: string
          valor_orcamento?: number | null
        }
        Update: {
          data_agendamento?: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          email_cliente?: string | null
          forma_contato?: string | null
          id?: string
          ip_origem?: string | null
          nome_cliente?: string
          observacoes_cliente?: string | null
          origem_agendamento?: string | null
          status_agendamento?: string | null
          telefone_cliente?: string | null
          tipo_servico?: string
          usuario_id?: string
          valor_orcamento?: number | null
        }
        Relationships: []
      }
      entregar_imagens: {
        Row: {
          altura: number | null
          atualizado_em: string | null
          criado_em: string | null
          data_entrega: string | null
          data_expiracao: string | null
          descricao: string | null
          destaque: boolean | null
          e_imagem_principal: boolean | null
          formato: string | null
          galeria_grupo_id: string
          galeria_id: string | null
          id: string
          largura: number | null
          marca_dagua: boolean | null
          nome_arquivo: string
          nome_original: string | null
          observacoes: string | null
          ordem: number | null
          permitir_compartilhamento: boolean | null
          permitir_download: boolean | null
          senha_acesso: string | null
          slug: string
          status: string
          tamanho_arquivo: number | null
          titulo: string
          total_acessos: number | null
          total_downloads: number | null
          total_fotos: number | null
          ultimo_acesso: string | null
          url_imagem: string
          url_preview: string | null
          url_thumbnail: string | null
          user_id: string
        }
        Insert: {
          altura?: number | null
          atualizado_em?: string | null
          criado_em?: string | null
          data_entrega?: string | null
          data_expiracao?: string | null
          descricao?: string | null
          destaque?: boolean | null
          e_imagem_principal?: boolean | null
          formato?: string | null
          galeria_grupo_id?: string
          galeria_id?: string | null
          id?: string
          largura?: number | null
          marca_dagua?: boolean | null
          nome_arquivo: string
          nome_original?: string | null
          observacoes?: string | null
          ordem?: number | null
          permitir_compartilhamento?: boolean | null
          permitir_download?: boolean | null
          senha_acesso?: string | null
          slug: string
          status?: string
          tamanho_arquivo?: number | null
          titulo: string
          total_acessos?: number | null
          total_downloads?: number | null
          total_fotos?: number | null
          ultimo_acesso?: string | null
          url_imagem: string
          url_preview?: string | null
          url_thumbnail?: string | null
          user_id: string
        }
        Update: {
          altura?: number | null
          atualizado_em?: string | null
          criado_em?: string | null
          data_entrega?: string | null
          data_expiracao?: string | null
          descricao?: string | null
          destaque?: boolean | null
          e_imagem_principal?: boolean | null
          formato?: string | null
          galeria_grupo_id?: string
          galeria_id?: string | null
          id?: string
          largura?: number | null
          marca_dagua?: boolean | null
          nome_arquivo?: string
          nome_original?: string | null
          observacoes?: string | null
          ordem?: number | null
          permitir_compartilhamento?: boolean | null
          permitir_download?: boolean | null
          senha_acesso?: string | null
          slug?: string
          status?: string
          tamanho_arquivo?: number | null
          titulo?: string
          total_acessos?: number | null
          total_downloads?: number | null
          total_fotos?: number | null
          ultimo_acesso?: string | null
          url_imagem?: string
          url_preview?: string | null
          url_thumbnail?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financeiro_categorias: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          id: string
          nome: string
          tipo: string
          user_id: string
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          id: string
          nome: string
          tipo: string
          user_id: string
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          nome?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      financeiro_despesas: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          categoria_id: string | null
          cliente_id: string | null
          criado_em: string | null
          data_transacao: string
          descricao: string
          forma_pagamento: string | null
          forma_pagamento_id: string | null
          id: string
          observacoes: string | null
          status: string
          user_id: string
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          categoria_id?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          data_transacao?: string
          descricao: string
          forma_pagamento?: string | null
          forma_pagamento_id?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          user_id: string
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          categoria_id?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          data_transacao?: string
          descricao?: string
          forma_pagamento?: string | null
          forma_pagamento_id?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_despesas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "financeiro_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_despesas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_despesas_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_formas_pagamento"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_formas_pagamento: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          id: string
          nome: string
          user_id: string
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      financeiro_transacoes: {
        Row: {
          created_at: string | null
          data_transacao: string
          descricao: string
          evento_id: string
          id: string
          status: string
          tipo: string
          updated_at: string | null
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string | null
          data_transacao: string
          descricao: string
          evento_id: string
          id?: string
          status: string
          tipo: string
          updated_at?: string | null
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string | null
          data_transacao?: string
          descricao?: string
          evento_id?: string
          id?: string
          status?: string
          tipo?: string
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      financeiro_transacoes_historico: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          dados: Json
          id: number
          operacao: string
          transacao_id: string
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          dados: Json
          id?: never
          operacao: string
          transacao_id: string
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          dados?: Json
          id?: never
          operacao?: string
          transacao_id?: string
        }
        Relationships: []
      }
      indicacoes: {
        Row: {
          atualizado_em: string | null
          cliente_indicado_id: string | null
          cliente_indicador_id: string | null
          codigo_referencia: string | null
          criado_em: string | null
          data_conversao: string | null
          data_indicacao: string | null
          email_indicado: string | null
          id: string
          link_indicacao: string | null
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
          codigo_referencia?: string | null
          criado_em?: string | null
          data_conversao?: string | null
          data_indicacao?: string | null
          email_indicado?: string | null
          id?: string
          link_indicacao?: string | null
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
          codigo_referencia?: string | null
          criado_em?: string | null
          data_conversao?: string | null
          data_indicacao?: string | null
          email_indicado?: string | null
          id?: string
          link_indicacao?: string | null
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
      integracoes_calendario: {
        Row: {
          access_token: string
          created_at: string | null
          id: string
          refresh_token: string | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          cliente_id: string | null
          conteudo: string
          criado_em: string | null
          id: string
          user_id: string
        }
        Insert: {
          cliente_id?: string | null
          conteudo: string
          criado_em?: string | null
          id?: string
          user_id: string
        }
        Update: {
          cliente_id?: string | null
          conteudo?: string
          criado_em?: string | null
          id?: string
          user_id?: string
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
      mensagens_programadas: {
        Row: {
          conteudo_mensagem: string
          created_at: string | null
          data_envio: string
          evento_id: string | null
          id: string
          status: string | null
          telefone: string
          tempo_antecedencia: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          conteudo_mensagem: string
          created_at?: string | null
          data_envio: string
          evento_id?: string | null
          id?: string
          status?: string | null
          telefone: string
          tempo_antecedencia: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          conteudo_mensagem?: string
          created_at?: string | null
          data_envio?: string
          evento_id?: string | null
          id?: string
          status?: string | null
          telefone?: string
          tempo_antecedencia?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_programadas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "agenda_eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      modelos_contrato: {
        Row: {
          atualizado_em: string | null
          conteudo: string
          criado_em: string | null
          id: string
          id_fotografo: string | null
          nome: string
          padrao: boolean | null
        }
        Insert: {
          atualizado_em?: string | null
          conteudo: string
          criado_em?: string | null
          id?: string
          id_fotografo?: string | null
          nome: string
          padrao?: boolean | null
        }
        Update: {
          atualizado_em?: string | null
          conteudo?: string
          criado_em?: string | null
          id?: string
          id_fotografo?: string | null
          nome?: string
          padrao?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "modelos_contrato_id_fotografo_fkey"
            columns: ["id_fotografo"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          corpo: string | null
          criado_em: string | null
          id: string
          lida: boolean | null
          titulo: string | null
          user_id: string
        }
        Insert: {
          corpo?: string | null
          criado_em?: string | null
          id?: string
          lida?: boolean | null
          titulo?: string | null
          user_id: string
        }
        Update: {
          corpo?: string | null
          criado_em?: string | null
          id?: string
          lida?: boolean | null
          titulo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          atualizado_em: string | null
          comprovante_url: string | null
          criado_em: string | null
          data_pagamento: string | null
          data_vencimento: string | null
          id: string
          id_cliente: string | null
          id_contrato: string | null
          id_fotografo: string | null
          metodo_pagamento: string | null
          notas: string | null
          status: string
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          comprovante_url?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          id?: string
          id_cliente?: string | null
          id_contrato?: string | null
          id_fotografo?: string | null
          metodo_pagamento?: string | null
          notas?: string | null
          status?: string
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          comprovante_url?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          id?: string
          id_cliente?: string | null
          id_contrato?: string | null
          id_fotografo?: string | null
          metodo_pagamento?: string | null
          notas?: string | null
          status?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_id_fotografo_fkey"
            columns: ["id_fotografo"]
            isOneToOne: false
            referencedRelation: "usuarios"
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
      portfolio_trabalhos: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          criado_em: string | null
          data_evento: string | null
          descricao: string | null
          destaque: boolean | null
          id: string
          imagem_capa: string | null
          imagens: string[] | null
          local: string | null
          publicado: boolean | null
          tags: string[] | null
          titulo: string
          url_imagem_drive: string | null
          urls_drive: string[] | null
          user_id: string
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          data_evento?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem_capa?: string | null
          imagens?: string[] | null
          local?: string | null
          publicado?: boolean | null
          tags?: string[] | null
          titulo: string
          url_imagem_drive?: string | null
          urls_drive?: string[] | null
          user_id: string
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          data_evento?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem_capa?: string | null
          imagens?: string[] | null
          local?: string | null
          publicado?: boolean | null
          tags?: string[] | null
          titulo?: string
          url_imagem_drive?: string | null
          urls_drive?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      relatorios: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          cliente_id: string | null
          criado_em: string | null
          dados: Json
          despesas_total: number
          id: string
          observacoes: string | null
          periodo: string
          receita_total: number
          status: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          dados: Json
          despesas_total?: number
          id?: string
          observacoes?: string | null
          periodo: string
          receita_total?: number
          status?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          dados?: Json
          despesas_total?: number
          id?: string
          observacoes?: string | null
          periodo?: string
          receita_total?: number
          status?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_orcamento: {
        Row: {
          condicoes_pagamento: string | null
          criado_por: string | null
          data_atualizacao: string | null
          data_criacao: string | null
          descricao_servicos: string | null
          id: string
          observacoes_internas: string | null
          prazo_validade: string | null
          solicitacao_id: string
          valor_proposto: number | null
        }
        Insert: {
          condicoes_pagamento?: string | null
          criado_por?: string | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao_servicos?: string | null
          id?: string
          observacoes_internas?: string | null
          prazo_validade?: string | null
          solicitacao_id: string
          valor_proposto?: number | null
        }
        Update: {
          condicoes_pagamento?: string | null
          criado_por?: string | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao_servicos?: string | null
          id?: string
          observacoes_internas?: string | null
          prazo_validade?: string | null
          solicitacao_id?: string
          valor_proposto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "respostas_orcamento_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_orcamento"
            referencedColumns: ["id"]
          },
        ]
      }
      sistema_atividades: {
        Row: {
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string | null
          table_name: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sistema_backups: {
        Row: {
          criado_em: string | null
          dados: Json | null
          data_backup: string | null
          id: string
          status: string | null
          tipo: string
          user_id: string | null
        }
        Insert: {
          criado_em?: string | null
          dados?: Json | null
          data_backup?: string | null
          id?: string
          status?: string | null
          tipo: string
          user_id?: string | null
        }
        Update: {
          criado_em?: string | null
          dados?: Json | null
          data_backup?: string | null
          id?: string
          status?: string | null
          tipo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      solicitacoes_orcamento: {
        Row: {
          data_atualizacao: string | null
          data_criacao: string | null
          data_pretendida: string | null
          detalhes_adicionais: string | null
          duracao_estimada: string | null
          email: string
          id: string
          local_evento: string | null
          nome_completo: string
          numero_participantes: number | null
          numero_referencia: string
          status: string | null
          telefone: string
          tipo_evento: string
          user_id: string
        }
        Insert: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          data_pretendida?: string | null
          detalhes_adicionais?: string | null
          duracao_estimada?: string | null
          email: string
          id?: string
          local_evento?: string | null
          nome_completo: string
          numero_participantes?: number | null
          numero_referencia: string
          status?: string | null
          telefone: string
          tipo_evento: string
          user_id: string
        }
        Update: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          data_pretendida?: string | null
          detalhes_adicionais?: string | null
          duracao_estimada?: string | null
          email?: string
          id?: string
          local_evento?: string | null
          nome_completo?: string
          numero_participantes?: number | null
          numero_referencia?: string
          status?: string | null
          telefone?: string
          tipo_evento?: string
          user_id?: string
        }
        Relationships: []
      }
      tipos_evento: {
        Row: {
          ativo: boolean | null
          descricao: string | null
          id: number
          nome: string
          ordem_exibicao: number | null
        }
        Insert: {
          ativo?: boolean | null
          descricao?: string | null
          id?: number
          nome: string
          ordem_exibicao?: number | null
        }
        Update: {
          ativo?: boolean | null
          descricao?: string | null
          id?: number
          nome?: string
          ordem_exibicao?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          criado_em: string | null
          email: string
          id: string
          nome: string | null
          papel: string
        }
        Insert: {
          criado_em?: string | null
          email: string
          id: string
          nome?: string | null
          papel?: string
        }
        Update: {
          criado_em?: string | null
          email?: string
          id?: string
          nome?: string | null
          papel?: string
        }
        Relationships: []
      }
    }
    Views: {
      galeria: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          data_entrega: string | null
          data_expiracao: string | null
          descricao: string | null
          galeria_grupo_id: string | null
          marca_dagua: boolean | null
          permitir_compartilhamento: boolean | null
          permitir_download: boolean | null
          senha_acesso: string | null
          slug: string | null
          status: string | null
          titulo: string | null
          total_acessos: number | null
          total_downloads: number | null
          total_fotos: number | null
          ultimo_acesso: string | null
          user_id: string | null
        }
        Relationships: []
      }
      galerias_agrupadas: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          data_entrega: string | null
          data_expiracao: string | null
          descricao: string | null
          galeria_grupo_id: string | null
          id: string | null
          marca_dagua: boolean | null
          permitir_compartilhamento: boolean | null
          permitir_download: boolean | null
          senha_acesso: string | null
          status: string | null
          titulo: string | null
          total_acessos: number | null
          total_downloads: number | null
          total_fotos: number | null
          ultimo_acesso: string | null
          url_imagem_principal: string | null
          url_preview_principal: string | null
          user_id: string | null
        }
        Relationships: []
      }
      imagens_galeria: {
        Row: {
          altura: number | null
          atualizado_em: string | null
          criado_em: string | null
          destaque: boolean | null
          e_imagem_principal: boolean | null
          formato: string | null
          galeria_grupo_id: string | null
          id: string | null
          largura: number | null
          nome_arquivo: string | null
          nome_original: string | null
          ordem: number | null
          tamanho_arquivo: number | null
          url_imagem: string | null
          url_preview: string | null
          url_thumbnail: string | null
          user_id: string | null
        }
        Insert: {
          altura?: number | null
          atualizado_em?: string | null
          criado_em?: string | null
          destaque?: boolean | null
          e_imagem_principal?: boolean | null
          formato?: string | null
          galeria_grupo_id?: string | null
          id?: string | null
          largura?: number | null
          nome_arquivo?: string | null
          nome_original?: string | null
          ordem?: number | null
          tamanho_arquivo?: number | null
          url_imagem?: string | null
          url_preview?: string | null
          url_thumbnail?: string | null
          user_id?: string | null
        }
        Update: {
          altura?: number | null
          atualizado_em?: string | null
          criado_em?: string | null
          destaque?: boolean | null
          e_imagem_principal?: boolean | null
          formato?: string | null
          galeria_grupo_id?: string | null
          id?: string | null
          largura?: number | null
          nome_arquivo?: string | null
          nome_original?: string | null
          ordem?: number | null
          tamanho_arquivo?: number | null
          url_imagem?: string | null
          url_preview?: string | null
          url_thumbnail?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      projecao_fluxo_caixa: {
        Row: {
          data: string | null
          fluxo_diario: number | null
          saldo_acumulado: number | null
        }
        Relationships: []
      }
      relatorio_financeiro: {
        Row: {
          mes: string | null
          quantidade_transacoes: number | null
          tipo: string | null
          total_valor: number | null
        }
        Relationships: []
      }
      resumo_financeiro_mensal: {
        Row: {
          mes: string | null
          saldo_mensal: number | null
          total_despesas: number | null
          total_receitas: number | null
        }
        Relationships: []
      }
      v_galerias_agrupadas: {
        Row: {
          data_criacao: string | null
          data_expiracao: string | null
          descricao: string | null
          galeria_grupo_id: string | null
          imagem_capa: string | null
          marca_dagua: boolean | null
          permitir_compartilhamento: boolean | null
          permitir_download: boolean | null
          senha_acesso: string | null
          slug: string | null
          status: string | null
          thumbnail_capa: string | null
          titulo: string | null
          total_acessos_galeria: number | null
          total_downloads_galeria: number | null
          total_fotos_real: number | null
          ultima_atualizacao: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_portfolio_drive_url: {
        Args: { p_image_url: string; p_portfolio_id: string }
        Returns: Json
      }
      add_portfolio_image: {
        Args: { p_image_url: string; p_portfolio_id: string }
        Returns: Json
      }
      adicionar_imagem_galeria: {
        Args: {
          p_altura?: number
          p_destaque?: boolean
          p_formato?: string
          p_galeria_id: string
          p_largura?: number
          p_nome_arquivo: string
          p_nome_original?: string
          p_ordem?: number
          p_tamanho_arquivo?: number
          p_url_imagem: string
          p_url_preview?: string
          p_url_thumbnail?: string
        }
        Returns: Json
      }
      busca_avancada: {
        Args: { termo: string }
        Returns: {
          data_ref: string
          descricao: string
          id: string
          relevancia: number
          tipo: string
          titulo: string
        }[]
      }
      busca_avancada_transacoes: {
        Args: {
          data_fim?: string
          data_inicio?: string
          status_transacao?: string
          termo_busca?: string
          tipo_transacao?: string
        }
        Returns: {
          created_at: string | null
          data_transacao: string
          descricao: string
          evento_id: string
          id: string
          status: string
          tipo: string
          updated_at: string | null
          user_id: string
          valor: number
        }[]
      }
      buscar_galeria_publica: {
        Args: { p_senha?: string; p_slug: string }
        Returns: {
          data_entrega: string
          data_evento: string
          descricao: string
          id: string
          imagens: Json
          marca_dagua: boolean
          permitir_compartilhamento: boolean
          permitir_download: boolean
          titulo: string
          total_fotos: number
        }[]
      }
      buscar_imagens_galeria: {
        Args: { p_grupo_id: string }
        Returns: {
          altura: number
          destaque: boolean
          e_imagem_principal: boolean
          formato: string
          id: string
          largura: number
          nome_arquivo: string
          nome_original: string
          ordem: number
          tamanho_arquivo: number
          url_imagem: string
          url_preview: string
          url_thumbnail: string
        }[]
      }
      calcular_faturamento_dinamico: {
        Args: { p_user_id: string }
        Returns: number
      }
      calcular_fluxo_por_categoria: {
        Args: { data_fim?: string; data_inicio?: string }
        Returns: {
          categoria: string
          saldo: number
          total_despesas: number
          total_receitas: number
        }[]
      }
      calcular_metricas_financeiras: {
        Args: { data_fim: string; data_inicio: string }
        Returns: {
          metrica: string
          valor: number
        }[]
      }
      calcular_saldo_atual: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      calcular_saldo_cliente: {
        Args: { id_cliente: string }
        Returns: number
      }
      calcular_saldo_periodo: {
        Args: { data_fim: string; data_inicio: string }
        Returns: number
      }
      calcular_saldo_usuario: {
        Args: { id_usuario: string }
        Returns: number
      }
      check_array_urls: {
        Args: { arr: string[] }
        Returns: boolean
      }
      check_expired_contracts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_policy_exists: {
        Args: { policy_name: string; table_name: string }
        Returns: boolean
      }
      check_policy_status: {
        Args: { table_name?: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          action_type: string
          max_attempts?: number
          user_identifier: string
          window_minutes?: number
        }
        Returns: boolean
      }
      check_rls_status: {
        Args: { table_name: string }
        Returns: boolean
      }
      check_trigger_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          issues: string[]
          table_name: string
          trigger_status: string
        }[]
      }
      clean_duplicate_transactions: {
        Args: Record<PropertyKey, never>
        Returns: {
          deleted_count: number
        }[]
      }
      criar_nova_indicacao: {
        Args: {
          email_indicado_in: string
          nome_indicado_in: string
          telefone_indicado_in: string
        }
        Returns: {
          atualizado_em: string | null
          cliente_indicado_id: string | null
          cliente_indicador_id: string | null
          codigo_referencia: string | null
          criado_em: string | null
          data_conversao: string | null
          data_indicacao: string | null
          email_indicado: string | null
          id: string
          link_indicacao: string | null
          nome_indicado: string | null
          observacoes: string | null
          status: string | null
          telefone_indicado: string | null
          user_id: string
        }
      }
      execute_sql: {
        Args: { statement: string }
        Returns: Json[]
      }
      extrair_valor_entrada: {
        Args: { obs: string }
        Returns: number
      }
      find_duplicate_transactions: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          evento_id: string
          tipo: string
          transaction_ids: string[]
          user_id: string
          valor: number
        }[]
      }
      gerar_numero_referencia: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_galeria_completa: {
        Args: { p_grupo_id: string }
        Returns: {
          e_principal: boolean
          id: string
          nome_arquivo: string
          ordem: number
          url_imagem: string
        }[]
      }
      get_public_contract: {
        Args: { contract_id: string }
        Returns: {
          assinado_por: string
          assinatura_url: string
          atualizado_em: string
          cliente_email: string
          cliente_nome: string
          cliente_telefone: string
          conteudo: string
          criado_em: string
          data_assinatura: string
          data_expiracao: string
          id: string
          id_agendamento: string
          id_cliente: string
          id_fotografo: string
          ip_assinatura: string
          status: string
          titulo: string
          valor_sinal: number
          valor_total: number
        }[]
      }
      get_storage_stats: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_storage_usage: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      incrementar_acesso_galeria: {
        Args: { galeria_slug: string }
        Returns: undefined
      }
      incrementar_download_galeria: {
        Args: { galeria_id: string }
        Returns: undefined
      }
      inserir_dados_backup_completo: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      inserir_dados_backup_exemplo: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      inserir_galeria_com_imagens: {
        Args: {
          p_data_evento: string
          p_data_expiracao: string
          p_descricao: string
          p_imagens: Json
          p_marca_dagua: boolean
          p_observacoes: string
          p_permitir_compartilhamento: boolean
          p_permitir_download: boolean
          p_senha_acesso: string
          p_slug: string
          p_status: string
          p_titulo: string
          p_user_id: string
        }
        Returns: string
      }
      listar_galerias_usuario: {
        Args: Record<PropertyKey, never> | { p_user_id?: string }
        Returns: {
          atualizado_em: string
          cliente_email: string
          cliente_id: string
          cliente_nome: string
          criado_em: string
          data_entrega: string
          data_evento: string
          data_expiracao: string
          descricao: string
          evento_id: string
          evento_titulo: string
          id: string
          imagens: Json
          link_galeria: string
          marca_dagua: boolean
          observacoes: string
          permitir_compartilhamento: boolean
          permitir_download: boolean
          senha_acesso: string
          slug: string
          status: string
          tags: string[]
          titulo: string
          total_acessos: number
          total_downloads: number
          total_fotos: number
          ultimo_acesso: string
        }[]
      }
      log_security_event: {
        Args: {
          event_details: Json
          event_type: string
          user_id_param?: string
        }
        Returns: undefined
      }
      log_security_event_enhanced: {
        Args: {
          event_details: Json
          event_type: string
          ip_address?: string
          user_id_param?: string
        }
        Returns: undefined
      }
      migrar_categorias_despesas: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      migrar_entregar_imagens_para_galeria: {
        Args: Record<PropertyKey, never>
        Returns: {
          galerias_criadas: number
          imagens_migradas: number
        }[]
      }
      migrar_formas_pagamento_despesas: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      obter_estatisticas_galerias: {
        Args: Record<PropertyKey, never>
        Returns: {
          criado_em: string
          data_expiracao: string
          id: string
          slug: string
          status: string
          titulo: string
          total_acessos: number
          total_imagens: number
          ultimo_acesso: string
        }[]
      }
      pg_table_exists: {
        Args: { table_name: string }
        Returns: {
          table_found: boolean
        }[]
      }
      registrar_evento_autenticacao: {
        Args: { id_usuario: string; metadados?: Json; tipo_evento: string }
        Returns: undefined
      }
      remover_imagem_galeria: {
        Args: { p_galeria_id: string; p_imagem_id: string }
        Returns: boolean
      }
      reordenar_imagens_galeria: {
        Args: { p_galeria_id: string; p_ordem_imagens: string[] }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sincronizar_evento_atomico: {
        Args: {
          p_descricao: string
          p_evento_id: string
          p_user_id: string
          p_valor_entrada: number
          p_valor_restante: number
        }
        Returns: {
          message: string
          success: boolean
          transactions_created: number
        }[]
      }
      test_trigger_functionality: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      validate_file_upload: {
        Args: { content_type: string; file_name: string; file_size: number }
        Returns: boolean
      }
      validate_input_security: {
        Args: { input_text: string }
        Returns: boolean
      }
      validate_redirect_url: {
        Args: { url: string }
        Returns: boolean
      }
      verificar_politicas_rls: {
        Args: { nome_tabela: string }
        Returns: {
          comando: string
          esquema: string
          funcoes: string[]
          nome_politica: string
          tabela: string
          usando: string
          verificacao: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "usuario" | "moderador"
      role_perfil: "admin" | "usuario" | "cliente"
      status_contrato: "pendente" | "assinado" | "cancelado" | "expirado"
      status_evento: "agendado" | "confirmado" | "cancelado" | "concluido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "usuario", "moderador"],
      role_perfil: ["admin", "usuario", "cliente"],
      status_contrato: ["pendente", "assinado", "cancelado", "expirado"],
      status_evento: ["agendado", "confirmado", "cancelado", "concluido"],
    },
  },
} as const
