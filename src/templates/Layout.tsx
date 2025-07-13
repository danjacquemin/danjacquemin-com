import { Box } from '@mui/material';

import { Outlet } from 'react-router-dom';

import PageFooter from '../components/PageFooter';
import PageHeader from '../components/PageHeader';
import ThemeSwitcher from '../components/ThemeSwitcher';

type LayoutProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

/**
 * Layout component for app with header, footer, and theme switcher
 */
function Layout({ isDarkMode, toggleTheme }: LayoutProps) {
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
        <Outlet />
      </Box>
      <PageFooter />
      <ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
    </Box>
  );
}

export default Layout;
