import styled from 'styled-components';
import { Button } from '@mui/material';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useAppTheme } from '../../themes/components/AppThemeProvider';
import { AdSection } from '../components/AdSection';
import { LoginForm } from '../components/LoginForm';

/*------------- Styled Components -------------*/

const PageContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-background-default);
`;

const LeftColumn = styled.div`
  flex: 1;
  height: 100%;
  display: none;
  
  @media (min-width: 900px) {
    display: block;
    width: 70%;
  }
`;

const RightColumn = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--color-background-paper);
  border-left: 1px solid var(--color-border-default);
  position: relative;
  
  @media (min-width: 900px) {
    width: 30%;
    min-width: 380px;
  }
`;

const ThemeToggleWrapper = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
`;

export function LoginPage() {
  const { mode, toggleTheme } = useAppTheme();

  return (
    <PageContainer>
      <LeftColumn>
        <AdSection />
      </LeftColumn>
      <RightColumn>
        <ThemeToggleWrapper>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={toggleTheme}
            sx={{ minWidth: 44, height: 44, borderRadius: '50%', p: 0 }}
          >
            {mode === 'light' ? <FaMoon size={16} /> : <FaSun size={16} />}
          </Button>
        </ThemeToggleWrapper>
        <LoginForm />
      </RightColumn>
    </PageContainer>
  );
}
