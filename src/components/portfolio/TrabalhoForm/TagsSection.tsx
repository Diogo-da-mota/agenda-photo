
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Upload, Loader2 } from 'lucide-react';

interface TagsSectionProps {
  tags: string[];
  tagInput: string;
  setTagInput: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  onCancel?: () => void;
}

const TagsSection: React.FC<TagsSectionProps> = ({
  tags,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
  fileInputRef,
  onFileUpload,
  isLoading,
  onCancel,
}) => {
  return (
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
              onAddTag();
            }
          }}
          className="flex-grow"
        />
        <Button type="button" onClick={onAddTag} variant="outline" size="icon" aria-label="Adicionar tag">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={onFileUpload}
          className="hidden"
        />
        
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto">
            Cancelar
          </Button>
        )}
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-initial"
          >
            <span className="hidden sm:inline">Clique aqui para subir</span>
            <span className="sm:hidden">Upload</span>
            <Upload className="h-4 w-4 ml-2" />
          </Button>
          
          <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-initial min-w-[120px]">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(index)}
                className="hover:text-blue-600"
                aria-label={`Remover tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsSection;
