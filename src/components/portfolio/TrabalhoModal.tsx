import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TrabalhoForm from './TrabalhoForm';
import { CriarTrabalhoPortfolio, CriarTrabalhoComImagens, TrabalhoPortfolioResumo } from '@/services/portfolioService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { criarTrabalhoComImagens, buscarTrabalhoPorId } from '@/services/portfolioService';
import { removerImagensDoStorage } from '@/services/portfolio/mutations/delete';
import { useSupabaseStorageUpload } from '@/hooks/useSupabaseStorageUpload';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface TrabalhoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  trabalhoToEdit?: TrabalhoPortfolioResumo | null;
}

const TrabalhoModal: React.FC<TrabalhoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trabalhoToEdit,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFiles, status } = useSupabaseStorageUpload({
    storageOptions: { bucket: 'imagens' }
  });
  const [trabalhoCompleto, setTrabalhoCompleto] = useState<CriarTrabalhoPortfolio | null>(null);
  const [isLoadingTrabalho, setIsLoadingTrabalho] = useState(false);

  // useEffect para carregar dados do trabalho em modo de edição
  useEffect(() => {
    // ✅ CORREÇÃO: Função async interna para evitar React Error #31
    const carregarTrabalhoCompleto = async () => {
      if (trabalhoToEdit && trabalhoToEdit.id) {
        setIsLoadingTrabalho(true);
        try {
          if (!user?.id) {
            throw new Error('Usuário não autenticado');
          }
          
          const trabalhoCompleto = await buscarTrabalhoPorId(trabalhoToEdit.id, user.id);
          
          if (!trabalhoCompleto) {
            throw new Error('Trabalho não encontrado');
          }
          
          const trabalhoParaEdicao: CriarTrabalhoPortfolio = {
            titulo: trabalhoCompleto.titulo,
            categoria: trabalhoCompleto.categoria,
            local: trabalhoCompleto.local,
            descricao: trabalhoCompleto.descricao,
            tags: trabalhoCompleto.tags || [],
            imagens: trabalhoCompleto.imagens || [],
            imagem_capa: trabalhoCompleto.imagem_capa
          };
          
          setTrabalhoCompleto(trabalhoParaEdicao);
        } catch (error) {
          console.error('[TrabalhoModal] Erro ao carregar trabalho completo:', error);
          toast({
            title: "Erro ao carregar trabalho",
            description: "Não foi possível carregar os dados do trabalho para edição.",
            variant: "destructive"
          });
        } finally {
          setIsLoadingTrabalho(false);
        }
      } else {
        setTrabalhoCompleto(null);
      }
    };

    // ✅ CORREÇÃO: Só executar se o modal estiver aberto
    if (isOpen) {
      carregarTrabalhoCompleto().catch(error => {
        console.error('[TrabalhoModal] Erro não tratado:', error);
      });
    }
  }, [isOpen, trabalhoToEdit, toast, user]);

  const handleSave = async (trabalho: CriarTrabalhoPortfolio) => {
    console.warn('[TrabalhoModal] Método handleSave não implementado - use handleSaveWithImages');
  };

  const handleSaveWithImages = async (trabalhoData: CriarTrabalhoComImagens) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar um trabalho.",
        variant: "destructive"
      });
      return;
    }

    const isEditing = trabalhoToEdit && trabalhoToEdit.id;

    try {
      console.log('[TrabalhoModal] Salvando trabalho com imagens:', { isEditing, trabalhoData });

      // 1. Remover imagens marcadas para exclusão (se houver)
      if (trabalhoData.imagensARemover && trabalhoData.imagensARemover.length > 0) {
        console.log('[TrabalhoModal] Removendo imagens do Supabase Storage:', trabalhoData.imagensARemover);
        await removerImagensDoStorage(trabalhoData.imagensARemover);
      }
      
      let novasImagensUrls: string[] = [];

      // 2. Fazer upload de novas imagens (se houver)
      if (trabalhoData.arquivos && trabalhoData.arquivos.length > 0) {
        console.log('[TrabalhoModal] Processando upload de novas imagens para o Supabase Storage');
        
        const pathPrefix = `Portfolio/${user.id}/${slugify(trabalhoData.trabalho.titulo)}`;
        const response = await uploadFiles(trabalhoData.arquivos, { pathPrefix });

        if (!response) {
          throw new Error('A resposta do upload foi indefinida.');
        }

        if (response.success) {
          novasImagensUrls = response.urls;
          console.log('[TrabalhoModal] Novas imagens enviadas:', novasImagensUrls);
        } else {
          const errorMessages = response.errors.map(e => e.error).join(', ');
          throw new Error(`Erro no upload: ${errorMessages}`);
        }
      }
      
      let resultado;
      
      if (isEditing) {
        // Modo edição - atualizar trabalho existente
        console.log('[TrabalhoModal] Atualizando trabalho existente:', trabalhoToEdit.id);
        
        // As imagens existentes já vêm de `trabalhoData` após a remoção no form
        const imagensExistentes = trabalhoData.trabalho.imagens || [];

        const todasImagens = [...imagensExistentes, ...novasImagensUrls];
        
        const dadosAtualizados = {
          titulo: trabalhoData.trabalho.titulo,
          categoria: trabalhoData.trabalho.categoria,
          local: trabalhoData.trabalho.local,
          descricao: trabalhoData.trabalho.descricao,
          tags: trabalhoData.trabalho.tags,
          imagens: todasImagens,
          imagem_capa: trabalhoData.trabalho.imagem_capa || (todasImagens.length > 0 ? todasImagens[0] : null),
          atualizado_em: new Date().toISOString()
        };

        const { data: trabalhoAtualizado, error: updateError } = await supabase
          .from('portfolio_trabalhos')
          .update(dadosAtualizados)
          .eq('id', trabalhoToEdit.id)
          .eq('user_id', user.id)
          .select('*')
          .single();

        if (updateError) {
          throw new Error(`Erro ao atualizar trabalho: ${updateError.message}`);
        }

        resultado = {
          trabalho: trabalhoAtualizado,
          imagens: todasImagens,
          sucessos: novasImagensUrls.length,
          falhas: trabalhoData.arquivos.length - novasImagensUrls.length
        };
        
      } else {
        // Modo criação - criar novo trabalho
        
        // Define a imagem de capa a partir das novas URLs. Garante que seja uma string ou null.
        const imagemDeCapa = trabalhoData.trabalho.imagem_capa || (novasImagensUrls.length > 0 ? novasImagensUrls[0] : null);

        // Monta o objeto final para criação de forma explícita e correta.
        const dadosParaCriar: CriarTrabalhoComImagens = {
          trabalho: {
            ...trabalhoData.trabalho,
            imagens: novasImagensUrls,
            imagem_capa: imagemDeCapa,
          },
          arquivos: trabalhoData.arquivos // Mantém a referência aos arquivos originais
        };
        
        resultado = await criarTrabalhoComImagens(dadosParaCriar, user.id);
      }

      const event = new CustomEvent('portfolioUpdated', { 
        detail: { 
          action: isEditing ? 'updated' : 'created', 
          trabalho: resultado.trabalho 
        } 
      });
      window.dispatchEvent(event);

      if (onSave) {
        onSave();
      }
      onClose();
      
    } catch (error) {
      console.error('[TrabalhoModal] Erro ao salvar trabalho:', error);
      toast({
        title: isEditing ? "Erro ao atualizar trabalho" : "Erro ao criar trabalho",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
      onClose();
    }
  };

  const isEditing = trabalhoToEdit && trabalhoToEdit.id;
  const modalTitle = isEditing ? "Editar Trabalho" : "Novo Trabalho";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] max-h-[90vh] overflow-y-auto p-3 sm:!max-w-4xl sm:p-6 w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {modalTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoadingTrabalho ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <TrabalhoForm
              onSave={handleSave}
              onSaveWithImages={handleSaveWithImages}
              onCancel={onClose}
              trabalhoInicial={trabalhoCompleto}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrabalhoModal; 