
// Remember to extend the StandardizedMessage type to include the isUpdate flag
// This will help us identify updated messages in the UI

export interface ContactMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

export interface MensagemDeContato {
  id: string;
  criado_em: string;
  nome: string;
  e_mail: string;
  telefone: string;
  mensagem: string;
}

export interface StandardizedMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  original_table?: string;
  isUpdate?: boolean; // Flag to indicate if this is an update to an existing message
}
