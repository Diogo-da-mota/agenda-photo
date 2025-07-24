
import React, { useState } from 'react';
import { Building, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CompanyLogoProps {
  companyLogo: string | null;
  setCompanyLogo: (logo: string | null) => void;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ companyLogo, setCompanyLogo }) => {
  const { toast } = useToast();

  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCompanyLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
      toast({
        title: "Logo da empresa atualizado",
        description: "O logo da sua empresa foi alterado com sucesso.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-24 w-24 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border">
        {companyLogo ? (
          <img src={companyLogo} alt="Logo da empresa" className="w-full h-full object-contain" />
        ) : (
          <Building size={40} className="text-gray-400" />
        )}
      </div>
      <div className="flex flex-col items-center">
        <Button variant="outline" size="sm" className="relative overflow-hidden">
          <Upload size={14} className="mr-2" />
          Upload do logo
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={handleCompanyLogoChange}
            accept="image/*"
          />
        </Button>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou GIF, máx. 1MB</p>
      </div>
    </div>
  );
};

export default CompanyLogo;
