
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ProfileAvatar from './user-profile/ProfileAvatar';
import ProfileInfo from './user-profile/ProfileInfo';

interface UserProfileProps {
  isOpen: boolean;
  profileImage: string;
  userData: {
    name: string;
    profession: string;
  };
  closeMobileSidebar: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  isOpen, 
  profileImage, 
  userData, 
  closeMobileSidebar 
}) => {
  const navigate = useNavigate();
  
  const handleEditProfile = () => {
    navigate('/configuracoes');
    closeMobileSidebar();
  };

  return (
    <div className={cn(
      "px-2 py-3 flex border-b border-[#1F2937]",
      isOpen ? "flex-col items-center" : "flex-col items-center"
    )}>
      <ProfileAvatar 
        profileImage={profileImage} 
        name={userData?.name || 'Usuário'} 
      />
      
      {isOpen && (
        <ProfileInfo 
          name={userData?.name} 
          profession={userData?.profession} 
        />
      )}
    </div>
  );
};

export default UserProfile;
