import type { ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { FaPlus } from 'react-icons/fa';
import styled from 'styled-components';

const Wrapper = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeaderContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  border-bottom: 1px solid var(--color-border-default);
  padding-bottom: 16px;
`;


const AddButton = styled(Button)`
  border-radius: 8px !important;
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 8px 16px !important;
  box-shadow: var(--shadow-sm) !important;
  &:hover {
    box-shadow: var(--shadow-md) !important;
  }
`;

interface PageWrapperProps {
  title: string;
  onCreate?: () => void;
  createLabel?: string;
  children: ReactNode;
}

export default function PageWrapper({
  title,
  onCreate,
  createLabel = 'Create New',
  children,
}: PageWrapperProps) {
  return (
    <Wrapper>
      <HeaderContainer>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </Typography>
        {onCreate && (
          <AddButton
            variant="contained"
            color="primary"
            startIcon={<FaPlus />}
            onClick={onCreate}
          >
            {createLabel}
          </AddButton>
        )}
      </HeaderContainer>
      <Box>{children}</Box>
    </Wrapper>
  );
}
