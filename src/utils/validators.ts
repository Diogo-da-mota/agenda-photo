// Função para validar se uma data é válida
export const validarData = (data: Date | null): boolean => {
  return data !== null && !isNaN(data.getTime());
};

// Função para validar formato de data brasileira
export const validarFormatoDataBrasileira = (data: string): boolean => {
  return data.match(/^\d{2}\/\d{2}\/\d{4}$/) !== null;
};

// Função para validar telefone (deve ter pelo menos 10 dígitos)
export const validarTelefone = (telefone: string): boolean => {
  const numeroLimpo = telefone.replace(/\D/g, '');
  return numeroLimpo.length >= 10;
};

// Função para validar se um valor monetário é válido
export const validarValorMonetario = (valor: string): boolean => {
  const numeroLimpo = valor.replace(/[^\d.]/g, '');
  return !isNaN(parseFloat(numeroLimpo)) && parseFloat(numeroLimpo) >= 0;
}; 