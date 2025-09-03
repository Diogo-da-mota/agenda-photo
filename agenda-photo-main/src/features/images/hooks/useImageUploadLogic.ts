
import { useCallback } from "react";
import { uploadSingleImage, uploadFilesBatch } from "../services/useImageStorage";
import { formatUploadError } from "./useImageUploadError";
import { UseImageUploadOptions } from "./useImageUpload";
import { generateThumbnail, processFilesQueue } from "../services/uploadService";

export function useImageUploadLogic(options: UseImageUploadOptions, ui: any) {
  const {
    setIsUploading,
    setIsBatchProcessing,
    setProgress,
    setStatusMessage,
    setError,
    setUploadedImageUrl,
    setBatchProgress,
    toast,
    refreshStats,
    cancelUploadRef,
  } = ui;

  // Validação de arquivo (mantém flexibilidade p/ override)
  const validateFile = useCallback((file: File) => {
    const maxSizeMB = options.maxSize || 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const allowedTypes = options.allowedTypes || ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (file.size > maxSizeBytes)
      throw new Error(
        `O arquivo é muito grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). O tamanho máximo permitido é ${maxSizeMB}MB.`
      );
    if (!allowedTypes.includes(file.type))
      throw new Error(
        `Tipo de arquivo não permitido: ${file.type}. Formatos aceitos: ${allowedTypes
          .map((t) => t.replace("image/", "."))
          .join(", ")}`
      );
  }, [options]);

  const uploadImage = useCallback(
    async (file: File) => {
      cancelUploadRef.current = false;
      setIsUploading(true);
      setError(null);
      setProgress(0);
      setStatusMessage("Iniciando processamento da imagem...");
      try {
        const resp = await uploadSingleImage(file, {
          validateFile,
          onProgress: (percent: number, msg: string) => {
            setProgress(percent);
            setStatusMessage(msg);
          },
          onSuccess: (url: string) => {
            setUploadedImageUrl(url);
            if (options.onUploadComplete) options.onUploadComplete(url);
            toast("Upload concluído", "Sua imagem foi enviada com sucesso.");
          },
          onError: (e: any) => {
            const userMessage = formatUploadError(e, options.maxSize || 5);
            setError(userMessage);
            toast("Erro no upload", userMessage, "destructive");
          },
          generateThumbnails: options.generateThumbnails,
        });
        if (resp && resp.url && options.withStats) refreshStats();
        return resp;
      } finally {
        setIsUploading(false);
        setProgress(0);
        setStatusMessage("");
      }
    },
    [
      setIsUploading,
      setProgress,
      setStatusMessage,
      cancelUploadRef,
      validateFile,
      setUploadedImageUrl,
      options,
      toast,
      refreshStats,
      setError,
    ]
  );

  const uploadMultipleImages = useCallback(
    async (files: File[]) => {
      if (!files.length) return [];
      setIsBatchProcessing(true);
      setBatchProgress({ current: 0, total: files.length });
      setStatusMessage("Preparando upload em lote...");
      try {
        const results = await uploadFilesBatch(files, (fs: File[]) =>
          processFilesQueue(fs, {
            onStart: (totalFiles: number) => {
              setStatusMessage(`Iniciando upload de ${totalFiles} arquivos...`);
              setBatchProgress({ current: 0, total: totalFiles });
            },
            onProgress: (index: number, total: number, file: File) => {
              setBatchProgress({ current: index + 1, total });
              setStatusMessage(`Processando ${index + 1}/${total}: ${file.name}`);
            },
            onFileSuccess: (url: string, index: number, _metrics: any) => {
              setProgress(Math.round(((index + 1) / files.length) * 100));
            },
            onFileError: (err: Error, file: File, index: number) => {
              const userMessage = formatUploadError(err, options.maxSize || 5);
              toast(
                `Erro no arquivo ${index + 1}`,
                `Falha ao processar ${file.name}: ${userMessage}`,
                "destructive"
              );
            },
            onComplete: (results: any) => {
              const successful = results.filter((r: { success: any }) => r.success).length;
              toast(
                "Processamento concluído",
                `${successful} de ${results.length} imagens foram enviadas com sucesso.`
              );
              if (options.onBatchComplete) {
                options.onBatchComplete(
                  results.map((r: { url: any; success: any }) => ({
                    url: r.url,
                    success: r.success,
                  }))
                );
              }
              if (options.withStats) refreshStats();
            },
          })
        );
        return results;
      } finally {
        setIsBatchProcessing(false);
        setBatchProgress({ current: 0, total: 0 });
        setProgress(0);
        setStatusMessage("");
      }
    },
    [
      setIsBatchProcessing,
      setBatchProgress,
      setStatusMessage,
      setProgress,
      toast,
      options,
      refreshStats,
    ]
  );

  // Função para cancelar upload
  const cancelUpload = () => {
    if (ui.isUploading || ui.isBatchProcessing) {
      cancelUploadRef.current = true;
      setStatusMessage("Cancelando upload...");
      toast("Upload cancelado", "O processo de upload foi interrompido.");
    }
  };

  return {
    uploadImage,
    uploadMultipleImages,
    cancelUpload,
  };
}
