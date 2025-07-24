import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { entregaFotosAutomaticService } from '@/services/entregaFotosAutomaticService';
import { GaleriaCompleta, EntregarImagens } from '@/types/entregar-fotos';
import { 
  Download, 
  Share2, 
  Calendar, 
  Clock, 
  Lock, 
  Eye, 
  AlertCircle,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  CheckSquare
} from 'lucide-react';
import { useImageSelection } from '@/hooks/useImageSelection';
import { useBulkDownload, ImageDownloadData } from '@/hooks/useBulkDownload';
import { MultipleDownloadActionBar, MultipleDownloadActionBarWrapper } from '@/components/MultipleDownloadActionBar';
import { SelectableImageGrid } from '@/components/SelectableImageCard';
import { ImprovedLightbox, LightboxImage } from '@/components/ImprovedLightbox';

const EntregaFotosVisualizacao = () => {
  const { slug } = useParams<{ slug: string }>();
  const [galeria, setGaleria] = useState<GaleriaCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [senhaDigitada, setSenhaDigitada] = useState('');
  const [acessoLiberado, setAcessoLiberado] = useState(() => {
    // Verificar se já existe acesso liberado no sessionStorage
    if (slug) {
      const acessoSalvo = sessionStorage.getItem(`galeria_acesso_${slug}`);
      return acessoSalvo === 'true';
    }
    return false;
  });
  const [verificandoSenha, setVerificandoSenha] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [lightboxCurrentIndex, setLightboxCurrentIndex] = useState(0);
  const [downloadingImage, setDownloadingImage] = useState<string | null>(null);

  // Estados para downloads múltiplos
  const {
    selectedImages,
    isSelectionMode,
    selectedCount,
    selectionPercentage,
    toggleSelectionMode,
    toggleImageSelection,
    selectAll: selectAllImages,
    deselectAll: deselectAllImages,
    selectRange: selectImageRange
  } = useImageSelection({
    totalImages: galeria?.imagens?.length || 0,
    imageIds: galeria?.imagens?.map(img => img.id.toString()) || [],
    onSelectionChange: (selectedIds) => {
      console.log('Seleção alterada:', selectedIds);
    }
  });

  const {
    downloadState,
    isDownloading,
    overallProgress,
    completedImages,
    failedImages,
    totalImages: downloadTotalImages,
    startBulkDownload,
    cancelDownload,
    resetDownloadState,
    getAllDownloads
  } = useBulkDownload({
    callbacks: {
      onStart: (imageIds) => {
        console.log('Iniciando download de', imageIds.length, 'imagens');
      },
      onProgress: (progress) => {
        console.log('Progresso:', progress);
      },
      onComplete: (results) => {
        console.log('Download concluído:', results);
        // Resetar seleção após download bem-sucedido
        if (results.every(r => r.status === 'completed')) {
          deselectAllImages();
        }
      },
      onError: (error, imageId) => {
        console.error('Erro no download:', error, imageId);
      },
      onCancel: () => {
        console.log('Download cancelado');
      }
    }
  });

  useEffect(() => {
    const abortController = new AbortController();
    
    if (slug) {
      buscarGaleria(abortController.signal);
    }

    return () => {
      abortController.abort();
    };
  }, [slug]);

  // Limpar sessionStorage quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Cleanup opcional - pode ser removido se quiser manter o acesso durante toda a sessão
      // sessionStorage.removeItem(`galeria_acesso_${slug}`);
    };
  }, [slug]);

  const buscarGaleria = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      
      console.log('🔍 Buscando galeria por slug:', slug);
      
      // Verificar se a requisição foi cancelada
      if (signal?.aborted) return;
      
      // Verificar autenticação primeiro
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Usuário atual:', user ? user.email : 'Não autenticado');
      
      // Verificar se a requisição foi cancelada
      if (signal?.aborted) return;
      
      // Primeiro, buscar uma imagem pelo slug para obter o galeria_grupo_id
      const { data: imagemReferencia, error: referenciaError } = await supabase
        .from('entregar_imagens')
        .select('galeria_grupo_id')
        .eq('slug', slug)
        .abortSignal(signal)
        .single();

      if (referenciaError || !imagemReferencia) {
        if (signal?.aborted) return;
        console.error('❌ Erro ao buscar imagem de referência:', referenciaError);
        toast.error(`📂 Galeria "${slug}" não encontrada`);
        return;
      }

      // Verificar se a requisição foi cancelada
      if (signal?.aborted) return;

      // Agora buscar todas as imagens do mesmo grupo
      const { data: imagensData, error: imagensError } = await supabase
        .from('entregar_imagens')
        .select('*')
        .eq('galeria_grupo_id', imagemReferencia.galeria_grupo_id)
        .abortSignal(signal)
        .order('ordem', { ascending: true });

      if (imagensError) {
        if (signal?.aborted) return;
        console.error('❌ Erro detalhado na consulta:', {
          error: imagensError,
          slug,
          code: imagensError.code,
          message: imagensError.message
        });

        // Mensagens de erro mais específicas
        if (imagensError.code === 'PGRST116') {
          toast.error(`📂 Galeria "${slug}" não encontrada`);
        } else if (imagensError.message.includes('406')) {
          toast.error('🔑 Erro de autenticação. Verifique suas credenciais do Supabase.');
          console.log('🔧 SOLUÇÃO: Verificar variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
        } else if (imagensError.message.includes('row-level security')) {
          toast.error('🔒 Erro de permissão. Você não tem acesso a esta galeria.');
        } else {
          toast.error(`💥 Erro ao buscar galeria: ${imagensError.message}`);
        }
        return;
      }

      if (!imagensData || imagensData.length === 0) {
        if (signal?.aborted) return;
        toast.error(`📂 Galeria "${slug}" não encontrada ou vazia`);
        return;
      }

      // Verificar se a requisição foi cancelada antes de processar os dados
      if (signal?.aborted) return;

      console.log('✅ Imagens encontradas:', imagensData.length);

      // Pegar informações da galeria da primeira imagem (todas têm as mesmas informações da galeria)
      const primeiraImagem = imagensData[0];

      // Verificar se a galeria não expirou
      const agora = new Date();
      const dataExpiracao = new Date(primeiraImagem.data_expiracao);
      
      if (agora > dataExpiracao) {
        // Limpar acesso salvo se a galeria expirou
        if (slug) {
          sessionStorage.removeItem(`galeria_acesso_${slug}`);
        }
        setAcessoLiberado(false);
        toast.error('Esta galeria expirou e não está mais disponível');
        return;
      }

      // Montar galeria completa com informações da primeira imagem + todas as imagens
      const galeriaCompleta: GaleriaCompleta = {
        // Informações da galeria (extraídas da primeira imagem)
        galeria_grupo_id: primeiraImagem.galeria_grupo_id,
        titulo: primeiraImagem.titulo,
        descricao: primeiraImagem.descricao,
        slug: primeiraImagem.slug,
        data_entrega: primeiraImagem.data_entrega,
        data_expiracao: primeiraImagem.data_expiracao,
        senha_acesso: primeiraImagem.senha_acesso,
        status: primeiraImagem.status,
        total_fotos: primeiraImagem.total_fotos,
        total_acessos: primeiraImagem.total_acessos || 0,
        total_downloads: primeiraImagem.total_downloads || 0,
        ultimo_acesso: primeiraImagem.ultimo_acesso,
        permitir_download: primeiraImagem.permitir_download,
        permitir_compartilhamento: primeiraImagem.permitir_compartilhamento,
        marca_dagua: primeiraImagem.marca_dagua,
        observacoes: primeiraImagem.observacoes,
        user_id: primeiraImagem.user_id,
        criado_em: primeiraImagem.criado_em,
        atualizado_em: primeiraImagem.atualizado_em,
        
        // Array de todas as imagens
        imagens: imagensData
      };

      // Verificar se a requisição foi cancelada antes de definir o estado
      if (signal?.aborted) return;

      setGaleria(galeriaCompleta);
      
      // Registrar acesso à galeria
      try {
        await entregaFotosAutomaticService.registrarAcesso(slug);
      } catch (error) {
        console.error('Erro ao registrar acesso:', error);
        // Não exibir erro para o usuário, apenas logar
      }
      
      // Se não tem senha, libera acesso automaticamente
      if (!primeiraImagem.senha_acesso) {
        setAcessoLiberado(true);
        // Persistir o acesso no sessionStorage mesmo para galerias sem senha
        if (slug) {
          sessionStorage.setItem(`galeria_acesso_${slug}`, 'true');
        }
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro ao carregar galeria');
    } finally {
      setLoading(false);
    }
  };

  const verificarSenha = async () => {
    if (!galeria || !senhaDigitada.trim()) {
      toast.error('Digite a senha para acessar');
      return;
    }

    setVerificandoSenha(true);
    
    try {
      // Simular verificação de senha (em produção, isso seria feito no backend)
      if (senhaDigitada === galeria.senha_acesso) {
        setAcessoLiberado(true);
        // Persistir o acesso no sessionStorage
        if (slug) {
          sessionStorage.setItem(`galeria_acesso_${slug}`, 'true');
        }
        toast.success('Acesso liberado!');
      } else {
        toast.error('Senha incorreta');
        setSenhaDigitada('');
      }
    } catch (error) {
      toast.error('Erro ao verificar senha');
    } finally {
      setVerificandoSenha(false);
    }
  };

  // Função para download individual (mantida para compatibilidade)
  const downloadImagem = async (url: string, nomeArquivo: string) => {
    if (!galeria?.permitir_download) {
      toast.error('Downloads não permitidos para esta galeria');
      return;
    }

    setDownloadingImage(url);
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao baixar imagem');
      
      const blob = await response.blob();
      
      // Detectar iOS Safari para usar abordagem específica
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isIOS || isSafari) {
        // Solução específica para iOS/Safari: converter para base64 e usar data URL
        const reader = new FileReader();
        
        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            try {
              const base64Data = reader.result as string;
              // Remover o prefixo data:image/... e substituir por application/octet-stream
              const base64Content = base64Data.split(',')[1];
              const dataUrl = `data:application/octet-stream;base64,${base64Content}`;
              
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = nomeArquivo;
              link.style.display = 'none';
              
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          
          reader.onerror = () => reject(new Error('Erro ao converter imagem para base64'));
          reader.readAsDataURL(blob);
        });
      } else {
        // Abordagem padrão para outros navegadores
        const urlBlob = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = nomeArquivo;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(urlBlob);
      }
      
      toast.success('Imagem baixada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      toast.error('Erro ao baixar imagem');
    } finally {
      setDownloadingImage(null);
    }
  };

  // Funções para downloads múltiplos
  const handleDownloadSelected = async () => {
    if (!galeria?.permitir_download) {
      toast.error('Downloads não permitidos para esta galeria');
      return;
    }

    if (selectedImages.size === 0) {
      toast.error('Nenhuma imagem selecionada');
      return;
    }

    const selectedImageData: ImageDownloadData[] = galeria.imagens
      .filter(img => selectedImages.has(img.id))
      .map(img => ({
        id: img.id,
        url: img.url_imagem,
        fileName: img.nome_arquivo
      }));

    await startBulkDownload(selectedImageData);
  };

  const handleDownloadAll = async () => {
    if (!galeria?.permitir_download) {
      toast.error('Downloads não permitidos para esta galeria');
      return;
    }

    const allImageData: ImageDownloadData[] = galeria.imagens.map(img => ({
      id: img.id,
      url: img.url_imagem,
      fileName: img.nome_arquivo
    }));

    await startBulkDownload(allImageData);
  };

  const handleImageSelect = (imageId: string, event?: React.MouseEvent) => {
    toggleImageSelection(imageId, event);
  };

  const handleImageView = (imageId: string) => {
    if (!galeria) return;
    
    const images: LightboxImage[] = galeria.imagens.map(img => ({
      id: img.id,
      src: img.url_imagem,
      alt: img.nome_arquivo,
      title: img.nome_arquivo,
      downloadUrl: img.url_imagem,
      fileName: img.nome_arquivo
    }));
    
    const currentIndex = galeria.imagens.findIndex(img => img.id === imageId);
    
    setLightboxImages(images);
    setLightboxCurrentIndex(currentIndex >= 0 ? currentIndex : 0);
    setLightboxOpen(true);
  };

  const handleImageDownload = (imageId: string) => {
    const imagem = galeria.imagens.find(img => img.id === imageId);
    if (imagem) {
      downloadImagem(imagem.url_imagem, imagem.nome_arquivo);
    }
  };

  const handleSelectAll = () => {
    if (galeria?.imagens) {
      selectAllImages(galeria.imagens.map(img => img.id));
    }
  };

  const handleDeselectAll = () => {
    deselectAllImages();
  };

  const handleCloseActionBar = () => {
    deselectAllImages();
    resetDownloadState();
  };

  const compartilharGaleria = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: galeria?.titulo || 'Galeria de Fotos',
          text: 'Confira esta galeria de fotos',
          url: url,
        });
      } catch (error) {
        // Fallback para clipboard
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado para a área de transferência!');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const formatarData = (data: string | undefined) => {
    if (!data) return 'Data não informada';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularDiasRestantes = (dataExpiracao: string) => {
    const agora = new Date();
    const expiracao = new Date(dataExpiracao);
    const diferenca = expiracao.getTime() - agora.getTime();
    const dias = Math.ceil(diferenca / (1000 * 3600 * 24));
    return dias;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <p className="text-lg font-medium">Carregando galeria...</p>
        </div>
      </div>
    );
  }

  if (!galeria) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-red-700">Galeria não encontrada</h2>
            <p className="text-red-600">Esta galeria pode ter expirado ou não existe.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de senha
  if (galeria.senha_acesso && !acessoLiberado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-purple-800">
              {galeria.titulo}
            </CardTitle>
            <p className="text-purple-600">Esta galeria está protegida por senha</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Digite a senha de acesso"
                value={senhaDigitada}
                onChange={(e) => setSenhaDigitada(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && verificarSenha()}
                className="text-center"
              />
            </div>
            <Button 
              onClick={verificarSenha}
              disabled={verificandoSenha || !senhaDigitada.trim()}
              className="w-full"
            >
              {verificandoSenha ? 'Verificando...' : 'Acessar Galeria'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const diasRestantes = calcularDiasRestantes(galeria.data_expiracao);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header da Galeria */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{galeria.titulo}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatarData(galeria.data_entrega)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" />
                  <span>{galeria.imagens.length} fotos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {diasRestantes > 0 
                      ? `Expira em ${diasRestantes} dias` 
                      : 'Expira hoje'
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {galeria.permitir_download && (
                <>
                  <Button 
                    onClick={handleDownloadAll}
                    disabled={isDownloading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? 'Baixando...' : `Baixar todas (${galeria.imagens.length})`}
                  </Button>
                  <Button 
                    variant={isSelectionMode ? "default" : "outline"}
                    onClick={toggleSelectionMode}
                    className={isSelectionMode ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    {isSelectionMode ? 'Sair da seleção' : 'Selecionar múltiplas'}
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={compartilharGaleria}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              {diasRestantes <= 7 && (
                <Badge variant="destructive" className="px-3 py-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Expira em breve
                </Badge>
              )}
            </div>
          </div>
          
          {galeria.descricao && (
            <p className="mt-4 text-gray-700 max-w-3xl">{galeria.descricao}</p>
          )}
        </div>
      </div>

      {/* Grid de Fotos */}
      <MultipleDownloadActionBarWrapper 
        isVisible={isSelectionMode || isDownloading}
        position="bottom"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <SelectableImageGrid
            images={galeria.imagens.map(img => ({
              id: img.id,
              url: img.url_imagem,
              nome_arquivo: img.nome_arquivo,
              ordem: img.ordem,
              destaque: img.destaque
            }))}
            selectedImages={selectedImages}
            isSelectionMode={isSelectionMode}
            downloadProgresses={new Map(getAllDownloads().map(d => [d.imageId, d]))}
            onSelect={handleImageSelect}
            onDownload={handleImageDownload}
            onView={handleImageView}
          />

          {galeria.observacoes && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{galeria.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </MultipleDownloadActionBarWrapper>

      {/* Lightbox Melhorado */}
      <ImprovedLightbox
        isOpen={lightboxOpen}
        images={lightboxImages}
        currentIndex={lightboxCurrentIndex}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxCurrentIndex}
        showDownload={galeria?.permitir_download || false}
        showShare={galeria?.permitir_compartilhamento || false}
        showInfo={true}
        showThumbnails={true}
        enableKeyboardNavigation={true}
        enableSwipeNavigation={true}
        enableZoom={true}
        autoPlay={false}
        downloadInProgress={downloadingImage !== null}
        onDownload={(image) => {
          if (image.downloadUrl && image.fileName) {
            downloadImagem(image.downloadUrl, image.fileName);
          }
        }}
        onShare={(image) => {
          if (navigator.share) {
            navigator.share({
              title: image.title || 'Imagem da galeria',
              text: `Confira esta imagem da galeria: ${galeria?.titulo}`,
              url: window.location.href
            }).catch(() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copiado para a área de transferência!');
            });
          } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copiado para a área de transferência!');
          }
        }}
      />

      {/* Barra de Ação para Downloads Múltiplos */}
      {(isSelectionMode || isDownloading) && (
        <MultipleDownloadActionBar
          selectedCount={selectedCount}
          totalImages={galeria?.imagens?.length || 0}
          isDownloading={isDownloading}
          overallProgress={overallProgress}
          completedImages={completedImages}
          failedImages={failedImages}
          onDownloadSelected={handleDownloadSelected}
          onDownloadAll={handleDownloadAll}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onCancel={cancelDownload}
          onClose={handleCloseActionBar}
          config={{
            showSelectAll: true,
            showDownloadAll: true,
            showProgress: true,
            showStats: true,
            position: 'bottom'
          }}
        />
      )}
    </div>
  );
};

export default EntregaFotosVisualizacao;