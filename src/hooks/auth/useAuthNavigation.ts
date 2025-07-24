import { useState } from 'react';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';

export const useAuthNavigation = () => {
  const [navigationAvailable, setNavigationAvailable] = useState(false);
  
  let navigate: NavigateFunction | null = null;
  let currentLocation = '';
  
  try {
    navigate = useNavigate();
    const location = useLocation();
    currentLocation = location.pathname;
    
    if (!navigationAvailable) {
      setNavigationAvailable(true);
    }
  } catch (error) {
    if (navigationAvailable) {
      setNavigationAvailable(false);
    }
  }

  return { navigate, currentLocation, navigationAvailable };
};