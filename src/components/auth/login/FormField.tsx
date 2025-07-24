
import React from 'react';
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  required?: boolean;
}

const FormField = ({ 
  id, 
  label, 
  type, 
  placeholder, 
  value, 
  onChange, 
  icon,
  required 
}: FormFieldProps) => {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <Input 
          id={id} 
          type={type} 
          placeholder={placeholder} 
          className="pl-10 h-9 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      </div>
    </div>
  );
};

export default FormField;
