import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

interface NotificationSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const NotificationSearch: React.FC<NotificationSearchProps> = ({ 
  onSearchChange 
}) => {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    // A função onSearchChange só será chamada quando o valor debotado mudar,
    // evitando requisições a cada tecla digitada.
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        type="text"
        placeholder="Buscar nas notificações..."
        className="pl-9"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </div>
  );
};

export default NotificationSearch;
