import { Box, Container } from '@mui/material';

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
        gridTemplateRows: '40px 1fr auto',
        minHeight: '100vh',
      }}
    >
      <PageHeader />
      <Container
        maxWidth="xl"
        disableGutters
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1, // takes up remaining space
          p: 1,
        }}
      >
        {children}
      </Container>
      <PageFooter />
      <ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
    </Box>
  );
}

export default Layout;
