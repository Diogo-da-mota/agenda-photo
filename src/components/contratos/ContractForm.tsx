import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Upload, Info, X, File, FileImage, FileText, Edit, Save, XCircle } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEmpresa } from '@/hooks/useEmpresa';
import ContractPreview from './ContractPreview';
// import { ContractTemplateSelector } from './ContractTemplateSelector'; // Removido
import { eventTypes } from '@/components/agenda/types';
import { createContract } from '@/services/contractService';
import { supabase } from '@/lib/supabase';
import { generateUniqueContractId } from '@/utils/contractIdGenerator';

// Funções de formatação (movidas para antes do template)
const formatPhone = (value: string) => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Se não tem números, retorna vazio
  if (!numbers) return '';
  
  // Aplica a máscara baseada no comprimento
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  } else {
    // Para celular (11 dígitos): (00) 00000-0000
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

const formatCurrency = (value: string | number) => {
  // Converte para string se for número
  const stringValue = typeof value === 'number' ? value.toString() : value;
  
  // Se o valor é um número puro (ex: "1000"), formata como moeda
  if (/^\d+$/.test(stringValue)) {
    const numValue = parseFloat(stringValue);
    return numValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  // Remove tudo que não é número ou vírgula
  let numbers = stringValue.replace(/[^\d,]/g, '');
  
  // Se não tem números, retorna vazio
  if (!numbers) return '';
  
  // Se tem vírgula, divide em partes
  const parts = numbers.split(',');
  
  // Formata a parte inteira com pontos de milhares
  let integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Se tem parte decimal, limita a 2 dígitos
  let decimalPart = parts[1] ? parts[1].slice(0, 2) : '';
  
  // Monta o resultado
  if (decimalPart) {
    return `${integerPart},${decimalPart}`;
  } else if (numbers.includes(',')) {
    return `${integerPart},`;
  } else {
    return integerPart;
  }
};

const parseCurrency = (value: string) => {
  // Remove formatação e converte para número
  const numbers = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(numbers) || 0;
};

// Função para gerar template dinâmico baseado nos dados do cliente e empresa
export const generateContractTemplate = (clientData?: any, empresaConfig?: any) => {
  // PRIORIDADE 1: Se existe conteúdo personalizado (da coluna 'conteudo'), usar ele com substituições dinâmicas
  const conteudoPersonalizado = clientData?.termsAndConditions || clientData?.conteudo;
  
  if (conteudoPersonalizado && conteudoPersonalizado.trim() !== '') {
    // Aplicar substituições dinâmicas no conteúdo personalizado
    return applyDynamicReplacements(conteudoPersonalizado, clientData, empresaConfig);
  }
  
  // PRIORIDADE 2: Se não há conteúdo personalizado, usar template padrão com dados dinâmicos
  const nomeCliente = clientData?.clientName || clientData?.nome_cliente || '[NOME DO CONTRATANTE]';
  const tipoEvento = clientData?.eventType || clientData?.tipo_evento || 'casamento';
  const dataEvento = clientData?.eventDate || clientData?.data_evento ? new Date(clientData.eventDate || clientData.data_evento).toLocaleDateString('pt-BR') : '[DATA DO EVENTO]';
  const horaEvento = clientData?.eventTime || clientData?.hora_evento || '[HORÁRIO]';
  const localEvento = clientData?.eventLocation || clientData?.local_evento || '[LOCAL DO EVENTO]';
  const valorTotalNum = clientData?.price ?? clientData?.valor_total;
  const valorSinalNum = clientData?.downPayment ?? clientData?.valor_sinal;
  const valorTotal = valorTotalNum ? `R$ ${Number(valorTotalNum).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ [VALOR TOTAL]';
  const valorSinal = valorSinalNum ? `R$ ${Number(valorSinalNum).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ [VALOR ENTRADA]';
  const valorRestante = (valorTotalNum && valorSinalNum) 
    ? `R$ ${(Number(valorTotalNum) - Number(valorSinalNum)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
    : 'R$ [VALOR RESTANTE]';

  // Dados da empresa/fotógrafo vindos das configurações
  const nomeEmpresa = empresaConfig?.nome_empresa || '[NOME DO FOTÓGRAFO]';
  const enderecoEmpresa = empresaConfig?.endereco || '[ENDEREÇO DO FOTÓGRAFO]';
  const cnpjEmpresa = empresaConfig?.cnpj || '[CPF/CNPJ DO FOTÓGRAFO]';
  const telefoneEmpresa = empresaConfig?.telefone || '[TELEFONE DO FOTÓGRAFO]';
  const cidadeEmpresa = empresaConfig?.cidade || '[CIDADE]';
  const estadoEmpresa = empresaConfig?.estado || '[ESTADO]';
  const emailEmpresa = empresaConfig?.email_empresa || '[EMAIL DO FOTÓGRAFO]';
  const whatsappEmpresa = empresaConfig?.whatsapp || telefoneEmpresa || '[WHATSAPP DO FOTÓGRAFO]';
  const cepEmpresa = empresaConfig?.cep || '[CEP]';

  // Função auxiliar para verificar se um valor é válido (não é placeholder)
  const isValidValue = (value: string) => {
    return value && !value.startsWith('[') && !value.endsWith(']');
  };

  // Construir informações do contratante dinamicamente
  let contratanteInfo = nomeCliente;
  
  // Adicionar endereço se disponível
  const enderecoCliente = clientData?.enderecoCliente || clientData?.endereco_cliente;
  if (isValidValue(enderecoCliente)) {
    contratanteInfo += `, residente na ${enderecoCliente}`;
  }
  
  // Adicionar CPF se disponível
  const cpfCliente = clientData?.cpfCliente || clientData?.cpf_cliente;
  if (isValidValue(cpfCliente)) {
    contratanteInfo += `, inscrito no CPF sob o nº ${cpfCliente}`;
  }
  
  // Adicionar email se disponível
  const emailCliente = clientData?.clientEmail || clientData?.email_cliente;
  if (isValidValue(emailCliente)) {
    contratanteInfo += `, email ${emailCliente}`;
  }
  
  // Adicionar telefone se disponível
  const telefoneCliente = clientData?.phoneNumber || clientData?.telefone_cliente;
  if (isValidValue(telefoneCliente)) {
    contratanteInfo += `, telefone ${formatPhone(telefoneCliente)}`;
  }

  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS 

Pelo presente instrumento particular de contrato, de um lado, ${contratanteInfo}, doravante denominada CONTRATANTE, e de outro lado, ${nomeEmpresa}, com endereço profissional na ${enderecoEmpresa}, inscrito no CPF/CNPJ sob o nº ${cnpjEmpresa}, celular ${formatPhone(telefoneEmpresa)}, doravante denominado CONTRATADO, têm entre si justo e contratado o que segue:

Cobertura fotográfica e serviços contratados

Cláusula 1. O CONTRATADO prestará ao CONTRATANTE o serviço de cobertura fotográfica do ${tipoEvento}, a ser realizado no dia ${dataEvento}, das ${horaEvento} até [HORÁRIO DE TÉRMINO].

Os serviços e produtos objetos deste contrato são:

• Making Off: Fotos no salão entre 1h e 1h30
• Fotógrafos: 2 profissionais
• Quantidade de fotos: Fotos ilimitadas no evento
• Cerimônia: ${localEvento}
• Salão de festas: ${localEvento}
• Álbum incluso: Álbum 30x25 com 25 lâminas
• Quadro incluso: 1 quadro 80x150cm com foto

A cobertura do evento inclui fotos ilimitadas durante o evento. O CONTRATADO permanecerá na cobertura do evento que normalmente leva cerca de 5 horas de evento. Caso seja necessário mais tempo, será cobrado R$ 250,00 por hora extra.

Exclusividade

Cláusula 2. O CONTRATADO e sua equipe serão os únicos fotógrafos presentes no evento. A cobertura fotográfica simultânea do evento por outro fotógrafo profissional (incluindo cobertura por sites da internet) implicará no cancelamento imediato do contrato e no término da cobertura fotográfica.

Pagamento

Cláusula 3. Os produtos e serviços deste contrato têm o valor de ${valorTotal}, pagos da seguinte forma:

1ª Entrada (30%) - ${valorSinal} no dia [DATA ENTRADA]
2ª Restante - ${valorRestante} até o dia ${dataEvento}

ENTREGA DO MATERIAL

Cláusula 4. O prazo para confecção será de 15 dias corridos, contados a partir da data da cerimônia do evento. A entrega será via Link Online com todas as fotos ajustadas à luz do ambiente.

PROPRIEDADE DE USO DE IMAGEM

Cláusula 5. O CONTRATANTE não se opõe quanto ao uso das imagens dos arquivos digitais pela CONTRATADO e sua equipe para uso exclusivamente comercial e promocional, sendo usado como material impresso (portfólio), ou, o uso em tablets como forma de divulgação para outros CONTRATANTES, uma vez que os mesmos fazem parte de seu acervo, não se cogitando, em nenhuma hipótese, a aplicabilidade da Lei 9.610 de 19/2/98 (Lei dos Direitos Autorais), como também, podendo ser usados inclusive em website, em mídias sociais para divulgação, amostras, exposições, concursos internos (nacionais) e externos (internacionais), anúncios e publicações.

INADIMPLÊNCIA

Cláusula 6. Em caso de falta de pagamento de parcelas restantes, como da própria inadimplência do CONTRATANTE, fica à CONTRATADO, desde já autorizada e com poderes outorgados pelo CONTRATANTE a emitir nota promissória e/ou título de crédito à vista contra o CONTRATANTE e, daí por diante, tomar todas as providências necessárias para recebimento do que lhe é devido.

LIMITE DE RESPONSABILIDADE

Cláusula 7. Todo esforço será feito para execução dos serviços e entrega dos produtos deste contrato. A responsabilidade do CONTRATADO é limitada ao valor pago pelo CONTRATANTE. Por se tratar de um evento não controlado, podendo, a qualquer momento, ocorrer atos naturais e humanos alheios à vontade das partes, não se pode garantir a entrega de qualquer imagem específica.

Cláusula 8. Em caso de não comparecimento de nenhum profissional no evento realizado pelo CONTRATANTE, o CONTRATADO deverá ressarcir ao CONTRATANTE, o valor que consta na cláusula 3 deste contrato.

Responsabilidade sobre os arquivos digitais

Cláusula 9. Fica de comum acordo entre as partes, que todo arquivo digital que o CONTRATADO julgar de boa qualidade, será disponibilizado ao CONTRATANTE através de um link, ou outra forma convencionadas entre as partes. Após a entrega, o CONTRATADO fica isento de qualquer responsabilidade sobre os arquivos contidos na mídia, e não guardarão cópias ou backups dos mesmos, sendo de responsabilidade exclusiva do CONTRATANTE as cópias e armazenamento do material.

Equipe Fotográfica

Cláusula 10. Em caso de problemas de ordem naturais ou humanos com um ou mais membros da equipe principal, a CONTRATADO reserva-se ao direito de enviar outro profissional qualificado de mesmo valor profissional/financeiro ou superior, ao evento para que o serviço contratado seja executado, sem nenhum custo adicional por parte do CONTRATANTE.

É de responsabilidade do CONTRATANTE possíveis danos causados por terceiros à integridade física e dos equipamentos do CONTRATADO e sua equipe durante o evento.

Alimentação e cuidados com a equipe

Cláusula 11. É de responsabilidade do CONTRATANTE, fornecer alimentação (a mesma oferecida aos convidados) e bebida (não alcoólica) a toda a equipe CONTRATADO durante o almoço ou jantar do evento no mesmo horário que os noivos, disponibilizando lugar, tempo e condições adequadas para que os mesmos possam dar continuidade ao trabalho.

Caso Fortuito e Força Maior

Cláusula 12. Os casos fortuitos e de força maior serão excludentes de responsabilidade na forma do Parágrafo Único do artigo 393 do Código Civil Brasileiro.

Cláusula 13. A Parte que for afetada por caso fortuito ou força maior deverá notificar a outra, de imediato, da extensão do fato e do prazo estipulado durante o qual estará inabilitada a cumprir ou pelo qual será obrigada a atrasar o cumprimento de suas obrigações decorrentes deste Contrato.

Cancelamentos ou rescisão

Cláusula 14. O presente ajuste é feito em caráter irrevogável e irretratável, ficando estabelecido que no caso do CONTRATANTE ou do CONTRATADO necessitar o cancelamento ou rescisão do presente por motivos alheios a sua vontade, incorrerá nas seguintes penalidades:

a. Multa de 5% (cinco por cento) sobre o valor do ajuste devidamente atualizado, se houver comunicado por escrito à CONTRATADO, com antecedência de 120 dias da data do evento.

b. Multa de 10% (dez por cento) sobre o valor do ajuste devidamente atualizado se houver comunicado à CONTRATADO, com antecedência inferior a 60 dias da data do evento.

Cláusula 15. O presente contrato rege-se pela Lei 8.078/90, aplicando-se subsidiariamente o artigo 920 do Código Civil Brasileiro, inclusive quanto as eventuais penas e danos de forma geral.

Cláusula 16. Fica eleito o foro da comarca de ${cidadeEmpresa}/${estadoEmpresa}, com exclusão de qualquer outro, por mais privilegiado que seja para dirimir eventuais dúvidas porventura oriundas deste contrato.

E por estarem justos e contratados, firmam o presente instrumento em duas vias de igual teor e forma.

______________________________________________________
${nomeCliente}
Contratante

______________________________________________________
${nomeEmpresa}
Contratado`;
};

// Função auxiliar para aplicar substituições dinâmicas no conteúdo personalizado
const applyDynamicReplacements = (content: string, clientData?: any, empresaConfig?: any): string => {
  if (!content) return '';
  
  // Dados do cliente
  const nomeCliente = clientData?.clientName || clientData?.nome_cliente || '[NOME DO CONTRATANTE]';
  const tipoEvento = clientData?.eventType || clientData?.tipo_evento || 'casamento';
  const dataEvento = clientData?.eventDate || clientData?.data_evento ? new Date(clientData.eventDate || clientData.data_evento).toLocaleDateString('pt-BR') : '[DATA DO EVENTO]';
  const horaEvento = clientData?.eventTime || clientData?.hora_evento || '[HORÁRIO]';
  const localEvento = clientData?.eventLocation || clientData?.local_evento || '[LOCAL DO EVENTO]';
  const valorTotalNum = clientData?.price ?? clientData?.valor_total;
  const valorSinalNum = clientData?.downPayment ?? clientData?.valor_sinal;
  const valorTotal = valorTotalNum ? `R$ ${Number(valorTotalNum).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ [VALOR TOTAL]';
  const valorSinal = valorSinalNum ? `R$ ${Number(valorSinalNum).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ [VALOR ENTRADA]';
  const valorRestante = (valorTotalNum && valorSinalNum) 
    ? `R$ ${(Number(valorTotalNum) - Number(valorSinalNum)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
    : 'R$ [VALOR RESTANTE]';

  // Dados da empresa/fotógrafo
  const nomeEmpresa = empresaConfig?.nome_empresa || '[NOME DO FOTÓGRAFO]';
  const enderecoEmpresa = empresaConfig?.endereco || '[ENDEREÇO DO FOTÓGRAFO]';
  const cnpjEmpresa = empresaConfig?.cnpj || '[CPF/CNPJ DO FOTÓGRAFO]';
  const telefoneEmpresa = empresaConfig?.telefone || '[TELEFONE DO FOTÓGRAFO]';
  const cidadeEmpresa = empresaConfig?.cidade || '[CIDADE]';
  const estadoEmpresa = empresaConfig?.estado || '[ESTADO]';
  const emailEmpresa = empresaConfig?.email_empresa || '[EMAIL DO FOTÓGRAFO]';
  
  // Dados adicionais do cliente
  const emailCliente = clientData?.clientEmail || clientData?.email_cliente || '[EMAIL DO CLIENTE]';
  const telefoneCliente = clientData?.phoneNumber || clientData?.telefone_cliente || '[TELEFONE DO CLIENTE]';
  const cpfCliente = clientData?.cpfCliente || clientData?.cpf_cliente || '[CPF DO CLIENTE]';
  const enderecoCliente = clientData?.enderecoCliente || clientData?.endereco_cliente || '[ENDEREÇO DO CLIENTE]';

  // Aplicar todas as substituições possíveis
  let processedContent = content
    // Dados do cliente
    .replace(/\[NOME DO CONTRATANTE\]/g, nomeCliente)
    .replace(/\[NOME DO CLIENTE\]/g, nomeCliente)
    .replace(/\[EMAIL DO CLIENTE\]/g, emailCliente)
    .replace(/\[TELEFONE DO CLIENTE\]/g, formatPhone(telefoneCliente))
    .replace(/\[CPF DO CLIENTE\]/g, cpfCliente)
    .replace(/\[ENDEREÇO DO CLIENTE\]/g, enderecoCliente)
    
    // Dados do evento
    .replace(/\[TIPO DE EVENTO\]/g, tipoEvento)
    .replace(/\[DATA DO EVENTO\]/g, dataEvento)
    .replace(/\[HORÁRIO\]/g, horaEvento)
    .replace(/\[LOCAL DO EVENTO\]/g, localEvento)
    
    // Valores financeiros
    .replace(/\[VALOR TOTAL\]/g, valorTotal)
    .replace(/\[VALOR ENTRADA\]/g, valorSinal)
    .replace(/\[VALOR RESTANTE\]/g, valorRestante)
    
    // Dados da empresa
    .replace(/\[NOME DO FOTÓGRAFO\]/g, nomeEmpresa)
    .replace(/\[NOME DA EMPRESA\]/g, nomeEmpresa)
    .replace(/\[ENDEREÇO DO FOTÓGRAFO\]/g, enderecoEmpresa)
    .replace(/\[CPF\/CNPJ DO FOTÓGRAFO\]/g, cnpjEmpresa)
    .replace(/\[TELEFONE DO FOTÓGRAFO\]/g, formatPhone(telefoneEmpresa))
    .replace(/\[CIDADE\]/g, cidadeEmpresa)
    .replace(/\[ESTADO\]/g, estadoEmpresa)
    .replace(/\[EMAIL DO FOTÓGRAFO\]/g, emailEmpresa);

  return processedContent;
};

// Template padrão estático (fallback)
const DEFAULT_CONTRACT_TEMPLATE = generateContractTemplate();

// Form schema
const formSchema = z.object({
  clientName: z.string().min(3, "Nome do cliente é obrigatório"),
  clientEmail: z.string().refine((email) => email === "" || z.string().email().safeParse(email).success, {
    message: "Email inválido"
  }).optional(),
  phoneNumber: z.string().min(8, "Telefone inválido"),
  cpfCliente: z.string().optional(),
  enderecoCliente: z.string().optional(),
  eventType: z.string().min(1, "Tipo de evento é obrigatório"),
  eventDate: z.date({
    required_error: "Data do evento é obrigatória",
  }),
  eventTime: z.string().min(1, "Horário do evento é obrigatório"),
  eventLocation: z.string().optional(),
  price: z.coerce.number().min(1, "Valor é obrigatório"),
  downPayment: z.coerce.number().optional(),
  termsAndConditions: z.string().min(10, "Termos e condições são obrigatórios"),
});

type FormValues = z.infer<typeof formSchema>;

interface ContractFormProps {
  initialData?: Partial<FormValues> & {
    eventoId?: string;
  };
  onSuccess?: () => void;
}

export const ContractForm = ({ initialData, onSuccess }: ContractFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { configuracoes: empresaConfig, carregando: empresaCarregando } = useEmpresa();
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceFormatted, setPriceFormatted] = useState('');
  const [downPaymentFormatted, setDownPaymentFormatted] = useState('');
  const [phoneFormatted, setPhoneFormatted] = useState('');
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [editableTermsContent, setEditableTermsContent] = useState('');
  // Estados relacionados ao template removidos
  
  // Função para gerar template atual com dados da empresa
  const getCurrentTemplate = () => {
    return generateContractTemplate(initialData, empresaConfig);
  };
  
  // Default form values with template text for T&C
  const defaultValues: Partial<FormValues> = {
    ...initialData,
    cpfCliente: initialData?.cpfCliente || '',
    enderecoCliente: initialData?.enderecoCliente || '',
    termsAndConditions: initialData?.termsAndConditions || getCurrentTemplate()
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  // ✅ Resetar formulário quando initialData ou configurações da empresa mudarem
  useEffect(() => {
    if (initialData) {
      // Corrigir nomes vindos do evento para camelCase esperado pelo formulário
      const updatedValues = {
        ...initialData,
        cpfCliente: initialData.cpfCliente || (initialData as any).cpf_cliente || '',
        enderecoCliente: initialData.enderecoCliente || (initialData as any).endereco_cliente || '',
        termsAndConditions: initialData?.termsAndConditions || getCurrentTemplate()
      };
      // Os dados já são processados dinamicamente na função generateContractTemplate
      form.reset(updatedValues);
      setPriceFormatted(initialData.price ? formatCurrency(initialData.price) : '');
      setDownPaymentFormatted(initialData.downPayment ? formatCurrency(initialData.downPayment) : '');
      if (initialData.phoneNumber) {
        const formatted = formatPhone(initialData.phoneNumber);
        setPhoneFormatted(formatted);
      } else {
        setPhoneFormatted('');
      }
    } else {
      form.reset({
        termsAndConditions: getCurrentTemplate()
      });
      setPriceFormatted('');
      setDownPaymentFormatted('');
      setPhoneFormatted('');
    }
  }, [initialData, empresaConfig, form]);
  
  // ✅ Atualizar template quando dados da empresa mudarem
  useEffect(() => {
    // Aguarda o carregamento das configurações da empresa
    if (empresaCarregando) return;
    
    const currentTerms = form.watch("termsAndConditions");
    
    // Se os termos atuais estão vazios, são o template padrão antigo, ou contêm placeholders não preenchidos
    if (!currentTerms || 
        currentTerms === DEFAULT_CONTRACT_TEMPLATE || 
        currentTerms.includes('[NOME DO FOTÓGRAFO]') || 
        currentTerms.includes('[ENDEREÇO DO FOTÓGRAFO]') ||
        currentTerms.includes('[CPF/CNPJ DO FOTÓGRAFO]')) {
      
      console.log('🔄 Atualizando template com dados da empresa:', empresaConfig);
      form.setValue("termsAndConditions", getCurrentTemplate());
    }
  }, [empresaConfig, empresaCarregando]);
  
  const formValues = form.watch();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments([...attachments, ...filesArray]);
    }
  };
  
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setAttachments([...attachments, ...filesArray]);
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleEditTerms = () => {
    const currentTerms = form.watch("termsAndConditions") || '';
    setEditableTermsContent(currentTerms);
    setIsEditingTerms(true);
  };

  const handleSaveTerms = () => {
    form.setValue("termsAndConditions", editableTermsContent);
    setIsEditingTerms(false);
  };

  const handleCancelEditTerms = () => {
    setIsEditingTerms(false);
    setEditableTermsContent('');
  };
  
  const onSubmit = async (data: FormValues) => {
    if (step === 'form') {
      setStep('preview');
    } else {
      // Validar se usuário está autenticado
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar um contrato.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      
      try {
        // Gerar ID único para o contrato
        const contractId = await generateUniqueContractId();
        
        // Preparar dados do contrato para o Supabase
        const contractData = {
          id_contrato: contractId,
          cliente_id: null, // Será implementado quando tivermos cliente específico
          titulo: `Contrato - ${data.eventType} - ${data.clientName}`,
          descricao: `Contrato para ${data.eventType} em ${data.eventLocation || 'Local a definir'}`,
          nome_cliente: data.clientName, // Agora incluindo o nome do cliente
          email_cliente: data.clientEmail || '',
          telefone_cliente: data.phoneNumber,
          cpf_cliente: data.cpfCliente || '', // Mantendo formatação do CPF com pontos e hífens
          endereco_cliente: data.enderecoCliente || '', // Adicionando endereço do cliente
          tipo_evento: data.eventType,
          data_evento: data.eventDate.toISOString(),
          hora_evento: data.eventTime,
          local_evento: data.eventLocation || '',
          valor_total: data.price,
          valor_sinal: data.downPayment || 0,
          conteudo: data.termsAndConditions,
          observacoes: '',
          evento_id: initialData?.eventoId || null,
        };
        
        // Dados preparados para criação do contrato

        // Criar contrato no Supabase
        const novoContrato = await createContract(contractData, user);

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error('Erro ao criar contrato:', error);
        toast({
          title: "Erro ao criar contrato",
          description: "Não foi possível criar o contrato. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Funções relacionadas ao template removidas
  
  return (
    <div className="py-4">
      {empresaCarregando ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span>Carregando configurações da empresa...</span>
          </div>
        </div>
      ) : (
        <>
          {step === 'form' ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                placeholder="Digite o nome completo"
                {...form.register("clientName")}
              />
              {form.formState.errors.clientName && (
                <p className="text-sm text-destructive">{form.formState.errors.clientName.message}</p>
              )}
            </div>
            
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email do Cliente (opcional)</Label>
            <Input
              id="clientEmail"
              placeholder="email@exemplo.com (opcional)"
              type="email"
              {...form.register("clientEmail")}
            />
            {form.formState.errors.clientEmail && (
              <p className="text-sm text-destructive">{form.formState.errors.clientEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Telefone</Label>
            <Input
              id="phoneNumber"
              placeholder="(00)0 0000-0000"
              value={phoneFormatted}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                setPhoneFormatted(formatted);
                form.setValue("phoneNumber", formatted);
              }}
            />
            {form.formState.errors.phoneNumber && (
              <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpfCliente">CPF do Cliente (opcional)</Label>
            <Input
              id="cpfCliente"
              placeholder="000.000.000-00"
              {...form.register("cpfCliente")}
            />
            {form.formState.errors.cpfCliente && (
              <p className="text-sm text-destructive">{form.formState.errors.cpfCliente.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="enderecoCliente">Endereço do Cliente (opcional)</Label>
            <Input
              id="enderecoCliente"
              placeholder="Digite o endereço completo"
              {...form.register("enderecoCliente")}
            />
            {form.formState.errors.enderecoCliente && (
              <p className="text-sm text-destructive">{form.formState.errors.enderecoCliente.message}</p>
            )}
          </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventType">Tipo de Evento</Label>
              <Select 
                onValueChange={(value) => form.setValue("eventType", value)} 
                value={form.watch("eventType")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.eventType && (
                <p className="text-sm text-destructive">{form.formState.errors.eventType.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Data e Horário do Evento</Label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-9">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.watch("eventDate") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("eventDate") ? (
                          format(form.watch("eventDate"), "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.watch("eventDate")}
                        onSelect={(date) => date && form.setValue("eventDate", date)}
                        initialFocus
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.eventDate && (
                    <p className="text-sm text-destructive mt-2">{form.formState.errors.eventDate.message}</p>
                  )}
                </div>

                <div className="col-span-3">
                  <Input
                    type="time"
                    {...form.register("eventTime")}
                    className="w-full"
                  />
                  {form.formState.errors.eventTime && (
                    <p className="text-sm text-destructive mt-2">{form.formState.errors.eventTime.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventLocation">Local do Evento</Label>
              <Input
                id="eventLocation"
                placeholder="Digite o endereço do evento"
                {...form.register("eventLocation")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Valor Total (R$)</Label>
              <Input
                id="price"
                type="text"
                placeholder="0,00"
                value={priceFormatted}
                onChange={(e) => {
                  const formatted = formatCurrency(e.target.value);
                  const numericValue = parseCurrency(formatted);
                  setPriceFormatted(formatted);
                  form.setValue("price", numericValue);
                }}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="downPayment">Valor do Sinal (R$)</Label>
              <Input
                id="downPayment"
                type="text"
                placeholder="0,00"
                value={downPaymentFormatted}
                onChange={(e) => {
                  const formatted = formatCurrency(e.target.value);
                  const numericValue = parseCurrency(formatted);
                  setDownPaymentFormatted(formatted);
                  form.setValue("downPayment", numericValue);
                }}
              />
            </div>
          </div>
          
          {/* ContractTemplateSelector removido conforme solicitado */}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="termsAndConditions">Termos e Condições</Label>
              <div className="flex gap-2">
                {!isEditingTerms ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEditTerms}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEditTerms}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleSaveTerms}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Salvar
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {isEditingTerms ? (
              <Textarea
                value={editableTermsContent}
                onChange={(e) => setEditableTermsContent(e.target.value)}
                rows={20}
                className="text-sm font-mono resize-none"
                placeholder="Digite os termos e condições do contrato..."
              />
            ) : (
              <div 
                className="whitespace-pre-wrap text-sm border p-4 rounded-md max-h-[500px] overflow-y-auto bg-muted/20" 
                style={{ 
                  whiteSpace: 'pre-wrap', 
                  wordWrap: 'break-word', 
                  lineHeight: '1.6',
                  fontFamily: 'inherit',
                  overflowWrap: 'break-word'
                }}
              >
              <style dangerouslySetInnerHTML={{
                __html: `
                  .contract-content {
                    white-space: pre-wrap;
                    line-height: 1.6;
                  }
                  /* Centralizar título do contrato */
                  .contract-title {
                    text-align: center !important;
                    font-weight: bold;
                    margin: 1rem 0;
                    display: block;
                  }
                  .contract-signatures {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center !important;
                    margin: 3rem auto 0 auto; /* Reduzida a margem inferior para 0 */
                    padding: 2rem 0 0 0; /* Removido o padding inferior */
                    width: 100%;
                    max-width: 600px;
                  }
                  .signature-block {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin: 2.5rem 0; /* Aumentado de 1.5rem para 2.5rem para mais espaço */
                    width: 100%;
                  }
                  .signature-line {
                    border-bottom: 1px solid #9CA3AF;
                    width: 350px;
                    margin: 0 auto 0.5rem auto;
                    height: 1px;
                  }
                  .signature-name {
                    font-weight: 500;
                    margin: 0.5rem 0 0.25rem 0;
                    text-align: center;
                  }
                  .signature-role {
                    font-size: 0.875rem;
                    color: #6B7280;
                    margin: 0;
                    text-align: center;
                  }
                `
              }} />
              
              {(() => {
                const termsAndConditions = form.watch("termsAndConditions") || '';
                
                // Regex para capturar as assinaturas (últimas 6 linhas do padrão)
                const signatureRegex = /\n\n______________________________________________________\n([^\n]+)\n([^\n]+)\n\n______________________________________________________\n([^\n]+)\n([^\n]+)$/;
                const match = termsAndConditions.match(signatureRegex);
                
                if (match) {
                  // Separar o conteúdo principal das assinaturas
                  const mainContent = termsAndConditions.replace(signatureRegex, '');
                  const [, clientName, clientRole, photographerName, photographerRole] = match;
                  
                  return (
                    <>
                      <Textarea
                        id="termsAndConditions"
                        rows={10}
                        className="border-0 bg-transparent resize-none focus:ring-0 focus:outline-none w-full contract-content"
                        {...form.register("termsAndConditions")}
                        style={{ display: 'none' }}
                      />
                      
                      <div 
                        className="contract-content"
                        style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                        dangerouslySetInnerHTML={{
                          __html: mainContent.replace(
                            /CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS/g,
                            '<div class="contract-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS</div>'
                          )
                        }}
                      />
                      
                      <div className="contract-signatures">
                        <div className="signature-block">
                          <div className="signature-line"></div>
                          <div className="signature-name">{clientName}</div>
                          <div className="signature-role">{clientRole}</div>
                        </div>
                        
                        <div className="signature-block">
                          <div className="signature-line"></div>
                          <div className="signature-name">{photographerName}</div>
                          <div className="signature-role">{photographerRole}</div>
                        </div>
                      </div>
                    </>
                  );
                } else {
                  // Fallback se não encontrar o padrão de assinaturas
                  return (
                    <>
                      <Textarea
                        id="termsAndConditions"
                        rows={10}
                        className="border-0 bg-transparent resize-none focus:ring-0 focus:outline-none w-full contract-content"
                        {...form.register("termsAndConditions")}
                        style={{ display: 'none' }}
                      />
                      <div 
                        className="contract-content"
                        style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                        dangerouslySetInnerHTML={{
                          __html: termsAndConditions.replace(
                            /CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS/g,
                            '<div class="contract-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS</div>'
                          )
                        }}
                      />
                    </>
                  );
                }
              })()} 
              </div>
            )}
            {form.formState.errors.termsAndConditions && (
              <p className="text-sm text-destructive">{form.formState.errors.termsAndConditions.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Anexos (opcional)</Label>
            <div 
              className={`border-2 border-dashed rounded-md p-6 text-center ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
            >
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Arraste e solte arquivos aqui ou
                </p>
                <Label 
                  htmlFor="file-upload" 
                  className="inline-flex items-center gap-1 cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-md text-sm"
                >
                  <span>Escolher arquivos</span>
                  <Input 
                    id="file-upload" 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.xls,.txt"
                  />
                </Label>
                <p className="text-xs text-muted-foreground">
                  PDF, Word, Excel, imagens (máx. 5MB por arquivo)
                </p>
              </div>
            </div>
            
            {attachments.length > 0 && (
              <div className="border rounded-md p-3 mt-2">
                <p className="text-sm font-medium mb-2">Arquivos anexados:</p>
                <ul className="space-y-2">
                  {attachments.map((file, index) => (
                    <li key={index} className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded">
                      <div className="flex items-center gap-2 truncate">
                        <div className="flex-shrink-0">
                          {file.type.includes('pdf') ? (
                            <File className="h-4 w-4 text-red-500" />
                          ) : file.type.includes('image') ? (
                            <FileImage className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-700" />
                          )}
                        </div>
                        <span className="truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeAttachment(index)}
                        className="h-6 w-6 p-0 rounded-full"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
            <Info size={16} />
            <p>Revise o contrato antes de enviar. O cliente receberá um link para visualizar e assinar.</p>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit">
              Visualizar Contrato
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <ContractPreview 
            contractData={formValues} 
          />
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep('form')}
            >
              Voltar e Editar
            </Button>
            <Button 
              type="button" 
              onClick={() => form.handleSubmit(onSubmit)()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando Contrato..." : "Criar Contrato"}
            </Button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
