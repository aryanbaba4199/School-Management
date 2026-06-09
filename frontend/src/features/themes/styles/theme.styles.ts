import { createGlobalStyle } from 'styled-components';
import { colors } from '../../../constants/colors';
import type { ThemeMode } from '../types/theme.types';

/*------------- Global Styles Configuration -------------*/

export const GlobalThemeStyles = createGlobalStyle<{ mode: ThemeMode }>`
  :root {
    --color-primary-main: ${props => colors[props.mode].primary.main};
    --color-primary-light: ${props => colors[props.mode].primary.light};
    --color-primary-dark: ${props => colors[props.mode].primary.dark};
    
    --color-background-default: ${props => colors[props.mode].background.default};
    --color-background-paper: ${props => colors[props.mode].background.paper};
    
    --color-text-primary: ${props => colors[props.mode].text.primary};
    --color-text-secondary: ${props => colors[props.mode].text.secondary};
    --color-text-disabled: ${props => colors[props.mode].text.disabled};
    
    --color-border-default: ${props => colors[props.mode].border.default};
    --color-border-light: ${props => colors[props.mode].border.light};
    
    --shadow-sm: ${props => colors[props.mode].shadow.sm};
    --shadow-md: ${props => colors[props.mode].shadow.md};
    --shadow-lg: ${props => colors[props.mode].shadow.lg};
  }

  body {
    background-color: var(--color-background-default);
    color: var(--color-text-primary);
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  }
`;
