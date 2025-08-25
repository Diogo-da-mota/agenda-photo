import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, PencilIcon, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Transacao } from '@/services/financeiroService';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';
import { buscarCategorias, criarCategoria, editarCategoria, excluirCategoria } from '@/services/categoriaService';
import { buscarFormasPagamento, criarFormaPagamento, editarFormaPagamento, excluirFormaPagamento } from '@/services/formaPagamentoService';
import { useToast } from '@/hooks/use-toast';
import { formatarEntradaMonetaria } from '@/utils/formatters';

// Categorias padrão de transações
const categoriasPadrao = {
  receita: ["Sessão Fotográfica", "Ensaio", "Evento", "Venda de Produtos", "Outro"],
  despesa: ["Equipamento", "Software", "Marketing", "Transporte", "Alimentação", "Locação", "Impostos", "Outro"]
};

// Métodos de pagamento padrão
const metodosPagamentoPadrao = [
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "PIX",
  "Transferência Bancária",
  "Boleto",
  "Outro"
];

// Interface de props do formulário
interface TransactionFormProps {
  transaction?: Partial<Transacao>;
  onSubmit: (transaction: Omit<Transacao, 'id' | 'criado_em' | 'atualizado_em'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const formatarNumero = (valor: string): string => {
  return formatarEntradaMonetaria(valor);
};

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [descricao, setDescricao] = useState(transaction?.descricao || '');
  const [valorString, setValorString] = useState(transaction?.valor ? String(transaction.valor) : '');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>(transaction?.tipo || 'despesa');
  const [dataTransacao, setDataTransacao] = useState<Date>(
    transaction?.data_transacao ? new Date(transaction.data_transacao) : new Date()
  );
  const [dataEvento, setDataEvento] = useState<Date | null>(
    transaction?.data_evento ? new Date(transaction.data_evento) : null
  );
  const [categoria, setCategoria] = useState(transaction?.categoria || '');
  const [formaPagamento, setFormaPagamento] = useState(transaction?.forma_pagamento || '');
  const [observacoes, setObservacoes] = useState(transaction?.observacoes || '');
  const [clienteName, setClienteName] = useState(transaction?.clienteName || '');
  
  // Estados para gerenciamento de categorias
  const [categorias, setCategorias] = useState<{id: string, nome: string}[]>([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [categoriaEditando, setCategoriaEditando] = useState<{id: string, nome: string} | null>(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const [mostrarAdicionarCategoria, setMostrarAdicionarCategoria] = useState(false);
  
  // Estados para gerenciamento de formas de pagamento
  const [formasPagamento, setFormasPagamento] = useState<{id: string, nome: string}[]>([]);
  const [novaFormaPagamento, setNovaFormaPagamento] = useState('');
  const [formaPagamentoEditando, setFormaPagamentoEditando] = useState<{id: string, nome: string} | null>(null);
  const [nomeFormaPagamentoEditado, setNomeFormaPagamentoEditado] = useState('');
  const [mostrarAdicionarFormaPagamento, setMostrarAdicionarFormaPagamento] = useState(false);
  
  // Carregar categorias do usuário
  const carregarCategorias = async () => {
    if (!user) return;
    
    try {
      const categoriasUsuario = await buscarCategorias(user.id, tipo);
      
      // Se não houver categorias personalizadas, criar categorias padrão
      if (categoriasUsuario.length === 0) {
        const promises = categoriasPadrao[tipo].map(nome => 
          criarCategoria(nome, tipo, user.id)
        );
        
        try {
          await Promise.all(promises);
          const novasCategorias = await buscarCategorias(user.id, tipo);
          setCategorias(novasCategorias.map(cat => ({ id: cat.id, nome: cat.nome })));
        } catch (error) {
          console.error('Erro ao criar categorias padrão:', error);
        }
      } else {
        setCategorias(categoriasUsuario.map(cat => ({ id: cat.id, nome: cat.nome })));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };
  
  // Carregar formas de pagamento do usuário
  const carregarFormasPagamento = async () => {
    if (!user) return;
    
    try {
      const formasPagamentoUsuario = await buscarFormasPagamento(user.id);
  
      // Se não houver formas de pagamento personalizadas, criar formas de pagamento padrão
      if (formasPagamentoUsuario.length === 0) {
        const promises = metodosPagamentoPadrao.map(nome => 
          criarFormaPagamento(nome, user.id)
        );
        
        try {
          await Promise.all(promises);
          const novasFormasPagamento = await buscarFormasPagamento(user.id);
          setFormasPagamento(novasFormasPagamento.map(fp => ({ id: fp.id, nome: fp.nome })));
        } catch (error) {
          console.error('Erro ao criar formas de pagamento padrão:', error);
        }
      } else {
        setFormasPagamento(formasPagamentoUsuario.map(fp => ({ id: fp.id, nome: fp.nome })));
      }
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    }
  };
  
  // Carregar dados quando o componente montar
  useEffect(() => {
    carregarCategorias();
    carregarFormasPagamento();
  }, [tipo, user]);
  
  // Adicionar nova categoria
  const handleAdicionarCategoria = async () => {
    if (!user || !novaCategoria.trim()) return;
    
    try {
      await criarCategoria(novaCategoria, tipo, user.id);
      await carregarCategorias();
      setNovaCategoria('');
      setMostrarAdicionarCategoria(false);
      
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível adicionar a categoria.',
        variant: 'destructive'
      });
    }
  };
  
  // Adicionar nova forma de pagamento
  const handleAdicionarFormaPagamento = async () => {
    if (!user || !novaFormaPagamento.trim()) return;
    
    try {
      await criarFormaPagamento(novaFormaPagamento, user.id);
      await carregarFormasPagamento();
      setNovaFormaPagamento('');
      setMostrarAdicionarFormaPagamento(false);
      
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível adicionar a forma de pagamento.',
        variant: 'destructive'
      });
    }
  };
  
  // Atualizar categoria
  const handleAtualizarCategoria = async () => {
    if (!user || !categoriaEditando || !nomeEditado.trim()) return;
    
    try {
      await editarCategoria(categoriaEditando.id, nomeEditado, user.id);
      await carregarCategorias();
      
      // Se a categoria sendo editada é a selecionada, atualizar a seleção
      if (categoria === categoriaEditando.nome) {
        setCategoria(nomeEditado);
      }
      
      setCategoriaEditando(null);
      setNomeEditado('');
      
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a categoria.',
        variant: 'destructive'
      });
    }
  };
  
  // Atualizar forma de pagamento
  const handleAtualizarFormaPagamento = async () => {
    if (!user || !formaPagamentoEditando || !nomeFormaPagamentoEditado.trim()) return;
    
    try {
      await editarFormaPagamento(formaPagamentoEditando.id, nomeFormaPagamentoEditado, user.id);
      await carregarFormasPagamento();
      
      // Se a forma de pagamento sendo editada é a selecionada, atualizar a seleção
      if (formaPagamento === formaPagamentoEditando.nome) {
        setFormaPagamento(nomeFormaPagamentoEditado);
      }
      
      setFormaPagamentoEditando(null);
      setNomeFormaPagamentoEditado('');
      
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a forma de pagamento.',
        variant: 'destructive'
      });
    }
  };
  
  // Excluir categoria
  const handleExcluirCategoria = async (id: string, nome: string) => {
    if (!user) return;
    
    try {
      await excluirCategoria(id, user.id);
      await carregarCategorias();
      
      // Se a categoria excluída é a selecionada, limpar a seleção
      if (categoria === nome) {
      setCategoria('');
    }

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir a categoria.',
        variant: 'destructive'
      });
    }
  };
  
  // Excluir forma de pagamento
  const handleExcluirFormaPagamento = async (id: string, nome: string) => {
    if (!user) return;
    
    try {
      await excluirFormaPagamento(id, user.id);
      await carregarFormasPagamento();
      
      // Se a forma de pagamento excluída é a selecionada, limpar a seleção
      if (formaPagamento === nome) {
        setFormaPagamento('');
      }

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir a forma de pagamento.',
        variant: 'destructive'
      });
    }
  };
  
  // Formatar o valor como moeda
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = formatarNumero(e.target.value);
    setValorString(valor);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      logger.security('Tentativa de submissão de transação sem autenticação', null, 'TransactionForm');
      return;
    }

    if (!descricao.trim() || !valorString.trim()) {
      logger.warn('Tentativa de submissão com campos obrigatórios vazios', null, 'TransactionForm');
      return;
    }

    if (isNaN(parseFloat(valorString)) || parseFloat(valorString) <= 0) {
      logger.warn('Tentativa de submissão com valor inválido', { valor: valorString }, 'TransactionForm');
      return;
    }

    const valorNumerico = parseFloat(valorString);

    // Preparar objeto de transação
    const novaTransacao: Omit<Transacao, 'id' | 'criado_em' | 'atualizado_em'> = {
      descricao,
      valor: valorNumerico,
      tipo,
      status: 'recebido', // Valor fixo agora
      data_transacao: dataTransacao.toISOString(),
      data_evento: dataEvento ? dataEvento.toISOString() : null,
      categoria,
      forma_pagamento: formaPagamento,
      observacoes,
      clienteName,
      user_id: user.id,
      cliente_id: null // Este campo poderia ser preenchido se houver integração com clientes
    };
    
    onSubmit(novaTransacao);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de Transação (Receita/Despesa) - Oculto quando o tipo já é definido como despesa */}
      <div className="space-y-2" style={{ display: 'none' }}>
        <Label>Tipo de Transação</Label>
        <RadioGroup 
          value={tipo}
          onValueChange={(value) => setTipo(value as 'receita' | 'despesa')}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="receita" id="receita" />
            <Label htmlFor="receita" className="text-green-600 font-medium">Receita</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="despesa" id="despesa" />
            <Label htmlFor="despesa" className="text-red-600 font-medium">Despesa</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição *</Label>
        <Input 
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex.: Pagamento - Ensaio Fotográfico"
          required
        />
      </div>
      
      {/* Nome do Cliente (apenas para receitas) */}
      {tipo === 'receita' && (
        <div className="space-y-2">
          <Label htmlFor="clienteName">Nome do Cliente</Label>
          <Input 
            id="clienteName"
            value={clienteName}
            onChange={(e) => setClienteName(e.target.value)}
            placeholder="Ex.: Maria Silva"
          />
        </div>
      )}
      
      {/* Valor */}
      <div className="space-y-2">
        <Label htmlFor="valor">Valor (R$) *</Label>
        <Input 
          id="valor"
          value={valorString}
          onChange={handleValorChange}
          placeholder="0.00"
          inputMode="decimal"
          required
        />
      </div>
      
      {/* Data da Transação */}
      <div className="space-y-2">
        <Label>Data da Transação *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dataTransacao && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dataTransacao ? format(dataTransacao, "PPP", { locale: ptBR }) : "Selecione uma data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dataTransacao}
              onSelect={(date) => date && setDataTransacao(date)}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Data do Evento (opcional, apenas para receitas) */}
      {tipo === 'receita' && (
        <div className="space-y-2">
          <Label>Data do Evento (opcional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataEvento && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataEvento ? format(dataEvento, "PPP", { locale: ptBR }) : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataEvento}
                onSelect={setDataEvento}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      {/* Categoria com gerenciamento inline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
        <Label htmlFor="categoria">Categoria</Label>
        </div>
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger id="categoria">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {mostrarAdicionarCategoria ? (
              <div className="p-2">
                <Input
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  placeholder="Nome da nova categoria"
                  className="mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setMostrarAdicionarCategoria(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleAdicionarCategoria}
                    disabled={!novaCategoria.trim()}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            ) : categoriaEditando ? (
              <div className="p-2">
                <Input
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  placeholder="Novo nome da categoria"
                  className="mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCategoriaEditando(null)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleAtualizarCategoria}
                    disabled={!nomeEditado.trim()}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <SelectGroup>
                  <SelectLabel>Categorias</SelectLabel>
                  {categorias.length === 0 ? (
                    <div className="px-2 py-2 text-center text-sm text-gray-500">
                      Nenhuma categoria disponível
                    </div>
                  ) : (
                    categorias.map((cat) => (
                      <div key={cat.id} className="flex items-center px-2">
                        <SelectItem value={cat.nome} className="flex-1">
                          {cat.nome}
              </SelectItem>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCategoriaEditando(cat);
                              setNomeEditado(cat.nome);
                            }}
                          >
                            <PencilIcon className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-red-500" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (confirm(`Deseja excluir a categoria "${cat.nome}"?`)) {
                                handleExcluirCategoria(cat.id, cat.nome);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </SelectGroup>
                <div className="border-t p-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.preventDefault();
                      setMostrarAdicionarCategoria(true);
                    }}
                    className="w-full"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    Nova Categoria
                  </Button>
                </div>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* Forma de Pagamento com gerenciamento inline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
        <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
        </div>
        <Select value={formaPagamento} onValueChange={setFormaPagamento}>
          <SelectTrigger id="formaPagamento">
            <SelectValue placeholder="Selecione uma forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            {mostrarAdicionarFormaPagamento ? (
              <div className="p-2">
                <Input
                  value={novaFormaPagamento}
                  onChange={(e) => setNovaFormaPagamento(e.target.value)}
                  placeholder="Nome da nova forma de pagamento"
                  className="mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setMostrarAdicionarFormaPagamento(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleAdicionarFormaPagamento}
                    disabled={!novaFormaPagamento.trim()}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            ) : formaPagamentoEditando ? (
              <div className="p-2">
                <Input
                  value={nomeFormaPagamentoEditado}
                  onChange={(e) => setNomeFormaPagamentoEditado(e.target.value)}
                  placeholder="Novo nome da forma de pagamento"
                  className="mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFormaPagamentoEditando(null)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleAtualizarFormaPagamento}
                    disabled={!nomeFormaPagamentoEditado.trim()}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <SelectGroup>
                  <SelectLabel>Formas de Pagamento</SelectLabel>
                  {formasPagamento.length === 0 ? (
                    <div className="px-2 py-2 text-center text-sm text-gray-500">
                      Nenhuma forma de pagamento disponível
                    </div>
                  ) : (
                    formasPagamento.map((fp) => (
                      <div key={fp.id} className="flex items-center px-2">
                        <SelectItem value={fp.nome} className="flex-1">
                          {fp.nome}
              </SelectItem>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFormaPagamentoEditando(fp);
                              setNomeFormaPagamentoEditado(fp.nome);
                            }}
                          >
                            <PencilIcon className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-red-500" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (confirm(`Deseja excluir a forma de pagamento "${fp.nome}"?`)) {
                                handleExcluirFormaPagamento(fp.id, fp.nome);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </SelectGroup>
                <div className="border-t p-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.preventDefault();
                      setMostrarAdicionarFormaPagamento(true);
                    }}
                    className="w-full"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    Nova Forma de Pagamento
                  </Button>
      </div>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea 
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Informações adicionais sobre esta transação..."
          rows={3}
        />
      </div>
      
      {/* Botões */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : transaction?.id ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;