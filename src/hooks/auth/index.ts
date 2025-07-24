
// Este arquivo serve como índice para os hooks de autenticação

// Importação direta das funções exportadas
import { signIn } from './signIn';
import { signOut } from './signOut';
import { signUp } from './signUp';

// Exportar para manter a interface pública consistente
export {
  signIn,
  signOut,
  signUp
};
