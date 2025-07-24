
import React from 'react';

interface ProfileInfoProps {
  name: string;
  profession: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ name, profession }) => {
  return (
    <div className="mt-2 text-center">
      <p className="text-sm font-medium text-white">{name}</p>
      <p className="text-xs text-gray-300">{profession}</p>
    </div>
  );
};

export default ProfileInfo;
