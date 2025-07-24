
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface IntegrationItemProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive: boolean;
  isConnected?: boolean;
  isLoading?: boolean;
  onToggle: () => void;
  errorMessage?: string;
  showSeparator?: boolean;
}

const IntegrationItem: React.FC<IntegrationItemProps> = ({
  id,
  icon,
  title,
  description,
  isActive,
  isConnected = false,
  isLoading = false,
  onToggle,
  errorMessage,
  showSeparator = true
}) => {
  return (
    <div className={`flex items-start justify-between space-x-4 ${showSeparator ? 'border-t' : ''} border-gray-700 py-4`}>
      <div className="flex items-start space-x-3">
        <div className="mt-1 bg-blue-900/50 dark:bg-blue-800/50 rounded-md p-2">
          {icon}
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="text-base font-medium text-white">{title}</h3>
            {isActive && <Badge className="ml-2 bg-green-500/90">Ativo</Badge>}
          </div>
          <p className="mt-1 text-sm text-gray-300">{description}</p>
          {errorMessage && (
            <p className="mt-1 text-sm text-red-400">{errorMessage}</p>
          )}
        </div>
      </div>
      <div>
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
        ) : (
          <Switch 
            checked={isActive} 
            onCheckedChange={onToggle} 
            disabled={isLoading}
            className="data-[state=checked]:bg-blue-500"
          />
        )}
      </div>
    </div>
  );
};

export default IntegrationItem;
