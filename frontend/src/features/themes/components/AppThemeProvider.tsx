import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { colors } from '../../../constants/colors';
import type { ThemeMode, ThemeContextProps } from '../types/theme.types';
import { GlobalThemeStyles } from '../styles/theme.styles';

/*------------- Context Definition -------------*/

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

/*------------- Provider Component -------------*/

export function AppThemeProvider({ children }: { children: ReactNode }) {
  // Read initial preference safely, fallback to 'dark' if localStorage is unavailable
  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      if (
        typeof window !== 'undefined' &&
        window.localStorage &&
        typeof window.localStorage.getItem === 'function'
      ) {
        const saved = window.localStorage.getItem('theme-mode');
        return (saved as ThemeMode) || 'dark';
      }
    } catch (error) {
      console.warn('LocalStorage is not accessible. Defaulting to dark theme.');
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      if (
        typeof window !== 'undefined' &&
        window.localStorage &&
        typeof window.localStorage.setItem === 'function'
      ) {
        window.localStorage.setItem('theme-mode', mode);
      }
    } catch (error) {
      // Ignore writing failures in restricted environments
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const activeColors = colors[mode];

  // Dynamically map our custom colors to the MUI palette configuration
  const muiTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: activeColors.primary.main,
        light: activeColors.primary.light,
        dark: activeColors.primary.dark,
        contrastText: activeColors.primary.contrastText,
      },
      secondary: {
        main: activeColors.secondary.main,
        light: activeColors.secondary.light,
        dark: activeColors.secondary.dark,
        contrastText: activeColors.secondary.contrastText,
      },
      background: {
        default: activeColors.background.default,
        paper: activeColors.background.paper,
      },
      text: {
        primary: activeColors.text.primary,
        secondary: activeColors.text.secondary,
        disabled: activeColors.text.disabled,
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <StyledThemeProvider theme={activeColors}>
          <GlobalThemeStyles mode={mode} />
          {children}
        </StyledThemeProvider>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

/*------------- Custom Hook -------------*/

export function useAppTheme(): ThemeContextProps {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
}
