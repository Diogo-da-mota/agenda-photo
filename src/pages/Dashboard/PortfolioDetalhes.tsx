import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, X, Plus, Upload, Image as ImageIcon, Trash2, Star } from 'lucide-react';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { useTrabalhoIndividual as useTrabalhoPortfolio } from '@/hooks/portfolio';
import { useTrabalhoIndividualPorTitulo } from '@/hooks/portfolio/useTrabalhoIndividual';
import { CATEGORIAS_PORTFOLIO, CriarTrabalhoPortfolio } from '@/services/portfolioService';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseStorageUpload } from '@/hooks/useSupabaseStorageUpload';
import { slugify } from '@/lib/utils';

const PortfolioDetalhes: React.FC = () => {
  const { id: tituloComHifens } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Converter hífens de volta para espaços para buscar
  const titulo = tituloComHifens?.replace(/-/g, ' ') || '';
  
  const { trabalho, isLoading, atualizarTrabalho, isAtualizando } = useTrabalhoIndividualPorTitulo(titulo);
  const { uploadFiles, status: uploadStatus } = useSupabaseStorageUpload({
    storageOptions: { bucket: 'imagens' }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<CriarTrabalhoPortfolio>({
    titulo: '',
    categoria: '',
    local: '',
    descricao: '',
    tags: [],
    imagens: [],
    imagem_capa: null
  });
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Atualizar formData quando o trabalho for carregado
  React.useEffect(() => {
    if (trabalho) {
      setFormData({
        titulo: trabalho.titulo,
        categoria: trabalho.categoria,
        local: trabalho.local,
        descricao: trabalho.descricao,
        tags: trabalho.tags,
        imagens: trabalho.imagens,
        imagem_capa: trabalho.imagem_capa
      });
    }
  }, [trabalho]);

  const handleInputChange = (field: keyof CriarTrabalhoPortfolio, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveImage = (index: number) => {
    const imagemRemovida = formData.imagens[index];
    
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index),
      // Se a imagem removida era a capa, limpar a capa
      imagem_capa: prev.imagem_capa === imagemRemovida ? null : prev.imagem_capa
    }));
    setArquivos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetAsCover = (imagemUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imagem_capa: imagemUrl
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Armazenar os arquivos originais
    const newFiles = Array.from(files);
    setArquivos(prev => [...prev, ...newFiles]);

    // Criar previews para visualização
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData(prev => ({
            ...prev,
            imagens: [...prev.imagens, e.target!.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    try {
      // O estado de loading é gerenciado pelo hook 'useTrabalhoPortfolio' como 'isAtualizando'
      // mas o upload é uma operação separada que acontece antes.
      console.log('=== INÍCIO DO SAVE ===');
      console.log('Arquivos selecionados:', arquivos?.length || 0);
      
      let updatedFormData: CriarTrabalhoPortfolio = { ...formData };
      
      if (arquivos && arquivos.length > 0) {
        console.log('Iniciando upload de', arquivos.length, 'arquivos para o Supabase Storage...');
        
        try {
          const pathPrefix = `Portfolio/${trabalho.user_id}/${slugify(formData.titulo)}`;
          const response = await uploadFiles(arquivos, { pathPrefix });

          if (!response) {
            throw new Error('A resposta do upload foi indefinida.');
          }
          
          let uploadedUrls: string[] | undefined = undefined;
          
          if (response.success) {
            uploadedUrls = response.urls;
          } else {
             const errorMessages = response.errors.map(e => e.error).join(', ');
             console.error('AVISO: Upload falhou!', errorMessages);
             // Não impede o salvamento dos metadados, mas loga o erro.
          }
          
          console.log('URLs extraídas:', uploadedUrls);
          
          if (uploadedUrls && uploadedUrls.length > 0) {
            // Remove as imagens de preview (data: URL) antes de adicionar as novas
            const imagensReais = updatedFormData.imagens.filter(img => !img.startsWith('data:'));

            // Define a imagem de capa se ainda não houver uma
            if (!updatedFormData.imagem_capa && uploadedUrls[0]) {
              updatedFormData.imagem_capa = uploadedUrls[0];
              console.log('Definindo nova imagem de capa:', uploadedUrls[0]);
            }
            
            updatedFormData.imagens = [...imagensReais, ...uploadedUrls];
            console.log('Array de imagens atualizado:', updatedFormData.imagens);
          }
          
        } catch (uploadError) {
          console.error('Erro CRÍTICO no upload:', uploadError);
          toast({
            title: "Erro no Upload",
            description: "Não foi possível enviar os arquivos. A operação foi cancelada.",
            variant: "destructive"
          });
          return; // Interrompe TUDO se o upload falhar
        }
      }
      
      // Remove quaisquer data URLs restantes antes de salvar
      updatedFormData.imagens = updatedFormData.imagens.filter(img => !img.startsWith('data:'));

      console.log('=== DADOS PARA SALVAR ===');
      console.log('FormData atualizado:', updatedFormData);
      
      await atualizarTrabalho(updatedFormData);
      
      console.log('Salvamento concluído com sucesso.');
      
      toast({
        title: "Sucesso!",
        description: "Portfolio salvo com sucesso!",
        variant: "default"
      });
      setArquivos([]); // Limpa a lista de arquivos a serem enviados
      
    } catch (error) {
      console.error('=== ERRO GERAL NO SAVE ===');
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao Salvar",
        description: "Ocorreu um erro inesperado ao salvar o portfolio.",
        variant: "destructive"
      });
    } finally {
      console.log('=== FIM DO SAVE ===');
    }
  };

  if (isLoading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando trabalho...</span>
        </div>
      </ResponsiveContainer>
    );
  }

  if (!trabalho) {
    return (
      <ResponsiveContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Trabalho não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O trabalho que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/portfolio')}>
            Voltar ao Portfólio
          </Button>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header com botão voltar e salvar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/portfolio')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Detalhes do Trabalho</h1>
              <p className="text-muted-foreground">
                Edite as informações do seu trabalho
              </p>
            </div>
          </div>
          
          <Button onClick={handleSave} disabled={isAtualizando || uploadStatus.isUploading}>
            {isAtualizando || uploadStatus.isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {uploadStatus.isUploading ? 'Enviando...' : 'Salvar Alterações'}
          </Button>
        </div>

        {/* Formulário de edição */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Trabalho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Digite o título do trabalho"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => handleInputChange('categoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_PORTFOLIO.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Local */}
              <div className="space-y-2">
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => handleInputChange('local', e.target.value)}
                  placeholder="Local do trabalho"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descreva seu trabalho..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Digite uma tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Data de criação e atualização */}
            {trabalho && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm text-muted-foreground">Data de Criação</Label>
                  <p className="text-sm">
                    {new Date(trabalho.criado_em).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Última Atualização</Label>
                  <p className="text-sm">
                    {new Date(trabalho.atualizado_em).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Galeria de imagens */}
        <Card>
          <CardHeader>
            <CardTitle>Galeria de Imagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload de novas imagens */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-base text-gray-600 font-medium">
                  Arraste e solte aqui
                </p>
                <p className="text-sm text-gray-400 mt-1">ou</p>
                <Button type="button" variant="outline" className="mt-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Clique aqui para subir
                </Button>
              </div>
            </div>

            {/* Grid de imagens */}
            {formData.imagens.length > 0 && (
              <div className="space-y-4">
                {/* Indicador de imagem de capa atual */}
                {formData.imagem_capa && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-blue-600 fill-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Imagem de capa selecionada
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {formData.imagens.map((imagem, index) => {
                    const isCapaAtual = formData.imagem_capa === imagem;
                    
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={imagem}
                          alt={`Imagem ${index + 1}`}
                          className={`w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-75 transition-all ${
                            isCapaAtual ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                          }`}
                          onClick={() => {
                            // Aqui você pode implementar um lightbox/modal para visualizar a imagem em tamanho maior
                            window.open(imagem, '_blank');
                          }}
                        />
                        
                        {/* Indicador de capa */}
                        {isCapaAtual && (
                          <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1">
                            <Star className="h-3 w-3 fill-current" />
                          </div>
                        )}
                        
                        {/* Botões de ação */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-1">
                          {!isCapaAtual && (
                            <button
                              type="button"
                              onClick={() => handleSetAsCover(imagem)}
                              className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                              title="Definir como capa"
                            >
                              <Star className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            title="Remover imagem"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {formData.imagens.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma imagem adicionada ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default PortfolioDetalhes; 