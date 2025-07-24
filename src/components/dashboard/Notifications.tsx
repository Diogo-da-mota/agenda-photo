import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const [unreadNotifications] = useState(3);
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/atividades-notificacoes');
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="relative"
    >
      <Bell className="h-5 w-5" />
      {unreadNotifications > 0 ? (
        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
          {unreadNotifications > 9 ? '9+' : unreadNotifications}
        </span>
      ) : null}
    </Button>
  );
};

export default Notifications;
