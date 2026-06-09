import { useEffect, useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Grid,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUsers, FaBookOpen } from 'react-icons/fa';
import styled from 'styled-components';
import type { IUser } from '../types/user.types';

const SectionTitle = styled(Typography)`
  font-weight: 600 !important;
  color: var(--color-primary-main);
  margin-top: 16px !important;
  margin-bottom: 8px !important;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoBox = styled(Box)`
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  height: 100%;
`;

interface UserDetailsDialogProps {
  userId: string;
  onClose: () => void;
}

// Mock User Data for Preview/Testing
const mockUsersDb: Record<string, IUser> = {
  'user-1': {
    _id: 'user-1',
    name: 'Aryan Dubey',
    email: 'aryan@schoolos.com',
    userCode: 'SA-01',
    role: { name: 'SUPER_ADMIN', access: ['ALL'] },
    phone: '+91 98765 43210',
    isActive: true,
    address: { street: '123 Admin Lane', city: 'Delhi', state: 'Delhi', pincode: 110001 },
    createdAt: '2026-06-08T00:00:00.000Z',
    updatedAt: '2026-06-08T00:00:00.000Z',
  },
  'user-2': {
    _id: 'user-2',
    name: 'Jane Doe',
    email: 'jane.doe@schoolos.com',
    userCode: 'T-202',
    role: { name: 'TEACHER', access: ['CLASS_ATTENDANCE', 'GRADE_STUDENTS'] },
    phone: '+91 99999 88888',
    isActive: true,
    address: { street: '45 Teacher Boulevard', city: 'Mumbai', state: 'Maharashtra', pincode: 400001 },
    subjects: ['Mathematics', 'Physics'],
    createdAt: '2026-06-08T00:00:00.000Z',
    updatedAt: '2026-06-08T00:00:00.000Z',
  },
  'user-3': {
    _id: 'user-3',
    name: 'Billy Kid',
    email: 'billy@schoolos.com',
    userCode: 'ST-505',
    role: { name: 'STUDENT', access: [] },
    phone: '+91 88888 77777',
    isActive: true,
    address: { street: '88 Student Road', city: 'Bangalore', state: 'Karnataka', pincode: 560001 },
    parentId: 'user-4',
    classId: 'Class 10',
    sectionId: 'Section A',
    createdAt: '2026-06-08T00:00:00.000Z',
    updatedAt: '2026-06-08T00:00:00.000Z',
  },
};

export default function UserDetailsDialog({ userId, onClose }: UserDetailsDialogProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate API Fetch
    const timer = setTimeout(() => {
      const found = mockUsersDb[userId] || mockUsersDb['user-1']; // Fallback for testing
      setUser(found);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 250 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user) {
    return (
      <>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography color="error">User not found.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" variant="contained">Close</Button>
        </DialogActions>
      </>
    );
  }

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const getCityName = () => {
    const city = user.address?.city;
    if (!city) return '';
    return typeof city === 'object' ? city.name : city;
  };

  const getStateName = () => {
    const state = user.address?.state;
    if (!state) return '';
    return typeof state === 'object' ? state.name : state;
  };

  return (
    <>
      <DialogTitle sx={{ borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'var(--color-primary-main)', width: 56, height: 56, fontSize: '1.25rem' }}>
            {getInitials(user.name)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {user.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
              <Chip label={user.role.name} color="primary" size="small" variant="outlined" />
              <Chip label={user.userCode} size="small" />
              <Chip
                label={user.isActive ? 'Active' : 'Inactive'}
                color={user.isActive ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SectionTitle><FaUser size={16} /> Contact Information</SectionTitle>
            <InfoBox>
              <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FaEnvelope /> {user.email}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaPhone /> {user.phone || 'N/A'}
              </Typography>
            </InfoBox>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SectionTitle><FaMapMarkerAlt size={16} /> Address Details</SectionTitle>
            <InfoBox>
              {user.address ? (
                <>
                  <Typography variant="body2" color="textPrimary">{user.address.street}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {getCityName()}, {getStateName()} - {user.address.pincode}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">No address registered.</Typography>
              )}
            </InfoBox>
          </Grid>

          {user.role.name === 'TEACHER' && user.subjects && (
            <Grid size={12}>
              <SectionTitle><FaBookOpen size={16} /> Subjects Specialization</SectionTitle>
              <InfoBox sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {user.subjects.map((sub, i) => (
                  <Chip key={i} label={sub} variant="filled" color="secondary" size="small" />
                ))}
              </InfoBox>
            </Grid>
          )}

          {user.role.name === 'STUDENT' && (
            <Grid size={12}>
              <SectionTitle><FaUsers size={16} /> Academic Placement</SectionTitle>
              <InfoBox>
                <Grid container spacing={1}>
                  <Grid size={6}>
                    <Typography variant="caption" color="textSecondary">Class</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.classId || 'N/A'}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="textSecondary">Section</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.sectionId || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </InfoBox>
            </Grid>
          )}
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="textSecondary">
          Created: {new Date(user.createdAt).toLocaleDateString()} | Updated: {new Date(user.updatedAt).toLocaleDateString()}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid var(--color-border-default)', px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </>
  );
}
