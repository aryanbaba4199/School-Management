import type { ReactNode } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
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
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid var(--color-border-default);
  padding-bottom: 16px;
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
          <Tooltip title={createLabel}>
            <IconButton
              color="primary"
              aria-label={createLabel}
              onClick={onCreate}
              sx={{
                backgroundColor: 'var(--color-primary-main)',
                color: '#fff',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: 'var(--color-primary-dark)',
                },
              }}
            >
              <FaPlus size={14} />
            </IconButton>
          </Tooltip>
        )}
      </HeaderContainer>
      <Box>{children}</Box>
    </Wrapper>
  );
}
