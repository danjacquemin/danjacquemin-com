export const baseTheme = {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          lineHeight: 1.2,
          textWrap: 'balance',
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          body1: 'span',
          body2: 'span',
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          h4: 'h4',
          h5: 'h5',
          h6: 'h6',
          subtitle1: 'span',
          subtitle2: 'span',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Raleway", sans-serif',
    fontFamilyMonospace: '"Inconsolata", monospace',
    fontSize: 16, // Sets base font size to 1rem (16px)
    h1: {
      fontFamily: '"Playfair Display", serif',
      LineHeight: 1.2,
      marginBottom: '1rem',
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '1.5rem',
      lineHeight: 1.1,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '1.25rem',
      lineHeight: 1.1,
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '1rem',
      lineHeight: 1.1,
    },
    htmlFontSize: 16, // Ensures 1rem = 16px for consistency
  },
};
