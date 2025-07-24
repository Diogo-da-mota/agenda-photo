
export function formatUploadError(error: any, maxSize = 5) {
  const errorMessage = typeof error === "string" ? error : error?.message || "Erro desconhecido no upload";
  if (errorMessage.includes('tempo limite')) {
    return 'O upload demorou muito tempo. Tente uma imagem menor ou verifique sua conexão.';
  }
  if (errorMessage.includes('autenticado') || errorMessage.includes('autenticação')) {
    return 'Você precisa estar logado para fazer upload de imagens.';
  }
  if (errorMessage.includes('muito grande')) {
    return `A imagem é muito grande. Tente uma imagem menor que ${maxSize}MB.`;
  }
  return errorMessage;
}
