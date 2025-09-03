
import { supabase } from "@/lib/supabase";

// Interface para dados do cliente
export interface Cliente {
  id: string;
  nome: string;
  telefone: string | null;
  criado_em: string;
  user_id?: string;
  data_nascimento?: string | null;
  // Dados do evento
  evento?: string | null;
  data_evento?: string | null;
  valor_evento?: number | null;
}

// Interface para inserção de cliente
export interface ClienteFormData {
  nome: string;
  telefone?: string | null;
  data_nascimento?: string | null;
  evento?: string | null;
  data_evento?: string | null;
  valor_evento?: number | null;
}

// Função específica para buscar clientes duplicados (apenas campos necessários)
export const getClientesParaDuplicados = async (): Promise<{id: string, nome: string}[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('clientes')
      .select('id, nome')
      .eq('user_id', user.id)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar clientes para duplicados:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao processar busca de clientes para duplicados:', error);
    throw error;
  }
};

// Obter todos os clientes do usuário atual (versão básica)
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('clientes')
      .select(`
        id, 
        nome, 
        telefone, 
        data_nascimento, 
        valor_evento,
        evento,
        data_evento,
        criado_em, 
        user_id
      `)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }

    // Retornar dados processados corretamente
    return data?.map(cliente => ({
      id: cliente.id,
      nome: cliente.nome,
      telefone: cliente.telefone || null,
      data_nascimento: cliente.data_nascimento || null,
      evento: cliente.evento || null,
      data_evento: cliente.data_evento || null,
      valor_evento: cliente.valor_evento || null,
      criado_em: cliente.criado_em || '',
      user_id: cliente.user_id || user.id
    })) as Cliente[] || [];
  } catch (error) {
    console.error('Erro ao processar busca de clientes:', error);
    throw error;
  }
};

// Obter cliente por ID
export const getClienteById = async (id: string): Promise<Cliente | null> => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        id, 
        nome, 
        telefone, 
        data_nascimento, 
        valor_evento,
        evento,
        data_evento,
        criado_em, 
        user_id
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erro ao buscar cliente com ID ${id}:`, error);
      throw error;
    }

    // Processar dados
    const clienteProcessado = data ? {
      ...data,
      telefone: data.telefone || null,
      data_nascimento: data.data_nascimento || null,
      evento: data.evento || null,
      data_evento: data.data_evento || null,
      valor_evento: data.valor_evento || null
    } as Cliente : null;

    return clienteProcessado;
  } catch (error) {
    console.error(`Erro ao processar busca de cliente com ID ${id}:`, error);
    throw error;
  }
};

// Criar novo cliente
export const createCliente = async (cliente: ClienteFormData): Promise<Cliente> => {
  try {
    // Obter o usuário atual para adicionar o user_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    // Separar dados do cliente dos dados do evento
    const { evento, data_evento, ...dadosCliente } = cliente;
    
    // Adicionar o user_id ao cliente para RLS
    const clienteWithUserId = {
      ...dadosCliente,
      telefone: cliente.telefone || null,
      data_nascimento: cliente.data_nascimento || null,
      valor_evento: cliente.valor_evento || null,
      user_id: user.id
    };
    
    const { data: clienteCriado, error: clienteError } = await supabase
      .from('clientes')
      .insert([clienteWithUserId])
      .select()
      .single();

    if (clienteError) {
      console.error('Erro ao criar cliente:', clienteError);
      throw clienteError;
    }

    // Se foram fornecidos dados do evento, criar o evento
    if (evento && data_evento) {
      const eventoData = {
        titulo: `Evento - ${cliente.nome}`,
        tipo: evento,
        data_inicio: data_evento,
        data_fim: data_evento, // Assumindo evento de um dia
        cliente_id: clienteCriado.id,
        user_id: user.id
      };

      const { error: eventoError } = await supabase
        .from('agenda_eventos')
        .insert([eventoData]);

      if (eventoError) {
        console.error('Erro ao criar evento para cliente:', eventoError);
        // Não falhar a criação do cliente se o evento der erro, apenas avisar
        console.warn('Cliente criado mas evento não foi criado');
      }
    }

    // Retornar cliente com dados do evento incluídos
    return {
      ...clienteCriado,
      evento: evento || null,
      data_evento: data_evento || null,
      valor_evento: cliente.valor_evento || null
    } as Cliente;
  } catch (error) {
    console.error('Erro ao processar criação de cliente:', error);
    throw error;
  }
};

// Atualizar cliente existente
export const updateCliente = async (id: string, cliente: Partial<ClienteFormData>): Promise<Cliente> => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update({
        ...cliente,
        telefone: cliente.telefone || null,
        data_nascimento: cliente.data_nascimento || null,
        valor_evento: cliente.valor_evento || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
      throw error;
    }

    return data as Cliente;
  } catch (error) {
    console.error(`Erro ao processar atualização de cliente com ID ${id}:`, error);
    throw error;
  }
};

// Excluir cliente
export const deleteCliente = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erro ao excluir cliente com ID ${id}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Erro ao processar exclusão de cliente com ID ${id}:`, error);
    throw error;
  }
};

// Interface para dados de sincronização de cliente
export interface SyncClienteData {
  nome: string;
  telefone?: string | null;
  tipoEvento: string;
  valorServico: number;
  dataEvento: string;
  dataNascimento?: string | null;
  userId: string;
}

// Interface para exclusão sincronizada de cliente
export interface DeleteSyncClienteData {
  nome: string;
  dataEvento: string;
  userId: string;
}

// Remover a primeira função syncCliente duplicada (linhas 271-340)
// Manter apenas a versão avançada que suporta cliente_id

export const deleteSyncCliente = async (eventoData: DeleteSyncClienteData): Promise<void> => {
  try {
    console.log('[deleteSyncCliente] Iniciando exclusão para:', eventoData.nome);
    
    // Extrair apenas a data (sem hora) para comparação
    const dataEventoFormatada = eventoData.dataEvento.split('T')[0];
    
    // Buscar cliente existente por nome + user_id + data_evento
    const { data: existingCliente, error: searchError } = await supabase
      .from('clientes')
      .select('*')
      .eq('nome', eventoData.nome)
      .eq('user_id', eventoData.userId)
      .eq('data_evento', dataEventoFormatada)
      .maybeSingle();

    if (searchError) {
      console.error('[deleteSyncCliente] Erro ao buscar cliente existente:', searchError);
      throw searchError;
    }

    if (existingCliente) {
      // Cliente existe - excluir
      console.log('[deleteSyncCliente] Cliente encontrado, excluindo:', existingCliente.id);
      
      const { error: deleteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', existingCliente.id);

      if (deleteError) {
        console.error('[deleteSyncCliente] Erro ao excluir cliente:', deleteError);
        throw deleteError;
      }

      console.log('[deleteSyncCliente] Cliente excluído com sucesso');
    } else {
      console.log('[deleteSyncCliente] Cliente não encontrado para exclusão');
    }
  } catch (error) {
    console.error('[deleteSyncCliente] Erro na exclusão de cliente:', error);
    throw error;
  }
};

// Função para buscar cliente por nome e telefone
export const buscarClientePorNomeETelefone = async (
  nome: string, 
  telefone: string | null, 
  userId: string
): Promise<Cliente | null> => {
  try {
    console.log('[buscarClientePorNomeETelefone] Buscando cliente:', { nome, telefone });
    
    let query = supabase
      .from('clientes')
      .select('*')
      .eq('nome', nome)
      .eq('user_id', userId);
    
    // Aplicar filtro de telefone apropriado
    if (telefone === null || telefone === '') {
      query = query.is('telefone', null);
    } else {
      query = query.eq('telefone', telefone);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error('[buscarClientePorNomeETelefone] Erro na busca:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[buscarClientePorNomeETelefone] Erro:', error);
    throw error;
  }
};

// Modificar syncCliente para usar cliente_id quando disponível
export const syncCliente = async (
  eventoData: SyncClienteData, 
  clienteId?: string | null
): Promise<string | null> => {
  try {
    console.log('[syncCliente] Iniciando sincronização para:', eventoData.nome);
    
    let clienteExistente: Cliente | null = null;
    
    // ✅ PRIORIDADE 1: Se temos cliente_id, usar como chave primária
    if (clienteId) {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .eq('user_id', eventoData.userId)
        .maybeSingle();
        
      if (error) {
        console.error('[syncCliente] Erro ao buscar por cliente_id:', error);
      } else {
        clienteExistente = data;
        console.log('[syncCliente] Cliente encontrado por ID:', clienteId);
      }
    }
    
    // ✅ PRIORIDADE 2: Se não tem cliente_id, buscar por nome + telefone + data
    // Mas APENAS se não encontrou por ID
    if (!clienteExistente && !clienteId) {
      const dataEventoFormatada = eventoData.dataEvento.split('T')[0];
      const telefoneNormalizado = eventoData.telefone || null;
      
      let query = supabase
        .from('clientes')
        .select('*')
        .eq('nome', eventoData.nome)
        .eq('user_id', eventoData.userId)
        .eq('data_evento', dataEventoFormatada);
      
      if (telefoneNormalizado === null) {
        query = query.is('telefone', null);
      } else {
        query = query.eq('telefone', telefoneNormalizado);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error('[syncCliente] Erro ao buscar cliente existente:', error);
        throw error;
      }
      
      clienteExistente = data;
    }

    if (clienteExistente) {
      // ✅ Cliente existe - SEMPRE atualizar (mesmo que nome tenha mudado)
      console.log('[syncCliente] Atualizando cliente existente:', clienteExistente.id);
      
      const { error: updateError } = await supabase
        .from('clientes')
        .update({
          nome: eventoData.nome,
          telefone: eventoData.telefone || null,
          data_nascimento: eventoData.dataNascimento
          // Remover: evento, valor_evento (esses dados devem ficar na agenda_eventos)
        })
        .eq('id', clienteExistente.id);

      if (updateError) {
        console.error('[syncCliente] Erro ao atualizar cliente:', updateError);
        throw updateError;
      }

      console.log('[syncCliente] Cliente atualizado com sucesso');
      return clienteExistente.id;
    } else {
      // ✅ Cliente não existe - criar novo
      console.log('[syncCliente] Criando novo cliente');
      
      const dataEventoFormatada = eventoData.dataEvento.split('T')[0];
      
      // Na função syncCliente, linha ~440
      // ✅ CORRETO - usar user_id
      const { data: novoCliente, error: insertError } = await supabase
        .from('clientes')
        .insert({
          nome: eventoData.nome,
          telefone: eventoData.telefone || null,
          evento: eventoData.tipoEvento,
          valor_evento: eventoData.valorServico,
          data_evento: dataEventoFormatada,
          data_nascimento: eventoData.dataNascimento,
          user_id: eventoData.userId // ✅ Campo correto!
        })
        .select()
        .single();

      if (insertError) {
        console.error('[syncCliente] Erro ao criar cliente:', insertError);
        throw insertError;
      }

      console.log('[syncCliente] Novo cliente criado com sucesso:', novoCliente.id);
      return novoCliente.id;
    }
  } catch (error) {
    console.error('[syncCliente] Erro na sincronização de cliente:', error);
    throw error;
  }
};
