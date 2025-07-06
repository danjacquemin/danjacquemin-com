import { CssBaseline } from '@mui/material';
import { useState } from 'react';

import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from '@mui/material/styles';

import AppRoutes from './routes';
import { darkTheme, lightTheme } from './theme';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      return !prev;
    });
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
