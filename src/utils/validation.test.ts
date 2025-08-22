/**
 * Testes para funções de validação
 * 
 * Para execução manual dos testes:
 * 
 * // Nome de tabela válido
 * isValidTableName('usuarios') // Deve retornar true
 * 
 * // Nomes de tabela inválidos (com caracteres especiais ou potenciais injeções SQL)
 * isValidTableName('usuarios;DROP TABLE secrets;--') // Deve retornar false
 * isValidTableName('usuarios\' OR 1=1;--') // Deve retornar false
 * isValidTableName('usuarios"') // Deve retornar false
 * isValidTableName('usuarios.admin') // Deve retornar false
 * isValidTableName('usuarios WHERE admin=true;--') // Deve retornar false
 * 
 * // Sanitizar nome de tabela válido
 * sanitizeTableName('usuarios') // Deve retornar 'usuarios'
 * 
 * // Sanitizar nome de tabela inválido (deve lançar erro)
 * try {
 *   sanitizeTableName('usuarios;DROP TABLE secrets;--')
 * } catch (error) {
 *   console.log('Erro capturado:', error.message)
 * }
 */

import { isValidTableName, sanitizeTableName } from './validation';

// Casos de teste para isValidTableName
console.log('Teste isValidTableName (válido):', 
  isValidTableName('usuarios') === true ? 'PASSOU ✅' : 'FALHOU ❌');

console.log('Teste isValidTableName (injeção SQL 1):', 
  isValidTableName('usuarios;DROP TABLE secrets;--') === false ? 'PASSOU ✅' : 'FALHOU ❌');

console.log('Teste isValidTableName (injeção SQL 2):', 
  isValidTableName('usuarios\' OR 1=1;--') === false ? 'PASSOU ✅' : 'FALHOU ❌');

console.log('Teste isValidTableName (caracteres especiais):', 
  isValidTableName('usuarios"') === false ? 'PASSOU ✅' : 'FALHOU ❌');

// Casos de teste para sanitizeTableName
console.log('Teste sanitizeTableName (válido):', 
  sanitizeTableName('usuarios') === 'usuarios' ? 'PASSOU ✅' : 'FALHOU ❌');

// Teste para sanitizeTableName com entrada inválida (deve lançar exceção)
try {
  sanitizeTableName('usuarios;DROP TABLE secrets;--');
  console.log('Teste sanitizeTableName (injeção SQL) - deveria lançar erro: FALHOU ❌');
} catch (error) {
  console.log('Teste sanitizeTableName (injeção SQL) - capturou erro corretamente: PASSOU ✅');
} 