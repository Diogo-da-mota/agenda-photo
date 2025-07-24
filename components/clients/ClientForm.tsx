// ❌ Potencialmente redundante com ClienteForm.tsx. Avaliar para consolidação ou remoção.
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientFormValues {
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
}

interface ClientFormProps {
  onSubmit: (data: ClientFormValues) => void;
  isSubmitting: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          placeholder="Nome completo"
          {...register("nome", { required: "Nome é obrigatório" })}
        />
        {errors.nome && (
          <p className="text-sm text-red-500">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@exemplo.com"
          {...register("email", {
            required: "Email é obrigatório",
            pattern: {
              value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
              message: "Email inválido",
            },
          })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          placeholder="(00) 00000-0000"
          {...register("telefone")}
        />
        {errors.telefone && (
          <p className="text-sm text-red-500">{errors.telefone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="empresa">Empresa</Label>
        <Input
          id="empresa"
          placeholder="Nome da empresa"
          {...register("empresa")}
        />
        {errors.empresa && (
          <p className="text-sm text-red-500">{errors.empresa.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar Cliente"}
      </Button>
    </form>
  );
};

export interface ClientFormValues {
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
}

export default ClientForm;
