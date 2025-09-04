export interface Contract {
  id: string;
  id_contrato: string;
  titulo: string;
  status: string;
  valor: number;
  cliente_id?: string;
  nome_cliente?: string;
  cpf_cliente?: string;
  telefone_cliente?: string;
  email_cliente?: string;
  endereco_cliente?: string;
  data_evento?: string;
  local_evento?: string;
  tipo_evento?: string;
  conteudo?: string;
  data_assinatura?: string;
  data_expiracao?: string;
  user_id: string;
  criado_em?: string;
  success?: boolean;
}

export interface ContractData extends Contract {
  id_contrato: string;
}