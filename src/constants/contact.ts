import { Mail, Phone, Clock } from 'lucide-react';
import { ContactInfo, FAQItem } from '@/types/contact';

export const CONTACT_INFO: ContactInfo[] = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Envie sua mensagem para:',
    value: 'contato@agendapro.com.br',
    href: 'mailto:contato@agendapro.com.br',
    bgColor: 'from-blue-500 to-blue-600'
  },
  {
    icon: Phone,
    title: 'WhatsApp',
    description: 'Fale conosco via WhatsApp:',
    value: '(11) 99999-9999',
    href: 'https://wa.me/5511999999999',
    bgColor: 'from-green-500 to-green-600'
  },
  {
    icon: Clock,
    title: 'Horário de Atendimento',
    description: '',
    value: 'Segunda a Sexta: 9h às 18h\nSábado: 9h às 14h\nDomingo: Fechado',
    bgColor: 'from-purple-500 to-purple-600'
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Como funciona o teste gratuito?',
    answer: 'Oferecemos 30 dias de teste gratuito com acesso completo a todas as funcionalidades. Não cobramos cartão de crédito e você pode cancelar a qualquer momento.'
  },
  {
    question: 'Posso migrar meus dados?',
    answer: 'Sim! Nossa equipe te ajuda gratuitamente na migração dos seus dados de clientes, agenda e histórico financeiro de outras plataformas.'
  },
  {
    question: 'Oferecem treinamento?',
    answer: 'Sim! Todos os clientes recebem treinamento gratuito via vídeo call para aprender a usar todas as funcionalidades da plataforma.'
  },
  {
    question: 'Como funciona o suporte?',
    answer: 'Oferecemos suporte via WhatsApp, email e chat dentro da plataforma. Nosso time responde em até 2 horas no horário comercial.'
  }
]; 