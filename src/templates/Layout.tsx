import { Box } from '@mui/material';

import PageFooter from '../components/PageFooter';
import PageHeader from '../components/PageHeader';
import ThemeSwitcher from '../components/ThemeSwitcher';

import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

function Layout({ children, isDarkMode, toggleTheme }: LayoutProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: '64px 1fr auto',
        minHeight: '100vh',
      }}
    >
      <PageHeader />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1, // takes up remaining space
        }}
      >
        {children}
      </Box>
      <PageFooter />
      <ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
    </Box>
  );
}

export default Layout;
