import { useNavigate, useLocation } from 'react-router-dom';

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return {
    navigate,
    currentLocation: location.pathname,
    navigationAvailable: true,
  };
};