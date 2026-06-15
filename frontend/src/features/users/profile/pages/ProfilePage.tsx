import { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Alert } from '@mui/material';
import { useAuth } from '@common/hooks/useAuth';
import { useGetUserByIdQuery, useUpdateProfileMutation, useChangePasswordMutation } from '@api/usersApi';
import { ProfileForm } from '../components/ProfileForm';
import { PasswordChangeForm } from '../components/PasswordChangeForm';
import type { ProfileFormData, PasswordChangeFormData } from '../schema/profile.schema';

export function ProfilePage() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: userRes, isLoading: isUserLoading } = useGetUserByIdQuery(authUser?._id || '', {
    skip: !authUser?._id,
  });
  
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPwd }] = useChangePasswordMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleProfileUpdate = async (data: ProfileFormData) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        address: data.address ? {
          street: data.address.street || undefined,
          state: data.address.state || undefined,
          district: data.address.district || undefined,
          pincode: data.address.pincode || undefined,
        } : undefined,
      };
      
      const res = await updateProfile(payload).unwrap();
      if (res.success) {
        setSuccessMsg('Profile updated successfully.');
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMsg(error?.data?.message || error?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (data: PasswordChangeFormData) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const res = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      if (res.success) {
        setSuccessMsg('Password changed successfully.');
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMsg(error?.data?.message || error?.message || 'Failed to change password.');
    }
  };

  const user = userRes?.data;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
          My Profile
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)', mt: 1 }}>
          Manage your account settings and password.
        </Typography>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

      <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'var(--color-bg-subtle)' }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 2 }}>
            <Tab label="Personal Info" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' }} />
            <Tab label="Security" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' }} />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 4 }}>
          {activeTab === 0 && user && (
            <ProfileForm 
              user={user} 
              onSubmit={handleProfileUpdate} 
              isLoading={isUpdating || isUserLoading} 
            />
          )}
          {activeTab === 1 && (
            <PasswordChangeForm 
              onSubmit={handlePasswordChange} 
              isLoading={isChangingPwd} 
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
}
