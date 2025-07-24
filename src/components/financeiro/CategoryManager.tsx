import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PencilIcon, PlusCircle, TrashIcon, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Categoria, buscarCategorias, criarCategoria, editarCategoria, excluirCategoria } from '@/services/categoriaService';

interface CategoryManagerProps {
  tipo: 'receita' | 'despesa';
  onCategoriesChanged?: () => void;
  trigger?: React.ReactNode;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  tipo, 
  onCategoriesChanged,
  trigger 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [nomeEditado, setNomeEditado] = useState('');

  // Carregar categorias
  const carregarCategorias = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const categoriasCarregadas = await buscarCategorias(user.id, tipo);
      setCategorias(categoriasCarregadas);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive'
      });
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar categorias ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      carregarCategorias();
    }
  }, [isOpen, user]);

  // Adicionar nova categoria
  const handleAdicionarCategoria = async () => {
    if (!user || !novaCategoria.trim()) return;
    
    setIsLoading(true);
    try {
      await criarCategoria(novaCategoria, tipo, user.id);
      await carregarCategorias();
      setNovaCategoria('');
      toast({
        title: 'Sucesso',
        description: 'Categoria adicionada com sucesso.',
      });
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível adicionar a categoria.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar edição de categoria
  const handleIniciarEdicao = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setNomeEditado(categoria.nome);
  };

  // Cancelar edição
  const handleCancelarEdicao = () => {
    setCategoriaEditando(null);
    setNomeEditado('');
  };

  // Salvar edição
  const handleSalvarEdicao = async () => {
    if (!user || !categoriaEditando || !nomeEditado.trim()) return;
    
    setIsLoading(true);
    try {
      await editarCategoria(categoriaEditando.id, nomeEditado, user.id);
      await carregarCategorias();
      setCategoriaEditando(null);
      setNomeEditado('');
      toast({
        title: 'Sucesso',
        description: 'Categoria atualizada com sucesso.',
      });
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a categoria.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir categoria
  const handleExcluirCategoria = async (id: string) => {
    if (!user) return;
    
    const confirmar = window.confirm('Tem certeza que deseja excluir esta categoria?');
    if (!confirmar) return;
    
    setIsLoading(true);
    try {
      await excluirCategoria(id, user.id);
      await carregarCategorias();
      toast({
        title: 'Sucesso',
        description: 'Categoria excluída com sucesso.',
      });
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir a categoria.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm">Gerenciar Categorias</Button>}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias de {tipo === 'receita' ? 'Receitas' : 'Despesas'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Formulário para adicionar nova categoria */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Label htmlFor="novaCategoria">Nova Categoria</Label>
              <Input 
                id="novaCategoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder="Nome da categoria"
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleAdicionarCategoria} 
              disabled={isLoading || !novaCategoria.trim()}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
          
          {/* Lista de categorias */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <p className="text-sm text-gray-500">Carregando categorias...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : categorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4 text-sm text-gray-500">
                      Nenhuma categoria encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  categorias.map((categoria) => (
                    <TableRow key={categoria.id}>
                      <TableCell>
                        {categoriaEditando?.id === categoria.id ? (
                          <Input
                            value={nomeEditado}
                            onChange={(e) => setNomeEditado(e.target.value)}
                            disabled={isLoading}
                          />
                        ) : (
                          categoria.nome
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {categoriaEditando?.id === categoria.id ? (
                          <div className="flex justify-end space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleCancelarEdicao}
                              disabled={isLoading}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={handleSalvarEdicao}
                              disabled={isLoading || !nomeEditado.trim()}
                            >
                              Salvar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-1">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleIniciarEdicao(categoria)}
                              disabled={isLoading}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              onClick={() => handleExcluirCategoria(categoria.id)}
                              disabled={isLoading}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager; 