import { PageWrapper } from '@common/Datatable';
import { Box, Typography } from '@mui/material';

export function TransactionsPage() {
  return (
    <PageWrapper title="Transaction Management">
      <Box sx={{ p: 3, textAlign: 'center', py: 8 }}>
        <Typography variant="body1" color="textSecondary">
          Transaction management features are coming soon.
        </Typography>
      </Box>
    </PageWrapper>
  );
}
