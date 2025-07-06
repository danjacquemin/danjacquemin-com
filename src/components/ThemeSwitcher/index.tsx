import { Brightness4, Brightness7 } from '@mui/icons-material';
import { Paper, Tooltip, IconButton } from '@mui/material';

interface ThemeSwitcherProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

function ThemeSwitcher({ isDarkMode, toggleTheme }: ThemeSwitcherProps) {
  return (
    <Paper
      id="theme-switcher"
      elevation={6}
      sx={{
        borderRadius: '50%',
        bottom: 16,
        position: 'fixed',
        right: 16,
      }}
    >
      <Tooltip
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`}
        placement="left"
        arrow
      >
        <IconButton onClick={toggleTheme} color="inherit" size="large">
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Tooltip>
    </Paper>
  );
}

export default ThemeSwitcher;
