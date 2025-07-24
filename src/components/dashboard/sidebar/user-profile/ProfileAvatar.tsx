
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  profileImage: string;
  name: string;
  className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  profileImage, 
  name,
  className 
}) => {
  return (
    <Avatar className={cn(
      "h-16 w-16 ring-2 ring-[#E53935] border-2 border-transparent",
      className
    )}>
      <AvatarImage 
        src={profileImage} 
        alt={name || 'Usuário'} 
        className="object-cover" 
      />
      <AvatarFallback className="bg-gradient-to-br from-[#E53935] to-[#C62828]">
        {name?.charAt(0) || 'U'}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
