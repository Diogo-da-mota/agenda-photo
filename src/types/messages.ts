
/**
 * Types for different message formats in the application
 */

// Standard contact message format
export interface ContactMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

// Portuguese contact message format
export interface MensagemDeContato {
  id: string;
  criado_em: string;
  nome: string;
  e_mail: string;
  telefone: string;
  mensagem: string;
}

// Standardized message type that both tables can be mapped to
export interface StandardizedMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  original_table?: string; // Track which table the message came from
}
