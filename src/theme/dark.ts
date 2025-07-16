import { createTheme } from '@mui/material/styles';

import { baseTheme } from './base';

export const darkTheme = createTheme({
  ...baseTheme,
  components: {
    ...baseTheme.components,
    MuiCssBaseline: {
      styleOverrides: {
        ...baseTheme.components.MuiCssBaseline.styleOverrides,
        body: {
          ...baseTheme.components.MuiCssBaseline.styleOverrides.body,
          color: '#ffffff',
        },
      },
    },
  },
  palette: {
    custom: {
      backgroundLightGrey: '#2E2E2E', // A dark grey suitable for dark mode
    },
    mode: 'dark',
    primary: {
      main: 'rgb(18, 87, 64)', // ny jet green #125740
    },
  },
});
