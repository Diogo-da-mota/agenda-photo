import { supabase } from '@/lib/supabase';

/**
 * Gera um ID único de 8 dígitos para contrato
 * Verifica unicidade no banco de dados
 * @returns Promise<string> ID único de contrato
 */
export async function generateUniqueContractId(): Promise<string> {
  const maxAttempts = 10;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    // Gerar ID de 8 dígitos
    const id = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
    
    try {
      // Verificar se o ID já existe no banco
      const { data, error } = await supabase
        .from('contratos')
        .select('id')
        .eq('id_contrato', id)
        .single();
      
      // Se não encontrou (erro ou data null), o ID está disponível
      if (error || !data) {
        return id;
      }
      
      attempts++;
    } catch (error) {
      console.warn(`Tentativa ${attempts + 1} falhou:`, error);
      attempts++;
    }
  }
  
  throw new Error(`Não foi possível gerar ID único após ${maxAttempts} tentativas`);
}

/**
 * Gera ID para cópia de contrato com formato padronizado
 * @param originalId ID do contrato original
 * @returns string ID da cópia
 */
export function generateCopyContractId(originalId: string): string {
  const timestamp = Date.now();
  return `${originalId}-copy-${timestamp}`;
}

/**
 * Valida formato do ID de contrato
 * @param id ID a ser validado
 * @returns boolean true se válido
 */
export function validateContractIdFormat(id: string): boolean {
  // ID deve ter 8 dígitos ou ser uma cópia (formato: xxxxxxxx-copy-timestamp)
  const standardFormat = /^\d{8}$/;
  const copyFormat = /^\d{8}-copy-\d+$/;
  
  return standardFormat.test(id) || copyFormat.test(id);
}

/**
 * Verifica se um ID de contrato já existe no banco
 * @param id ID a ser verificado
 * @returns Promise<boolean> true se existe
 */
export async function checkContractIdExists(id: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .select('id')
      .eq('id_contrato', id)
      .single();
    
    return !error && !!data;
  } catch {
    return false;
  }
}