
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { ClienteFormData } from '@/types/clients';
import { useSecureForm } from '@/hooks/useSecureForm';
import { SecurityErrorBanner } from '@/components/security';
import { validateEmailSecurity, validatePhoneSecurity, sanitizeString, validateCurrency } from '@/utils/validation';
import { aplicarMascaraTelefone } from '@/utils/formatters';

// Definir esquema de validação com sanitização aprimorada
const clienteSchema = z.object({
  nome: z.string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo")
    .trim()
    .refine(val => !/[<>"'&\n\r\t]/.test(val), "Nome contém caracteres inválidos")
    .refine(val => val.length >= 2, "Nome deve ter pelo menos 2 caracteres")
    .refine(val => /^[a-zA-ZÀ-ÿ\s]+$/.test(val), "Nome deve conter apenas letras e espaços"),
  telefone: z.string()
    .nullable()
    .optional()
    .refine(val => {
      if (!val) return true;
      const { valid } = validatePhoneSecurity(val);
      return valid;
    }, "Número de telefone inválido"),
  data_nascimento: z.string().nullable().optional(),
  evento: z.string()
    .nullable()
    .optional()
    .refine(val => !val || !/[<>"'&\n\r\t]/.test(val), "Tipo de evento contém caracteres inválidos")
    .refine(val => !val || val.length <= 100, "Tipo de evento muito longo"),
  data_evento: z.string().nullable().optional(),
  valor_evento: z.string()
    .nullable()
    .optional()
    .refine(val => {
      if (!val) return true;
      const { valid } = validateCurrency(val);
      return valid;
    }, "Valor deve ser um número válido (ex: 1500,00)")
});

export interface ClienteFormProps {
  onSave?: (data: ClienteFormData) => Promise<void>;
  defaultValues?: Partial<ClienteFormData>;
  isSubmitting?: boolean;
  onSubmit?: (data: ClienteFormData) => Promise<void>;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ 
  onSave,
  onSubmit,
  defaultValues = { 
    nome: '', 
    telefone: '', 
    data_nascimento: null,
    evento: '',
    data_evento: null,
    valor_evento: null
  },
  isSubmitting = false
}) => {
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: defaultValues
  });

  const { submitSecurely, securityErrors } = useSecureForm({
    sanitizeInputs: true,
    validateXSS: true,
    requireCSRF: true
  });

  const handleSubmit = async (data: ClienteFormData) => {
    await submitSecurely(data, async (sanitizedData) => {
      // Converter valor_evento para número se fornecido
      const { valid: currencyValid, numericValue } = validateCurrency(sanitizedData.valor_evento as string);
      
      // Preparar dados finais com sanitização adicional
      const finalData = {
        ...sanitizedData,
        nome: sanitizeString(sanitizedData.nome as string, 100),
        telefone: sanitizedData.telefone ? sanitizeString(sanitizedData.telefone as string, 20) : null,
        evento: sanitizedData.evento ? sanitizeString(sanitizedData.evento as string, 100) : null,
        data_evento: sanitizedData.data_evento || null,
        valor_evento: numericValue
      };

      if (onSubmit) {
        await onSubmit(finalData);
      } else if (onSave) {
        await onSave(finalData);
      }
      
      form.reset();
    });
  };

  return (
    <Form {...form}>
      <SecurityErrorBanner 
        errors={securityErrors} 
        onDismiss={() => {}} 
      />
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome*</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do cliente" 
                  {...field} 
                  maxLength={100}
                  autoComplete="name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(00)0 0000-0000" 
                  value={field.value || ''} 
                  onChange={(e) => {
                    const formattedPhone = aplicarMascaraTelefone(e.target.value);
                    field.onChange(formattedPhone);
                  }}
                  maxLength={17}
                  autoComplete="tel"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
                      name="evento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Evento</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Casamento, Aniversário, Ensaio..." 
                  {...field} 
                  value={field.value || ''} 
                  maxLength={100}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valor_evento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Evento</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: 1500,00" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => {
                    // Permitir apenas números, vírgula e ponto
                    const value = e.target.value.replace(/[^0-9.,]/g, '');
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_evento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do Evento</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(new Date(field.value), "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // ✅ CORREÇÃO: Formatar data local sem conversão UTC
                          const dataFormatada = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                          field.onChange(dataFormatada);
                        }
                      }}
                      initialFocus
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_nascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input 
                  type="date"
                  {...field} 
                  value={field.value || ''} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClienteForm;
