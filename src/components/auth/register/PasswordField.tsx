import React from 'react';
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  toggleVisibility: () => void;
  required?: boolean;
  disabled?: boolean;
}

const PasswordField = ({ 
  id, 
  label, 
  placeholder, 
  value, 
  onChange, 
  showPassword,
  toggleVisibility,
  required,
  disabled = false
}: PasswordFieldProps) => {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          id={id} 
          type={showPassword ? "text" : "password"}
          placeholder={placeholder} 
          className="pl-10 pr-10 h-9 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
        />
        <button 
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          onClick={toggleVisibility}
          disabled={disabled}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;
