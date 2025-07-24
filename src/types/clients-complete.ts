
import { Cliente } from './clients';

// Redefinindo ClienteCompleto como um tipo separado (não estendendo Cliente)
// para evitar conflitos de propriedades opcionais/obrigatórias
export interface ClienteCompleto {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null; // Mantendo consistente com Cliente
  empresa?: string;
  user_id: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  observacoes?: string;
  tipo_cliente?: string;
  origem?: string;
  ultima_interacao?: string;
  data_nascimento?: string | null;
}
