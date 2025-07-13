import { protectedRoutes } from './protected';
import { publicRoutes } from './public';
import Layout from '../templates/Layout';

import type { RouteObject } from 'react-router-dom';

interface AppRoutesProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

/**
 * Defines app routes for createBrowserRouter
 */
export function appRoutes({
  isDarkMode,
  toggleTheme,
}: AppRoutesProps): RouteObject[] {
  return [
    {
      children: [...publicRoutes, ...protectedRoutes],
      element: <Layout toggleTheme={toggleTheme} isDarkMode={isDarkMode} />,
    },
  ];
}
