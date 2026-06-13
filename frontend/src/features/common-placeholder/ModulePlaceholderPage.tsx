import { Box, Container, Paper, Typography } from '@mui/material';

interface ModulePlaceholderPageProps {
  title: string;
  module: string;
}

export function ModulePlaceholderPage({ title, module }: ModulePlaceholderPageProps) {
  return (
    <Container component="main" sx={{ py: 4, maxWidth: '1200px' }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--color-border-default)',
          borderRadius: 2,
          p: { xs: 3, md: 4 },
          bgcolor: 'var(--color-background-paper)',
        }}
      >
        <Box sx={{ maxWidth: 720 }}>
          <Typography variant="overline" sx={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>
            {module}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-text-primary)', mt: 0.5 }}>
            {title}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default ModulePlaceholderPage;
