import styled from 'styled-components';

/*------------- Navbar Styles -------------*/

export const NavbarWrapper = styled.nav`
  height: 70px;
  border-bottom: 1px solid var(--color-border-default);
  background-color: var(--color-background-paper);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 40;
`;

export const BrandBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

/*------------- Sidebar Styles -------------*/

export const SidebarWrapper = styled.div<{ $collapsed: boolean }>`
  width: ${props => props.$collapsed ? '70px' : '260px'};
  background-color: var(--color-background-paper);
  border-right: 1px solid var(--color-border-default);
  height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  overflow-x: hidden;
  position: sticky;
  top: 70px;
`;

export const ActiveBar = styled.div<{ $active: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--color-primary-main);
  opacity: ${props => props.$active ? 1 : 0};
  transition: opacity 0.2s ease;
`;

/*------------- MainLayout Styles -------------*/

export const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background-default);
`;

export const MainContainer = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
`;

export const ContentArea = styled.main`
  flex-grow: 1;
  overflow-y: auto;
  min-height: calc(100vh - 70px);
  background-color: var(--color-background-default);
  padding: 10px;
  transition: padding-left 0.2s ease;
`;
