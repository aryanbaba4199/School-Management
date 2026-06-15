import { Box, Typography, CircularProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useGetUserAuditLogQuery } from '@api/usersApi';
import { format } from 'date-fns';

interface UserAuditLogTableProps {
  userId: string;
}

const actionColorMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  CREATE: 'success',
  UPDATE: 'primary',
  DELETE: 'error',
  STATUS_TOGGLE: 'warning',
  PASSWORD_CHANGE: 'info',
};

export function UserAuditLogTable({ userId }: UserAuditLogTableProps) {
  const { data, isLoading, isError } = useGetUserAuditLogQuery(userId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data?.success) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Failed to load audit logs.</Typography>
      </Box>
    );
  }

  const logs = data.data;

  if (logs.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No audit logs found for this user.</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--color-border)' }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: 'var(--color-bg-subtle)' }}>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Changed By</TableCell>
            <TableCell>Reason / Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log._id}>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <Chip 
                  label={log.action} 
                  color={actionColorMap[log.action] || 'default'} 
                  size="small" 
                  sx={{ fontWeight: 600, fontSize: '0.7rem' }} 
                />
              </TableCell>
              <TableCell>
                {typeof log.changedBy === 'object' ? log.changedBy.name : 'Unknown'}
              </TableCell>
              <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                  {log.reason || '-'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
