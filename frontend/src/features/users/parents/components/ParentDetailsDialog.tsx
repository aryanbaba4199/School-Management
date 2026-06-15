import { 
  Box, Typography, Grid, Chip, CircularProgress, 
  Divider, IconButton, DialogTitle, DialogContent 
} from '@mui/material';
import { FaTimes, FaHistory } from 'react-icons/fa';
import { useGetUserByIdQuery } from '@api/usersApi';
import { UserAuditLogTable } from '../../common/components/UserAuditLogTable';

interface ParentDetailsDialogProps {
  userId: string;
  onClose: () => void;
}

export default function ParentDetailsDialog({ userId, onClose }: ParentDetailsDialogProps) {
  const { data: res, isLoading, error } = useGetUserByIdQuery(userId, { skip: !userId });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minHeight: 300, alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !res?.success || !res.data) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Failed to load parent details.</Typography>
      </Box>
    );
  }

  const parentData = res.data;

  return (
    <>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Parent/Guardian Details</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={parentData.isActive ? 'Active' : 'Inactive'} 
            color={parentData.isActive ? 'success' : 'default'} 
            size="small" 
            sx={{ fontWeight: 600 }} 
          />
          <IconButton onClick={onClose} size="small">
            <FaTimes />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {parentData.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Guardian ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {parentData.userCode}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {parentData.email}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {parentData.phone || '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Address Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {parentData.address?.street ? `${parentData.address.street}, ` : ''}
                {parentData.address?.city && typeof parentData.address.city === 'object' ? `${(parentData.address.city as { name: string }).name}, ` : ''}
                {parentData.address?.district && typeof parentData.address.district === 'object' ? `${(parentData.address.district as { name: string }).name}, ` : ''}
                {parentData.address?.state && typeof parentData.address.state === 'object' ? `${(parentData.address.state as { name: string }).name} ` : ''}
                {parentData.address?.pincode ? `- ${parentData.address.pincode}` : ''}
                {!parentData.address?.street && !parentData.address?.city && !parentData.address?.state ? 'No address provided' : ''}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Linked Children (Students)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {parentData.childrenIds && parentData.childrenIds.length > 0 ? (
                  parentData.childrenIds.map((child: { _id: string; name: string; userCode: string } | string) => (
                    <Chip 
                      key={typeof child === 'object' ? child._id : child as string} 
                      label={typeof child === 'object' ? `${child.name} (${child.userCode})` : child} 
                      color="primary" 
                      variant="outlined" 
                    />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>No children linked</Typography>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaHistory /> Audit History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <UserAuditLogTable userId={userId} />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
}
