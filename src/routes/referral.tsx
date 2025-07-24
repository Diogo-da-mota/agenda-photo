import { createBrowserRouter } from 'react-router-dom';
import ReferralPage from '@/pages/r/[code]';

export const referralRouter = createBrowserRouter([
  {
    path: '/r/:code',
    element: <ReferralPage />
  }
]); 