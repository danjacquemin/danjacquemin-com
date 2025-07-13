import { CssBaseline } from '@mui/material';
import { useState } from 'react';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ThemeProvider } from '@mui/material/styles';

import { appRoutes } from './routes';
import { darkTheme, lightTheme } from './theme';

/**
 * Main app with routing and theming
 */
function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const router = createBrowserRouter(appRoutes({ isDarkMode, toggleTheme }));

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
export default App;
