import { useState } from 'react';
import { ContactFormData } from '@/types/contact';

const INITIAL_FORM_DATA: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
};

export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulação de envio - aqui você integraria com seu serviço de email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      resetForm();
    } catch (error) {
      setSubmitMessage('Erro ao enviar mensagem. Tente novamente ou entre em contato diretamente.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

  return {
    formData,
    isSubmitting,
    submitMessage,
    handleInputChange,
    handleSubmit,
    resetForm
  };
}; 