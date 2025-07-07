import { createTheme } from '@mui/material/styles';

import { baseTheme } from './base';

export const lightTheme = createTheme({
  ...baseTheme,
  components: {
    ...baseTheme.components,
    MuiCssBaseline: {
      styleOverrides: {
        ...baseTheme.components.MuiCssBaseline.styleOverrides,
        body: {
          ...baseTheme.components.MuiCssBaseline.styleOverrides.body,
          color: '#151515',
        },
      },
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(18, 87, 64)', // ny jet green #125740
    },
  },
});
