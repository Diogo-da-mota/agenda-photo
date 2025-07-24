
import React from 'react';
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
import { CATEGORIAS_PORTFOLIO } from '@/services/portfolioService';

interface FormBasicFieldsProps {
  titulo: string;
  categoria: string;
  local: string;
  descricao: string;
  onInputChange: (field: string, value: string) => void;
}

const FormBasicFields: React.FC<FormBasicFieldsProps> = ({
  titulo,
  categoria,
  local,
  descricao,
  onInputChange
}) => {
  return (
    <>
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => onInputChange('titulo', e.target.value)}
          placeholder="Digite o título do trabalho"
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria *</Label>
          <Select 
            value={categoria} 
            onValueChange={(value) => onInputChange('categoria', value)}
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
            value={local}
            onChange={(e) => onInputChange('local', e.target.value)}
            placeholder="Local do trabalho"
          />
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => onInputChange('descricao', e.target.value)}
          placeholder="Descreva seu trabalho..."
          rows={4}
          className="resize-none"
        />
      </div>
    </>
  );
};

export default FormBasicFields;
