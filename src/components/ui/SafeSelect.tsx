import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from '@/components/ui/select';

interface SafeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
}

const SafeSelect: React.FC<SafeSelectProps> = ({
  value,
  onValueChange,
  placeholder,
  options,
  disabled,
  className,
}) => {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SafeSelect;