// Temporary Supabase types - to replace corrupted types.ts file
export type Database = {
  public: {
    Tables: {
      mensagens_programadas: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          titulo?: string;
          data_programada?: string;
          cancelado_em?: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          titulo?: string;
          data_programada?: string;
          cancelado_em?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message?: string;
          titulo?: string;
          data_programada?: string;
          cancelado_em?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      eventos: {
        Row: {
          id: string;
          user_id: string;
          nome_cliente: string;
          tipo_evento: string;
          data_inicio: string;
          hora_inicio: string;
          hora_fim?: string;
          local: string;
          observacoes?: string;
          status: string;
          telefone_cliente?: string;
          email_cliente?: string;
          valor_total?: number;
          valor_entrada?: number;
          lembrete_enviado?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome_cliente: string;
          tipo_evento: string;
          data_inicio: string;
          hora_inicio: string;
          hora_fim?: string;
          local: string;
          observacoes?: string;
          status?: string;
          telefone_cliente?: string;
          email_cliente?: string;
          valor_total?: number;
          valor_entrada?: number;
          lembrete_enviado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome_cliente?: string;
          tipo_evento?: string;
          data_inicio?: string;
          hora_inicio?: string;
          hora_fim?: string;
          local?: string;
          observacoes?: string;
          status?: string;
          telefone_cliente?: string;
          email_cliente?: string;
          valor_total?: number;
          valor_entrada?: number;
          lembrete_enviado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, any>;
        Returns: any;
      };
    };
  };
};