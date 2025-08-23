import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Calendar, Lock, FileText, Camera, Loader2, Copy, Link } from 'lucide-react';
import { EntregarFotosFormData } from '@/types/entregar-fotos';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface GaleriaFormProps {
  formData: EntregarFotosFormData;
  selectedImages: ImageFile[];
  isUploading: boolean;
  uploadProgress: number;
  galeriaSlug: string;
  galeriaSenha: string;
  onInputChange: (field: keyof EntregarFotosFormData, value: string | boolean) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onRemoveImage: (id: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onClearImages: () => void;
}

const GaleriaForm: React.FC<GaleriaFormProps> = ({
  formData,
  selectedImages,
  isUploading,
  uploadProgress,
  galeriaSlug,
  galeriaSenha,
  onInputChange,
  onFileSelect,
  onDrop,
  onRemoveImage,
  onSubmit,
  onClearImages
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Informações Básicas */}
      <Card className="shadow-sm border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            Informações da Galeria
          </CardTitle>
          <CardDescription className="text-base">
            Preencha as informações básicas da galeria de fotos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="titulo" className="text-sm font-medium">Título da Galeria *</Label>
              <Input
                id="titulo"
                placeholder="Ex: Casamento Juliana e Leo"
                value={formData.titulo}
                onChange={(e) => onInputChange('titulo', e.target.value)}
                required
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Será usado para criar a URL da galeria
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Link className="h-4 w-4" />
                URL da Galeria
              </Label>
              <div className="relative">
                <Input
                  value={galeriaSlug ? `${window.location.origin}/entrega-fotos/${galeriaSlug}` : 'URL será gerada após criar a galeria'}
                  readOnly
                  className="h-10 sm:h-11 pr-8 sm:pr-10 bg-muted/50 text-xs sm:text-sm"
                />
                {galeriaSlug && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 sm:h-9 sm:w-9 p-0"
                    onClick={() => {
                      const fullUrl = `${window.location.origin}/entrega-fotos/${galeriaSlug}`;
                      navigator.clipboard.writeText(fullUrl);
                    }}
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Link para compartilhar com o cliente
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4" />
                Senha Atual
              </Label>
              <div className="relative">
                <Input
                  value={galeriaSenha || 'Nenhuma senha definida'}
                  readOnly
                  className="h-10 sm:h-11 pr-8 sm:pr-10 bg-muted/50 text-xs sm:text-sm"
                />
                {galeriaSenha && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 sm:h-9 sm:w-9 p-0"
                    onClick={() => {
                      navigator.clipboard.writeText(galeriaSenha);
                    }}
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Senha para acesso à galeria
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="data_entrega" className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Data de Entrega
              </Label>
              <Input
                id="data_entrega"
                type="date"
                value={formData.data_entrega || ''}
                onChange={(e) => onInputChange('data_entrega', e.target.value)}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="senha_acesso" className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4" />
                Senha de Acesso
              </Label>
              <Input
                id="senha_acesso"
                type="text"
                placeholder="Senha opcional para proteger a galeria"
                value={formData.senha_acesso || ''}
                onChange={(e) => onInputChange('senha_acesso', e.target.value)}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="descricao" className="text-sm font-medium">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descrição opcional da galeria..."
              value={formData.descricao || ''}
              onChange={(e) => onInputChange('descricao', e.target.value)}
              className="min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload de Fotos */}
      <Card className="shadow-sm border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            Upload de Fotos
          </CardTitle>
          <CardDescription className="text-base">
            Selecione ou arraste as fotos que deseja enviar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Área de Upload */}
          <div
            className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-6 sm:p-8 lg:p-12 text-center hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 cursor-pointer group touch-manipulation"
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Upload className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <p className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">
                  <span className="hidden sm:inline">Clique para selecionar ou arraste as fotos aqui</span>
                  <span className="sm:hidden">Toque para selecionar fotos</span>
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  <span className="hidden sm:inline">Suporte para JPG, PNG, GIF e WEBP (máx. 10MB por foto)</span>
                  <span className="sm:hidden">JPG, PNG, GIF, WEBP (máx. 10MB)</span>
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={onFileSelect}
              className="hidden"
            />
          </div>

          {/* Preview das Imagens */}
          {selectedImages.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold">
                  <span className="hidden sm:inline">Fotos Selecionadas ({selectedImages.length})</span>
                  <span className="sm:hidden">Fotos ({selectedImages.length})</span>
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClearImages}
                  className="hover:bg-destructive hover:text-destructive-foreground h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Limpar Todas</span>
                  <span className="sm:hidden">Limpar</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 lg:gap-4">
                {selectedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg border-2 border-border hover:border-primary/50 transition-colors">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className={cn(
                        "absolute -top-1 -right-1 sm:-top-2 sm:-right-2",
                        "h-6 w-6 sm:h-7 sm:w-7 rounded-full p-0",
                        "opacity-100 sm:opacity-0 sm:group-hover:opacity-100", // Sempre visível no mobile
                        "transition-opacity shadow-lg touch-manipulation"
                      )}
                      onClick={() => onRemoveImage(image.id)}
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-1 sm:p-2 rounded-b-lg">
                      <p className="truncate font-medium text-xs">{image.file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de Envio */}
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          size="lg"
          disabled={isUploading || !formData.titulo.trim() || selectedImages.length === 0}
          className="min-w-[180px] sm:min-w-[240px] h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 animate-spin" />
              <span className="hidden sm:inline">
                Criando Galeria... {uploadProgress > 0 && `${Math.round(uploadProgress)}%`}
              </span>
              <span className="sm:hidden">
                {uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : 'Criando...'}
              </span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Enviar Galeria</span>
              <span className="sm:hidden">Enviar</span>
            </>
          )}
        </Button>
      </div>

      {/* Barra de Progresso */}
      {isUploading && uploadProgress > 0 && (
        <Card className="shadow-sm border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progresso do upload</span>
                <span className="text-sm font-bold text-primary">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
};

export default GaleriaForm;