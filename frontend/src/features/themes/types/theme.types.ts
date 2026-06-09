/*------------- Theme TypeScript Interfaces -------------*/

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextProps {
  mode: ThemeMode;
  toggleTheme: () => void;
}
