export interface Contract {
  id: string;
  titulo: string;
  conteudo: string;
  status: string;
  data_criacao: string;
  data_expiracao?: string;
  valor_total: number;
  valor_sinal: number;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone?: string;
  id_amigavel?: number;
  nome_cliente?: string;
  tipo_evento?: string;
  signatureInfo?: any;
  clientName?: string;
  clientes?: any;
}

export interface ContractFormData {
  clientName: string;
  clientEmail: string;
  phoneNumber?: string;
  cpfCliente?: string;
  enderecoCliente?: string;
  eventType: string;
  eventDate: Date;
  eventTime?: string;
  eventLocation: string;
  price: number;
  downPayment: number;
  termsAndConditions: string;
}