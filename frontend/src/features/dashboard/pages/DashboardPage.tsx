import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { FaUserShield } from 'react-icons/fa';
import { useAuth } from '@common/hooks/useAuth';
import { useACL } from '@common/ACL/ACLProvider';

export function DashboardPage() {
  const { user } = useAuth();
  const { hasAccess } = useACL();

  return (
    <Container component="main" sx={{ py: 4, maxWidth: '1200px' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom color="text.primary">
          Welcome to Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
          <strong>Current Profile:</strong> {user ? <span data-testid="profile-user">{user.name} ({user.role.name})</span> : <span data-testid="profile-user">Guest</span>}
        </Typography>
      </Box>

      {hasAccess(['SUPER_ADMIN']) && (
        <Box sx={{ mt: 4 }}>
          <Card sx={{ border: '1px dashed var(--color-primary-main)', bgcolor: 'rgba(255, 255, 255, 0.01)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FaUserShield size={28} style={{ color: 'var(--color-primary-main)' }} />
              <Box>
                <Typography variant="h6" color="textPrimary">Admin Control Panel</Typography>
                <Typography variant="body2" color="textSecondary">
                  This panel is highly restricted and only rendered when checking SUPER_ADMIN access via the ACLProvider.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}

export default DashboardPage;
