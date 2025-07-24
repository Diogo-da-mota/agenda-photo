import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { carregarGalerias, apagarGaleria, criarGaleria } from '@/services/galeriaService';
import { processFiles, ImageFile } from '@/utils/galeriaUtils';
import { EntregarFotosFormData, Galeria } from '@/types/entregar-fotos';
import GaleriaForm from '@/components/EntregaFotos/GaleriaForm';
import GaleriaSucesso from '@/components/EntregaFotos/GaleriaSucesso';
import GaleriasLista from '@/components/EntregaFotos/GaleriasLista';
import ResponsiveContainer from '@/components/ResponsiveContainer';

export default function EntregaFotos() {
  // Estados do formulário
  const [formData, setFormData] = useState<EntregarFotosFormData>({
    titulo: '',
    url_galeria: '',
    senha_acesso: '',
    data_entrega: '',
    senha_acesso_cliente: '',
    descricao: '',
    permitir_download: true,
    permitir_compartilhamento: true,
    marca_dagua: false
  });

  // Estados das imagens
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Estados da galeria
  const [galeriaUrl, setGaleriaUrl] = useState('');
  const [senhaGaleria, setSenhaGaleria] = useState('');

  // Estados das abas e galerias
  const [activeTab, setActiveTab] = useState('nova-galeria');
  const [galerias, setGalerias] = useState<Galeria[]>([]);
  const [isLoadingGalerias, setIsLoadingGalerias] = useState(false);

  // Carregar galerias ao montar o componente
  useEffect(() => {
    const loadGalerias = async () => {
      setIsLoadingGalerias(true);
      try {
        const galeriasData = await carregarGalerias();
        setGalerias(galeriasData);
      } catch (error) {
        toast.error('Erro ao carregar galerias. Tente novamente.');
      } finally {
        setIsLoadingGalerias(false);
      }
    };

    if (activeTab === 'galeria-fotos') {
      loadGalerias();
    }
  }, [activeTab]);

  // Função para lidar com mudanças no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Função para lidar com seleção de arquivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const { validImages, hasInvalidFiles } = processFiles(files);
    
    if (hasInvalidFiles) {
      toast.warning('Apenas arquivos de imagem são aceitos');
    }
    
    setSelectedImages(prev => [...prev, ...validImages]);
  };

  // Função para lidar com drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const { validImages, hasInvalidFiles } = processFiles(files);
    
    if (hasInvalidFiles) {
      toast.warning('Apenas arquivos de imagem são aceitos');
    }
    
    setSelectedImages(prev => [...prev, ...validImages]);
  };

  // Função para remover imagem
  const removeImage = (id: string) => {
    setSelectedImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  // Função para enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    
    if (selectedImages.length === 0) {
      toast.error('Selecione pelo menos uma imagem');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await criarGaleria(formData, selectedImages, setUploadProgress);

      // Limpar formulário e imagens
      setFormData({
        titulo: '',
        url_galeria: '',
        senha_acesso: '',
        data_entrega: '',
        senha_acesso_cliente: '',
        descricao: '',
        permitir_download: true,
        permitir_compartilhamento: true,
        marca_dagua: false
      });
      
      selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
      setSelectedImages([]);

      // Definir URL da galeria e senha
      setGaleriaUrl(result.galeriaUrl);
      setSenhaGaleria(result.senha);

      // Recarregar galerias
      const galeriasData = await carregarGalerias();
      setGalerias(galeriasData);

      toast.success('Galeria criada com sucesso!');

    } catch (error) {
      console.error('Erro ao criar galeria:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar galeria');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Função para apagar galeria com atualização otimista
  const handleApagarGaleria = async (slug: string, titulo: string) => {
    try {
      // Atualização otimista da UI
      const galeriaOriginal = galerias.find(g => g.slug === slug);
      setGalerias(prev => prev.filter(g => g.slug !== slug));

      const success = await apagarGaleria(slug, titulo);
      
      if (success) {
        toast.success(`Galeria "${titulo}" foi apagada com sucesso!`);
      } else {
        // Reverter UI se cancelado
        if (galeriaOriginal) {
          setGalerias(prev => [...prev, galeriaOriginal].sort((a, b) => 
            new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
          ));
        }
      }
      
    } catch (error) {
      console.error('Erro ao apagar galeria:', error);
      toast.error('Erro inesperado ao apagar galeria. Tente novamente.');
      
      // Reverter UI em caso de erro
      const galeriaOriginal = galerias.find(g => g.slug === slug);
      if (galeriaOriginal) {
        setGalerias(prev => [...prev, galeriaOriginal].sort((a, b) => 
          new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
        ));
      }
    }
  };

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entrega de Fotos</h1>
          <p className="text-muted-foreground">
            Crie uma galeria para entregar fotos aos seus clientes
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nova-galeria">Nova Galeria</TabsTrigger>
            <TabsTrigger value="galeria-fotos">Galeria de Fotos</TabsTrigger>
          </TabsList>

          <TabsContent value="nova-galeria" className="space-y-6">
            {galeriaUrl ? (
              <GaleriaSucesso 
                galeriaUrl={galeriaUrl}
                senha={senhaGaleria}
                onNovaGaleria={() => {
                  setGaleriaUrl('');
                  setSenhaGaleria('');
                }}
              />
            ) : (
              <GaleriaForm
                formData={formData}
                selectedImages={selectedImages}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                onChange={handleChange}
                onFileSelect={handleFileSelect}
                onDrop={handleDrop}
                onRemoveImage={removeImage}
                onSubmit={handleSubmit}
              />
            )}
          </TabsContent>

          <TabsContent value="galeria-fotos" className="space-y-6">
            <GaleriasLista
              galerias={galerias}
              isLoading={isLoadingGalerias}
              onApagarGaleria={handleApagarGaleria}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
}
