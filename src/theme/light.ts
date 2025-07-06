import { createTheme } from '@mui/material/styles';

import { baseTheme } from './base';

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(18, 87, 64)', // ny jet green #125740
    },
  },
});
