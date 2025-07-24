
import React from 'react';
import { Building, MapPin, Phone, Mail, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompanyData } from './types';

interface CompanyFormProps {
  companyData: CompanyData;
  handleCompanyDataChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openWhatsApp: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ 
  companyData, 
  handleCompanyDataChange,
  openWhatsApp
}) => {
  return (
    <div className="flex-1 grid gap-4 w-full">
      <div className="grid gap-2">
        <Label htmlFor="company-name">Nome da Empresa</Label>
        <div className="relative">
          <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            id="company-name" 
            name="name" 
            placeholder="Nome da sua empresa" 
            className="pl-9" 
            value={companyData.name}
            onChange={handleCompanyDataChange}
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="address">Endereço</Label>
        <div className="relative">
          <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            id="address" 
            name="address" 
            placeholder="Endereço completo" 
            className="pl-9" 
            value={companyData.address}
            onChange={handleCompanyDataChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">Cidade</Label>
          <Input 
            id="city" 
            name="city" 
            placeholder="Cidade" 
            value={companyData.city}
            onChange={handleCompanyDataChange}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="state">Estado</Label>
          <Input 
            id="state" 
            name="state" 
            placeholder="Estado" 
            value={companyData.state}
            onChange={handleCompanyDataChange}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="zip">CEP</Label>
          <Input 
            id="zip" 
            name="zip" 
            placeholder="00000-000" 
            value={companyData.zip}
            onChange={handleCompanyDataChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="company-phone">Telefone Comercial</Label>
          <div className="relative">
            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              id="company-phone" 
              name="phone" 
              placeholder="(00) 0000-0000" 
              className="pl-9" 
              value={companyData.phone}
              onChange={handleCompanyDataChange}
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="company-email">E-mail Comercial</Label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              id="company-email" 
              name="email" 
              placeholder="contato@suaempresa.com" 
              className="pl-9" 
              value={companyData.email}
              onChange={handleCompanyDataChange}
            />
          </div>
        </div>
      </div>
      
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="company-whatsapp">WhatsApp para Integrações</Label>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Novo
          </Badge>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MessageSquare className="absolute left-2.5 top-2.5 h-4 w-4 text-green-600" />
            <Input 
              id="company-whatsapp" 
              name="whatsapp" 
              placeholder="(00) 00000-0000" 
              className="pl-9" 
              value={companyData.whatsapp}
              onChange={handleCompanyDataChange}
            />
          </div>
          <Button 
            variant="outline" 
            className="bg-green-500 hover:bg-green-600 text-white" 
            onClick={openWhatsApp}
            title="Testar WhatsApp"
          >
            <MessageSquare size={18} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Este número será usado para integrações com WhatsApp e envio de mensagens para clientes.
        </p>
      </div>
    </div>
  );
};

export default CompanyForm;
