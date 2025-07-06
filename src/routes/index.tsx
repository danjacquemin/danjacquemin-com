import { Routes } from 'react-router-dom';

import { protectedRoutes } from './protected';
import { publicRoutes } from './public';
import Layout from '../templates/Layout';

interface AppRoutesProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export default function AppRoutes({ isDarkMode, toggleTheme }: AppRoutesProps) {
  return (
    <Layout toggleTheme={toggleTheme} isDarkMode={isDarkMode}>
      <Routes>
        {publicRoutes}
        {protectedRoutes}
      </Routes>
    </Layout>
  );
}
