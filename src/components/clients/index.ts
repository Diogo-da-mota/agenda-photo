
// Re-exportar componentes de cliente para compatibilidade com código existente
import ClienteDialog from '../clientes/ClienteDialog';
import ClienteList from '../clientes/ClienteList';

// Exportar com os nomes esperados pelo código existente
export { 
  ClienteDialog as ClientDialog,
  ClienteList as ClientList
};
