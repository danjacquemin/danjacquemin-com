import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom?: {
      backgroundLightGrey?: string;
    };
  }

  interface PaletteOptions {
    custom?: {
      backgroundLightGrey?: string;
    };
  }
}
