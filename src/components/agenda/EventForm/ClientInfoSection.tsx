import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { eventTypes } from '@/components/agenda/types';
import { aplicarMascaraData, converterDataBrasileira } from '@/utils/formatters';

interface ClientInfoSectionProps {
  clientName: string;
  setClientName: (value: string) => void;
  phone: string;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  birthdayText: string;
  setBirthdayText: (value: string) => void;
  setBirthday: (date: Date | null) => void;
  eventType: string;
  setEventType: (value: string) => void;
  cpfCliente: string;
  setCpfCliente: (value: string) => void;
  enderecoCliente: string;
  setEnderecoCliente: (value: string) => void;
}

export const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
  clientName,
  setClientName,
  phone,
  handlePhoneChange,
  birthdayText,
  setBirthdayText,
  setBirthday,
  eventType,
  setEventType,
  cpfCliente,
  setCpfCliente,
  enderecoCliente,
  setEnderecoCliente
}) => {
  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = e.target.value;
    const dataFormatada = aplicarMascaraData(valorDigitado);
    
    // Atualiza o texto digitado
    setBirthdayText(dataFormatada);
    
    // Converte para objeto Date apenas se tiver o formato completo DD/MM/YYYY
    if (dataFormatada.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const dataConvertida = converterDataBrasileira(dataFormatada);
      setBirthday(dataConvertida);
    } else if (!dataFormatada) {
      setBirthday(null);
    }
  };

  const formatCPF = (cpf: string) => {
    const somenteNumeros = cpf.replace(/\D/g, '');
    if (somenteNumeros.length <= 3) return somenteNumeros;
    if (somenteNumeros.length <= 6) return `${somenteNumeros.slice(0, 3)}.${somenteNumeros.slice(3)}`;
    if (somenteNumeros.length <= 9) return `${somenteNumeros.slice(0, 3)}.${somenteNumeros.slice(3, 6)}.${somenteNumeros.slice(6)}`;
    return `${somenteNumeros.slice(0, 3)}.${somenteNumeros.slice(3, 6)}.${somenteNumeros.slice(6, 9)}-${somenteNumeros.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatCPF(e.target.value);
    setCpfCliente(valorFormatado);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome do Cliente</label>
          <Input 
            value={clientName} 
            onChange={(e) => setClientName(e.target.value)} 
            required 
            placeholder="Digite o nome completo"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Telefone</label>
          <div className="flex gap-2">
            <Input 
              value={phone} 
              onChange={handlePhoneChange} 
              required 
              className="flex-1"
              placeholder="(00) 0 0000-0000"
              maxLength={17}
            />
            <a 
              href={`https://wa.me/55${phone.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
              title="Contatar via WhatsApp"
            >
              <MessageSquare size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Data de Nascimento</label>
          <Input 
            value={birthdayText} 
            onChange={handleBirthdayChange} 
            placeholder="DD/MM/AAAA"
            maxLength={10}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Evento</label>
          <Select 
            value={eventType}
            onValueChange={setEventType}
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">CPF do Cliente</label>
          <Input 
            value={cpfCliente} 
            onChange={handleCPFChange} 
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Endereço do Cliente</label>
          <Input 
            value={enderecoCliente} 
            onChange={(e) => setEnderecoCliente(e.target.value)} 
            placeholder="Digite o endereço completo"
          />
        </div>
      </div>
    </>
  );
}; 