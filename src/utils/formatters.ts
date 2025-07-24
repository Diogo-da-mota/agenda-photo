// Função para formatar um número com separador de milhares
export const formatarNumero = (valor: string): string => {
  // Remover caracteres não numéricos, exceto o ponto decimal
  const numeroLimpo = valor.replace(/[^\d.]/g, '');
  
  // Se for vazio, retornar vazio
  if (!numeroLimpo) return '';
  
  // Separar a parte inteira da parte decimal
  const partes = numeroLimpo.split('.');
  const parteInteira = partes[0];
  const parteDecimal = partes.length > 1 ? '.' + partes[1] : '';
  
  // Adicionar separador de milhares na parte inteira
  const parteInteiraFormatada = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return parteInteiraFormatada + parteDecimal;
};

// Função para formatar telefone no padrão (00) 0 0000-0000
export const formatarTelefone = (telefone: string): string => {
  // Remove todos os caracteres não numéricos
  const numeroLimpo = telefone.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const numeroLimitado = numeroLimpo.slice(0, 11);
  
  // Aplica a formatação de acordo com o número de dígitos
  if (numeroLimitado.length <= 2) {
    return numeroLimitado;
  } else if (numeroLimitado.length <= 3) {
    return `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2)}`;
  } else if (numeroLimitado.length <= 7) {
    return `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2, 3)} ${numeroLimitado.slice(3)}`;
  } else {
    return `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2, 3)} ${numeroLimitado.slice(3, 7)}-${numeroLimitado.slice(7)}`;
  }
};

// Formatar CPF: 000.000.000-00
export const formatarCPF = (cpf: string | null | undefined): string => {
  if (!cpf) return '';
  
  // Remove tudo que não é número
  const numbers = cpf.replace(/\D/g, '');
  
  // Se não tem 11 dígitos, retorna como está
  if (numbers.length !== 11) return cpf;
  
  // Formata como CPF
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Formatar CNPJ: 00.000.000/0000-00
export const formatarCNPJ = (cnpj: string | null | undefined): string => {
  if (!cnpj) return '';
  
  // Remove tudo que não é número
  const numbers = cnpj.replace(/\D/g, '');
  
  // Se não tem 14 dígitos, retorna como está
  if (numbers.length !== 14) return cnpj;
  
  // Formata como CNPJ
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// Formatar CPF ou CNPJ automaticamente
export const formatarCpfCnpj = (documento: string | null | undefined): string => {
  if (!documento) return '';
  
  const numbers = documento.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    return formatarCPF(documento);
  } else if (numbers.length === 14) {
    return formatarCNPJ(documento);
  }
  
  return documento;
};

// Formatar telefone para exibição: (00)0 0000-0000 ou (00) 0000-0000
export const formatarTelefoneExibicao = (telefone: string | null | undefined): string => {
  if (!telefone) return '';
  
  // Remove tudo que não é número
  const numbers = telefone.replace(/\D/g, '');
  
  // Se tem 11 dígitos (celular): (00)0 0000-0000
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1)$2 $3-$4');
  }
  // Se tem 10 dígitos (fixo): (00) 0000-0000
  else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  // Se não tem formato esperado, retorna como está
  return telefone;
};

// Máscara para CPF/CNPJ com formatação em tempo real
export const aplicarMascaraCpfCnpj = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 14 dígitos (CNPJ)
  const limitedNumbers = numbers.slice(0, 14);
  
  // Se tem até 11 dígitos, formata como CPF
  if (limitedNumbers.length <= 11) {
    return limitedNumbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  // Se tem mais de 11 dígitos, formata como CNPJ
  else {
    return limitedNumbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
};

// Máscara para telefone com formatação em tempo real
export const aplicarMascaraTelefone = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Se tem 11 dígitos (celular): (00)0 0000-0000
  if (limitedNumbers.length === 11) {
    return limitedNumbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1)$2 $3-$4');
  }
  // Se tem 10 dígitos (fixo): (00) 0000-0000  
  else if (limitedNumbers.length === 10) {
    return limitedNumbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  // Formatação progressiva
  else if (limitedNumbers.length > 6) {
    return limitedNumbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  else if (limitedNumbers.length > 2) {
    return limitedNumbers.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  }
  else if (limitedNumbers.length > 0) {
    return limitedNumbers.replace(/(\d*)/, '($1');
  }
  
  return limitedNumbers;
};

// Função para formatar uma data no formato brasileiro
export const formatarDataBrasileira = (data: Date | null): string => {
  if (!data) return '';
  
  // Formatar no padrão DD/MM/YYYY
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth retorna 0-11
  const ano = data.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
};

// Função para converter uma string de data brasileira para objeto Date
export const converterDataBrasileira = (data: string): Date | null => {
  // Verificar se a data está no formato DD/MM/YYYY
  const match = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  
  const [, dia, mes, ano] = match;
  const novaData = new Date(Number(ano), Number(mes) - 1, Number(dia));
  
  // Verificar se a data é válida
  if (isNaN(novaData.getTime())) return null;
  
  return novaData;
};

// Função para converter um número formatado para o formato de cálculo
export const converterParaNumero = (valorFormatado: string): number => {
  // Remover pontos e substituir vírgula por ponto
  const numeroLimpo = valorFormatado.replace(/\./g, '').replace(',', '.');
  return parseFloat(numeroLimpo) || 0;
};

// Função para aplicar máscara de data DD/MM/YYYY
export const aplicarMascaraData = (valorDigitado: string): string => {
  let dataFormatada = valorDigitado
    .replace(/\D/g, ''); // Remove não-dígitos
  
  if (dataFormatada.length > 0) {
    dataFormatada = dataFormatada.substring(0, 8); // Limita a 8 dígitos
    // Formata como DD/MM/YYYY
    if (dataFormatada.length > 4) {
      dataFormatada = `${dataFormatada.substring(0, 2)}/${dataFormatada.substring(2, 4)}/${dataFormatada.substring(4)}`;
    } else if (dataFormatada.length > 2) {
      dataFormatada = `${dataFormatada.substring(0, 2)}/${dataFormatada.substring(2)}`;
    }
  }
  
  return dataFormatada;
};

// Função para formatar entrada de valores monetários
// Função para formatar entrada de valores monetários
export const formatarEntradaMonetaria = (valor: string): string => {
  // Remove todos os caracteres não numéricos
  const numeroLimpo = valor.replace(/\D/g, '');
  
  // Se for vazio, retornar vazio
  if (!numeroLimpo) return '';
  
  // Converter para número e dividir por 100 para obter centavos
  const numero = parseInt(numeroLimpo) / 100;
  
  // Formatar como moeda brasileira
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};