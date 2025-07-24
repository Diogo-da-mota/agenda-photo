
import { useState, useEffect } from 'react';

export const useSidebarState = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("https://github.com/shadcn.png");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    name: "Administrador",
    profession: "Fotógrafo"
  });

  // Usar logo estático já que não temos mais integração com user_integrations
  useEffect(() => {
    // Placeholder logo ou ícone estático
    setCompanyLogo("/placeholder-logo.png");
  }, []);

  return {
    isMobileOpen,
    setIsMobileOpen,
    profileImage,
    setProfileImage,
    companyLogo,
    userData,
    setUserData
  };
};
