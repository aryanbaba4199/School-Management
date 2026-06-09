import { useSidebar } from '../hooks/useSidebar';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { LayoutWrapper, MainContainer, ContentArea } from '../styles/navbar.styles';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { 
    collapsed, 
    mobileOpen, 
    toggleSidebar, 
    closeMobileSidebar 
  } = useSidebar();

  return (
    <LayoutWrapper>
      <Navbar onToggleSidebar={toggleSidebar} />
      <MainContainer>
        <Sidebar 
          collapsed={collapsed} 
          mobileOpen={mobileOpen} 
          onClose={closeMobileSidebar} 
        />
        <ContentArea>
          {children}
        </ContentArea>
      </MainContainer>
    </LayoutWrapper>
  );
}

export default MainLayout;
