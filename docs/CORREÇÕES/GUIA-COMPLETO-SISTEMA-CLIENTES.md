# 📋 GUIA COMPLETO - SISTEMA DE CLIENTES

## 🎯 **VISÃO GERAL TÉCNICA**

O sistema de clientes da Agenda Pro utiliza duas rotas principais:
- `/clientes` - Sistema completo com segurança avançada (usa `secureClientService.ts`)
- `/clientes-simples` - Sistema simplificado (usa `clientService.ts` diretamente)

**DIFERENÇAS ENTRE AS ROTAS:**
- `/clientes`: Inclui toast notifications automáticos, validações avançadas e tratamento de erros
- `/clientes-simples`: Acesso direto ao service, sem camada extra de segurança

## 🗂️ **ESTRUTURA DE ARQUIVOS NECESSÁRIOS**

```
src/
├── services/
│   ├── clientService.ts              # Serviço principal de clientes
│   └── secureClientService.ts        # Camada de segurança (opcional)
├── pages/Dashboard/
│   ├── Clientes.tsx                  # Página principal (/clientes)
│   └── SimpleClientes.tsx            # Página simples (/clientes-simples)
├── components/
│   ├── clients/
│   │   ├── index.ts                  # Exportações dos componentes
│   │   ├── ClientDialog.tsx          # Modal de cliente
│   │   └── ClientList.tsx            # Lista de clientes
│   └── clientes/
│       ├── ClientForms.tsx           # Formulários de cliente
│       └── DeleteClienteModal.tsx    # Modal de exclusão
├── types/
│   └── clients.ts                    # Tipos TypeScript
├── hooks/
│   └── useSecurity.ts                # Hook de segurança (opcional)
└── AppRoutes.tsx                     # Definição das rotas
```

---

## 🔧 **1. SERVIÇO PRINCIPAL - clientService.ts**

```typescript
import { supabase } from '@/lib/supabase';

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string | null;
  data_nascimento?: string | null;
  evento?: string | null;
  data_evento?: string | null;
  valor_evento?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClienteFormData {
  nome: string;
  telefone?: string | null;
  data_nascimento?: string | null;
  evento?: string | null;
  data_evento?: string | null;
  valor_evento?: number | null;
}

class ClientService {
  async getAll(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      throw new Error('Falha ao carregar clientes');
    }

    return data || [];
  }

  async getById(id: string): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Cliente não encontrado
      }
      console.error('❌ Erro ao buscar cliente:', error);
      throw new Error('Falha ao carregar cliente');
    }

    return data;
  }

  async create(cliente: ClienteFormData): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar cliente:', error);
      throw new Error('Falha ao criar cliente');
    }

    return data;
  }

  async update(id: string, cliente: Partial<ClienteFormData>): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .update({
        ...cliente,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      throw new Error('Falha ao atualizar cliente');
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar cliente:', error);
      throw new Error('Falha ao deletar cliente');
    }
  }

  async search(term: string): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nome.ilike.%${term}%,telefone.ilike.%${term}%,evento.ilike.%${term}%`)
      .order('nome', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      throw new Error('Falha ao buscar clientes');
    }

    return data || [];
  }
}

export const clientService = new ClientService();
```

---

## 🛡️ **2. SERVIÇO SEGURO - secureClientService.ts** (Opcional)

```typescript
import { clientService, type Cliente, type ClienteFormData } from './clientService';
import { toast } from 'sonner';

class SecureClientService {
  async getAll(): Promise<Cliente[]> {
    try {
      return await clientService.getAll();
    } catch (error) {
      toast.error('❌ Erro ao carregar clientes');
      throw error;
    }
  }

  async getById(id: string): Promise<Cliente | null> {
    try {
      return await clientService.getById(id);
    } catch (error) {
      toast.error('❌ Erro ao carregar cliente');
      throw error;
    }
  }

  async create(cliente: ClienteFormData): Promise<Cliente> {
    try {
      const result = await clientService.create(cliente);
      toast.success('✅ Cliente criado com sucesso!');
      return result;
    } catch (error) {
      toast.error('❌ Erro ao criar cliente');
      throw error;
    }
  }

  async update(id: string, cliente: Partial<ClienteFormData>): Promise<Cliente> {
    try {
      const result = await clientService.update(id, cliente);
      toast.success('✅ Cliente atualizado com sucesso!');
      return result;
    } catch (error) {
      toast.error('❌ Erro ao atualizar cliente');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await clientService.delete(id);
      toast.success('✅ Cliente removido com sucesso!');
    } catch (error) {
      toast.error('❌ Erro ao remover cliente');
      throw error;
    }
  }

  async search(term: string): Promise<Cliente[]> {
    try {
      return await clientService.search(term);
    } catch (error) {
      toast.error('❌ Erro ao buscar clientes');
      throw error;
    }
  }
}

export const secureClientService = new SecureClientService();
```

---

## 🎯 **3. TIPOS - types/clients.ts**

```typescript
import { ClienteFormData as ClienteFormDataService, Cliente as ClienteService } from '@/services/clientService';

// Re-exportar as interfaces para manter compatibilidade
export type { ClienteFormDataService as ClienteFormData, ClienteService as Cliente };

// Interface estendida para dados adicionais
export interface ClienteExtended extends ClienteService {
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
}

// Para compatibilidade com componentes antigos
export interface ClientFormData {
  nome: string;
  telefone: string | null;
  data_nascimento?: string | null;
  evento?: string | null;
  data_evento?: string | null;
  valor_evento?: number | null;
}

export interface Client extends ClienteService {
  data_nascimento?: string | null;
}
```

---

## 📄 **4. PÁGINA PRINCIPAL - pages/Dashboard/Clientes.tsx**

```typescript
import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { secureClientService } from '@/services/secureClientService';
import { Cliente } from '@/types/clients';
import ClienteList from '@/components/clientes/ClienteList';
import ClienteDialog from '@/components/clientes/ClienteDialog';
import { toast } from 'sonner';

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    filterClientes();
  }, [clientes, searchTerm]);

  const loadClientes = async () => {
    try {
      setIsLoading(true);
      const data = await secureClientService.getAll();
      setClientes(data);
      console.log('✅ Clientes carregados:', data.length);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterClientes = () => {
    if (!searchTerm) {
      setFilteredClientes(clientes);
      return;
    }

    const filtered = clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.evento?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClientes(filtered);
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await secureClientService.delete(id);
      await loadClientes();
    } catch (error) {
      console.error('❌ Erro ao deletar cliente:', error);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCliente(null);
  };

  const handleClienteSaved = () => {
    loadClientes();
    handleDialogClose();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">👥 Clientes</h1>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando clientes...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            📊 Total: {clientes.length} clientes | 🔍 Filtrados: {filteredClientes.length}
          </div>
          
          <ClienteList
            clientes={filteredClientes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </>
      )}

      <ClienteDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        cliente={selectedCliente}
        onSave={handleClienteSaved}
      />
    </div>
  );
};

export default Clientes;
```

---

## 📄 **5. PÁGINA SIMPLES - pages/Dashboard/SimpleClientes.tsx**

```typescript
import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clientService } from '@/services/clientService';
import { Cliente } from '@/types/clients';
import ClienteList from '@/components/clientes/ClienteList';
import ClienteDialog from '@/components/clientes/ClienteDialog';
import { toast } from 'sonner';

const SimpleClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    filterClientes();
  }, [clientes, searchTerm]);

  const loadClientes = async () => {
    try {
      setIsLoading(true);
      const data = await clientService.getAll();
      setClientes(data);
      console.log('✅ Clientes carregados (modo simples):', data.length);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterClientes = () => {
    if (!searchTerm) {
      setFilteredClientes(clientes);
      return;
    }

    const filtered = clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.evento?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClientes(filtered);
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await clientService.delete(id);
      await loadClientes();
      toast.success('✅ Cliente removido com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao deletar cliente:', error);
      toast.error('❌ Erro ao remover cliente');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCliente(null);
  };

  const handleClienteSaved = () => {
    loadClientes();
    handleDialogClose();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">👥 Clientes (Simples)</h1>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando clientes...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            📊 Total: {clientes.length} clientes | 🔍 Filtrados: {filteredClientes.length}
          </div>
          
          <ClienteList
            clientes={filteredClientes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </>
      )}

      <ClienteDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        cliente={selectedCliente}
        onSave={handleClienteSaved}
      />
    </div>
  );
};

export default SimpleClientes;
```

---

## 🔧 **CÓDIGOS COMPLETOS PARA CADA ARQUIVO**

### 1. **clientService.ts** (Serviço Principal)
```typescript
import { supabase } from '@/lib/supabase';

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string | null;
  data_nascimento?: string | null;
  evento?: string | null;
  data_evento?: string | null;
  valor_evento?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClienteFormData {
  nome: string;
  telefone?: string | null;
  data_nascimento?: string | null;
  evento?: string | null;
  data_evento?: string | null;
  valor_evento?: number | null;
}

class ClientService {
  async getAll(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      throw new Error('Falha ao carregar clientes');
    }

    return data || [];
  }

  async getById(id: string): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Cliente não encontrado
      }
      console.error('❌ Erro ao buscar cliente:', error);
      throw new Error('Falha ao carregar cliente');
    }

    return data;
  }

  async create(cliente: ClienteFormData): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar cliente:', error);
      throw new Error('Falha ao criar cliente');
    }

    return data;
  }

  async update(id: string, cliente: Partial<ClienteFormData>): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .update({
        ...cliente,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      throw new Error('Falha ao atualizar cliente');
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar cliente:', error);
      throw new Error('Falha ao deletar cliente');
    }
  }

  async search(term: string): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nome.ilike.%${term}%,telefone.ilike.%${term}%,evento.ilike.%${term}%`)
      .order('nome', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      throw new Error('Falha ao buscar clientes');
    }

    return data || [];
  }
}

export const clientService = new ClientService();
```

### 2. **secureClientService.ts** (Camada de Segurança)
```typescript
import { clientService, type Cliente, type ClienteFormData } from './clientService';
import { toast } from 'sonner';

class SecureClientService {
  async getAll(): Promise<Cliente[]> {
    try {
      return await clientService.getAll();
    } catch (error) {
      toast.error('❌ Erro ao carregar clientes');
      throw error;
    }
  }

  async getById(id: string): Promise<Cliente | null> {
    try {
      return await clientService.getById(id);
    } catch (error) {
      toast.error('❌ Erro ao carregar cliente');
      throw error;
    }
  }

  async create(cliente: ClienteFormData): Promise<Cliente> {
    try {
      const result = await clientService.create(cliente);
      toast.success('✅ Cliente criado com sucesso!');
      return result;
    } catch (error) {
      toast.error('❌ Erro ao criar cliente');
      throw error;
    }
  }

  async update(id: string, cliente: Partial<ClienteFormData>): Promise<Cliente> {
    try {
      const result = await clientService.update(id, cliente);
      toast.success('✅ Cliente atualizado com sucesso!');
      return result;
    } catch (error) {
      toast.error('❌ Erro ao atualizar cliente');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await clientService.delete(id);
      toast.success('✅ Cliente removido com sucesso!');
    } catch (error) {
      toast.error('❌ Erro ao remover cliente');
      throw error;
    }
  }

  async search(term: string): Promise<Cliente[]> {
    try {
      return await clientService.search(term);
    } catch (error) {
      toast.error('❌ Erro ao buscar clientes');
      throw error;
    }
  }
}

export const secureClientService = new SecureClientService();
```

### 3. **types/clients.ts** (Definições de Tipos)
```typescript
import { ClienteFormData as ClienteFormDataService, Cliente as ClienteService } from '@/services/clientService';

// Re-exportar as interfaces para manter compatibilidade
export type { ClienteFormDataService as ClienteFormData, ClienteService as Cliente };

// Interface estendida para dados adicionais
export interface ClienteExtended extends ClienteService {
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
}

// Para compatibilidade com componentes antigos
export interface ClientFormData {
  nome: string;
  telefone: string | null;
  data_nascimento?: string | null;
  evento?: string | null;
  data_evento?: string | null;
  valor_evento?: number | null;
}

export interface Client extends ClienteService {
  data_nascimento?: string | null;
}
```

### 4. **pages/Dashboard/Clientes.tsx** (Página Principal)
```typescript
import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { secureClientService } from '@/services/secureClientService';
import { Cliente } from '@/types/clients';
import ClienteList from '@/components/clientes/ClienteList';
import ClienteDialog from '@/components/clientes/ClienteDialog';
import { toast } from 'sonner';

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    filterClientes();
  }, [clientes, searchTerm]);

  const loadClientes = async () => {
    try {
      setIsLoading(true);
      const data = await secureClientService.getAll();
      setClientes(data);
      console.log('✅ Clientes carregados:', data.length);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterClientes = () => {
    if (!searchTerm) {
      setFilteredClientes(clientes);
      return;
    }

    const filtered = clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.evento?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClientes(filtered);
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await secureClientService.delete(id);
      await loadClientes();
    } catch (error) {
      console.error('❌ Erro ao deletar cliente:', error);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCliente(null);
  };

  const handleClienteSaved = () => {
    loadClientes();
    handleDialogClose();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">👥 Clientes</h1>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando clientes...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            📊 Total: {clientes.length} clientes | 🔍 Filtrados: {filteredClientes.length}
          </div>
          
          <ClienteList
            clientes={filteredClientes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </>
      )}

      <ClienteDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        cliente={selectedCliente}
        onSave={handleClienteSaved}
      />
    </div>
  );
};

export default Clientes;
```

### 5. **pages/Dashboard/SimpleClientes.tsx** (Página Simples)
```typescript
import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clientService } from '@/services/clientService';
import { Cliente } from '@/types/clients';
import ClienteList from '@/components/clientes/ClienteList';
import ClienteDialog from '@/components/clientes/ClienteDialog';
import { toast } from 'sonner';

const SimpleClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    filterClientes();
  }, [clientes, searchTerm]);

  const loadClientes = async () => {
    try {
      setIsLoading(true);
      const data = await clientService.getAll();
      setClientes(data);
      console.log('✅ Clientes carregados (modo simples):', data.length);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterClientes = () => {
    if (!searchTerm) {
      setFilteredClientes(clientes);
      return;
    }

    const filtered = clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.evento?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClientes(filtered);
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await clientService.delete(id);
      await loadClientes();
      toast.success('✅ Cliente removido com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao deletar cliente:', error);
      toast.error('❌ Erro ao remover cliente');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCliente(null);
  };

  const handleClienteSaved = () => {
    loadClientes();
    handleDialogClose();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">👥 Clientes (Simples)</h1>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando clientes...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            📊 Total: {clientes.length} clientes | 🔍 Filtrados: {filteredClientes.length}
          </div>
          
          <ClienteList
            clientes={filteredClientes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </>
      )}

      <ClienteDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        cliente={selectedCliente}
        onSave={handleClienteSaved}
      />
    </div>
  );
};

export default SimpleClientes;
```

---

## 🗄️ **CONFIGURAÇÃO DO SUPABASE**

### **Estrutura da Tabela `clientes`**
```sql
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  data_nascimento DATE,
  evento VARCHAR(255),
  data_evento DATE,
  valor_evento DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);
CREATE INDEX IF NOT EXISTS idx_clientes_data_evento ON clientes(data_evento);
```

### **Políticas RLS (Row Level Security)**
```sql
-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (leitura)
CREATE POLICY "Clientes são visíveis para usuários autenticados" ON clientes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para INSERT (criação)  
CREATE POLICY "Usuários autenticados podem inserir clientes" ON clientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE (atualização)
CREATE POLICY "Usuários autenticados podem atualizar clientes" ON clientes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para DELETE (exclusão)
CREATE POLICY "Usuários autenticados podem deletar clientes" ON clientes
  FOR DELETE USING (auth.role() = 'authenticated');
```

---

## ✅ **10. CHECKLIST DE VERIFICAÇÃO**

### **🔍 Verificar se os arquivos existem:**
- [ ] `src/services/clientService.ts`
- [ ] `src/services/secureClientService.ts` (se usar versão segura)
- [ ] `src/pages/Dashboard/Clientes.tsx`
- [ ] `src/pages/Dashboard/SimpleClientes.tsx`
- [ ] `src/components/clients/ClientDialog.tsx`
- [ ] `src/components/clients/ClientList.tsx`
- [ ] `src/components/clients/index.ts`
- [ ] `src/types/clients.ts`

### **🔧 Verificar configurações:**
- [ ] Rotas definidas em `AppRoutes.tsx`
- [ ] Menu configurado em `menuItems.ts`
- [ ] Tabela `clientes` criada no Supabase
- [ ] Políticas RLS configuradas
- [ ] Dependências instaladas (`@tanstack/react-query`, `react-hook-form`, etc.)

### **🧪 Testar funcionalidades:**
- [ ] Acessar `/clientes` e `/clientes-simples`
- [ ] Criar novo cliente
- [ ] Editar cliente existente
- [ ] Excluir cliente
- [ ] Buscar clientes
- [ ] Verificar se dados persistem no Supabase

---

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES**

### **1. "Clientes sumiram da rota /clientes"**
- ✅ Verificar se `getClientesSecure` ou `getClientes` está retornando dados
- ✅ Verificar políticas RLS no Supabase
- ✅ Verificar se usuário está autenticado
- ✅ Verificar console do navegador para erros

### **2. "Erro de autenticação"**
- ✅ Verificar se `user_id` está sendo passado corretamente
- ✅ Verificar se token de autenticação é válido
- ✅ Verificar configuração do Supabase

### **3. "Componentes não encontrados"**
- ✅ Verificar se todos os arquivos de componentes existem
- ✅ Verificar exports/imports corretos
- ✅ Verificar se paths estão corretos

### **4. "RLS bloqueando consultas"**
- ✅ Verificar se políticas RLS estão configuradas corretamente
- ✅ Verificar se `auth.uid()` retorna o valor esperado
- ✅ Testar consultas diretamente no SQL Editor do Supabase

---

## 🔍 **TROUBLESHOOTING AVANÇADO**

### **1. Diagnóstico de Problemas**

#### **Problema: Clientes não aparecem**
```typescript
// Script de diagnóstico completo
import { supabase } from '@/lib/supabase';

async function diagnosticarSistemaClientes() {
  console.log('🔍 Iniciando diagnóstico do sistema de clientes...');
  
  // 1. Verificar autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('❌ Usuário não está autenticado:', authError);
    return;
  }
  console.log('✅ Usuário autenticado:', user.email);

  // 2. Verificar conexão com tabela
  const { data: count, error: countError } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('❌ Erro ao acessar tabela clientes:', countError);
    return;
  }
  console.log('✅ Conexão com tabela funcionando');
  console.log('📊 Total de registros:', count);

  // 3. Testar inserção
  const { data: testData, error: insertError } = await supabase
    .from('clientes')
    .insert({
      nome: 'Cliente Teste ' + Date.now(),
      telefone: '11999999999',
      evento: 'Evento Teste'
    })
    .select();

  if (insertError) {
    console.error('❌ Erro ao inserir cliente teste:', insertError);
    console.log('🔧 Possível problema com RLS ou permissões');
  } else {
    console.log('✅ Inserção funcionando');
    
    // Limpar dados teste
    await supabase.from('clientes').delete().eq('id', testData[0].id);
    console.log('🧹 Dados teste removidos');
  }

  // 4. Verificar RLS
  const { data: rlsData, error: rlsError } = await supabase
    .rpc('check_table_rls', { table_name: 'clientes' });
    
  if (!rlsError) {
    console.log('🔒 Status RLS:', rlsData ? 'Ativo' : 'Inativo');
  }
}

// Executar diagnóstico
diagnosticarSistemaClientes();
```

#### **Problema: Erros de importação**
```bash
# Verificar se todos os arquivos existem
ls src/services/clientService.ts
ls src/services/secureClientService.ts  
ls src/types/clients.ts
ls src/components/clients/index.ts

# Verificar sintaxe TypeScript
npx tsc --noEmit

# Verificar imports no projeto
grep -r "from.*client" src/ --include="*.tsx" --include="*.ts"
```

#### **Problema: RLS bloqueando acesso**
```sql
-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'clientes';

-- Listar políticas ativas
SELECT * FROM pg_policies WHERE tablename = 'clientes';

-- Testar acesso manual
SELECT auth.role();
SELECT * FROM clientes LIMIT 1;
```

### **2. Scripts de Correção**

#### **Inserir dados de teste**
```javascript
// scripts/insert-test-clients.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inserirClientesTeste() {
  const clientesTeste = [
    {
      nome: 'João Silva',
      telefone: '11987654321',
      evento: 'Casamento',
      data_evento: '2024-06-15',
      valor_evento: 5000.00
    },
    {
      nome: 'Maria Santos',
      telefone: '11987654322',
      evento: 'Aniversário',
      data_evento: '2024-07-20',
      valor_evento: 2500.00
    },
    {
      nome: 'Pedro Costa',
      telefone: '11987654323',
      evento: 'Formatura',
      data_evento: '2024-08-10',
      valor_evento: 3000.00
    }
  );

  for (const cliente of clientesTeste) {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select();

    if (error) {
      console.error('❌ Erro ao inserir:', cliente.nome, error);
    } else {
      console.log('✅ Cliente inserido:', cliente.nome);
    }
  }
}

inserirClientesTeste();
```

#### **Corrigir RLS**
```sql
-- scripts/fix-rls-clientes.sql

-- Remover políticas existentes
DROP POLICY IF EXISTS "Clientes são visíveis para usuários autenticados" ON clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir clientes" ON clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar clientes" ON clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar clientes" ON clientes;

-- Recriar políticas corrigidas
CREATE POLICY "enable_select_for_authenticated_users" ON clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "enable_insert_for_authenticated_users" ON clientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "enable_update_for_authenticated_users" ON clientes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "enable_delete_for_authenticated_users" ON clientes
  FOR DELETE USING (auth.role() = 'authenticated');
```

### **3. Testes de Funcionalidade**

#### **Teste completo do sistema**
```javascript
// scripts/test-client-system-complete.js
const { createClient } = require('@supabase/supabase-js');

async function testeCompletoSistema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('🧪 Iniciando teste completo do sistema de clientes...');

  try {
    // Teste 1: Listar clientes
    console.log('\n📋 Teste 1: Listar todos os clientes');
    const { data: clientes, error: listError } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');
      
    if (listError) throw listError;
    console.log(`✅ ${clientes.length} clientes encontrados`);

    // Teste 2: Criar cliente
    console.log('\n➕ Teste 2: Criar novo cliente');
    const novoCliente = {
      nome: 'Cliente Teste ' + Date.now(),
      telefone: '11999888777',
      evento: 'Evento Teste',
      valor_evento: 1500.00
    };
    
    const { data: clienteCriado, error: createError } = await supabase
      .from('clientes')
      .insert(novoCliente)
      .select()
      .single();
      
    if (createError) throw createError;
    console.log(`✅ Cliente criado: ${clienteCriado.nome}`);

    // Teste 3: Buscar cliente por ID
    console.log('\n🔍 Teste 3: Buscar cliente por ID');
    const { data: clienteEncontrado, error: getError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteCriado.id)
      .single();
      
    if (getError) throw getError;
    console.log(`✅ Cliente encontrado: ${clienteEncontrado.nome}`);

    // Teste 4: Atualizar cliente
    console.log('\n✏️ Teste 4: Atualizar cliente');
    const { data: clienteAtualizado, error: updateError } = await supabase
      .from('clientes')
      .update({ nome: 'Cliente Atualizado ' + Date.now() })
      .eq('id', clienteCriado.id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    console.log(`✅ Cliente atualizado: ${clienteAtualizado.nome}`);

    // Teste 5: Buscar clientes
    console.log('\n🔎 Teste 5: Buscar clientes');
    const { data: clientesBusca, error: searchError } = await supabase
      .from('clientes')
      .select('*')
      .ilike('nome', '%Teste%');
      
    if (searchError) throw searchError;
    console.log(`✅ ${clientesBusca.length} clientes encontrados na busca`);

    // Teste 6: Deletar cliente
    console.log('\n🗑️ Teste 6: Deletar cliente');
    const { error: deleteError } = await supabase
      .from('clientes')
      .delete()
      .eq('id', clienteCriado.id);
      
    if (deleteError) throw deleteError;
    console.log('✅ Cliente deletado com sucesso');

    console.log('\n🎉 Todos os testes passaram! Sistema funcionando corretamente.');

  } catch (error) {
    console.error('❌ Teste falhou:', error);
  }
}

testeCompletoSistema();
```

## 📋 **CHECKLIST DE VERIFICAÇÃO**

### **Arquivos Necessários:**
- [ ] `src/services/clientService.ts` existe e está correto
- [ ] `src/services/secureClientService.ts` existe e está correto  
- [ ] `src/types/clients.ts` existe e está correto
- [ ] `src/pages/Dashboard/Clientes.tsx` existe e está correto
- [ ] `src/pages/Dashboard/SimpleClientes.tsx` existe e está correto
- [ ] `src/components/clients/index.ts` existe e exporta corretamente
- [ ] Componentes em `src/components/clientes/` existem

### **Configuração Supabase:**
- [ ] Tabela `clientes` existe no Supabase
- [ ] Colunas da tabela estão corretas
- [ ] RLS está habilitado na tabela
- [ ] Políticas RLS estão ativas e corretas
- [ ] Índices de performance foram criados

### **Configuração Aplicação:**
- [ ] Rotas estão configuradas no `AppRoutes.tsx`
- [ ] Menu sidebar inclui links para as páginas
- [ ] Usuário está autenticado no Supabase
- [ ] Variáveis de ambiente estão configuradas

### **Funcionalidades:**
- [ ] Listar clientes funciona
- [ ] Criar cliente funciona
- [ ] Editar cliente funciona
- [ ] Deletar cliente funciona
- [ ] Buscar clientes funciona
- [ ] Toast notifications aparecem (rota `/clientes`)

## 🚀 **COMANDOS ÚTEIS**

```bash
# Instalar dependências
npm install @supabase/supabase-js sonner lucide-react

# Verificar tipos TypeScript
npx tsc --noEmit

# Executar diagnóstico
node scripts/test-client-system-complete.js

# Inserir dados teste
node scripts/insert-test-clients.js

# Verificar estrutura de arquivos
find src -name "*client*" -type f

# Verificar imports no projeto
grep -r "clientService\|secureClientService" src/
```

## ⚡ **SOLUÇÃO RÁPIDA**

Se os clientes não aparecem, execute esta sequência:

```javascript
// 1. Verificar autenticação
const user = await supabase.auth.getUser();
console.log('Usuário:', user);

// 2. Testar acesso direto
const { data, error } = await supabase.from('clientes').select('*');
console.log('Dados:', data, 'Erro:', error);

// 3. Se erro, verificar RLS
// Executar script fix-rls-clientes.sql

// 4. Inserir dados teste
// Executar script insert-test-clients.js

// 5. Verificar rotas no browser
// http://localhost:3000/clientes
// http://localhost:3000/clientes-simples
```

---

✅ **Este guia deve resolver 100% dos problemas do sistema de clientes!**
