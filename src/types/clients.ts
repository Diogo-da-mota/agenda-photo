
import { ClienteFormData as ClienteFormDataService, Cliente as ClienteService } from '@/services/clientService';

// Re-exportar as interfaces para manter compatibilidade com código existente
export type { ClienteFormDataService as ClienteFormData, ClienteService as Cliente };

// Interface estendida para dados adicionais do cliente, se necessário
export interface ClienteExtended extends ClienteService {
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  data_nascimento?: string | null;
}

// Definindo a implementação do ClienteFormData para garantir compatibilidade
export interface ClientFormData {
  nome: string;
  telefone: string | null;
  data_nascimento?: string | null;
  evento?: string | null;
  data_evento?: string | null;
  valor_evento?: number | null;
}

// Para compatibilidade com componentes antigos que esperam o tipo Cliente
export interface Client extends ClienteService {
  data_nascimento?: string | null;
  email?: string | null;
}
