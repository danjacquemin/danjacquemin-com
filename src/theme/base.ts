export const baseTheme = {
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          lineHeight: 1.2,
          textWrap: 'balance',
        },
        a: {
          color: 'inherit',
          textUnderlineOffset: '6px',
        },
        'a.nav-link': {
          '&:hover': {
            textDecoration: 'underline',
          },
          color: 'inherit',
          textDecoration: 'none',
        },
        body: {
          minHeight: 'calc(100vh + 1px)',
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
          p: 'p',
          subtitle1: 'span',
          subtitle2: 'span',
        },
      },
    },
  },
  transitions: {
    duration: {
      complex: 250,
      enteringScreen: 150,
      leavingScreen: 100,
      short: 200,
      shorter: 150,
      shortest: 100,
      standard: 200, // default is 300
    },
  },
  typography: {
    fontFamily: '"Raleway", sans-serif',
    fontFamilyMonospace: '"Inconsolata", monospace',
    fontSize: 16, // base font size to 1rem (16px vs MUI's [stupid] 14px)
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontStyle: 'italic',
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
    htmlFontSize: 16, // force 1rem = 16px for consistency (mui default is 14px)
    p: {},
  },
};
