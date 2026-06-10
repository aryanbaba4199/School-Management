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
} from '@mui/material';
import { FaSchool, FaGlobe, FaEnvelope, FaPhone, FaTools, FaAddressCard } from 'react-icons/fa';
import styled from 'styled-components';

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

interface SchoolDetailsDialogProps {
  schoolId: string;
  onClose: () => void;
}

interface MockSchool {
  _id: string;
  name: string;
  code: string;
  subdomain: string;
  email: string;
  phone: string;
  address?: string;
  boardType: string;
  subscriptionName: string;
  maxStudents: number;
  admissionFee?: number;
  isActive: boolean;
  settings: {
    attendanceEnabled: boolean;
    onlineExamEnabled: boolean;
    aiAnalyticsEnabled: boolean;
    parentAppEnabled: boolean;
  };
}

const mockSchoolsDb: Record<string, MockSchool> = {
  'school-1': {
    _id: 'school-1',
    name: 'Greenwood International School',
    code: 'GWIS',
    subdomain: 'greenwood',
    email: 'info@greenwood.edu.in',
    phone: '+91 22 2345 6789',
    address: 'Plot 12, Sector 15, Vashi, Navi Mumbai, Maharashtra, 400703',
    boardType: 'CBSE',
    subscriptionName: 'Premium Plan',
    maxStudents: 1500,
    isActive: true,
    settings: {
      attendanceEnabled: true,
      onlineExamEnabled: true,
      aiAnalyticsEnabled: true,
      parentAppEnabled: true,
    },
  },
  'school-2': {
    _id: 'school-2',
    name: 'Saint Xavier Academy',
    code: 'SXAC',
    subdomain: 'stxaviers',
    email: 'contact@sxac.edu.in',
    phone: '+91 33 2211 4455',
    address: '5 Roy Street, Kolkata, West Bengal, 700020',
    boardType: 'ICSE',
    subscriptionName: 'Standard Plan',
    maxStudents: 800,
    isActive: true,
    settings: {
      attendanceEnabled: true,
      onlineExamEnabled: false,
      aiAnalyticsEnabled: false,
      parentAppEnabled: true,
    },
  },
};

export default function SchoolDetailsDialog({ schoolId, onClose }: SchoolDetailsDialogProps) {
  const [school, setSchool] = useState<MockSchool | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const found = mockSchoolsDb[schoolId] || mockSchoolsDb['school-1'];
      setSchool(found);
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [schoolId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 250 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!school) {
    return (
      <>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography color="error">School details could not be found.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" variant="contained">Close</Button>
        </DialogActions>
      </>
    );
  }

  return (
    <>
      <DialogTitle sx={{ borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'var(--color-primary-main)', width: 56, height: 56 }}>
            <FaSchool size={28} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {school.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
              <Chip label={school.boardType} color="primary" size="small" variant="outlined" />
              <Chip label={`Code: ${school.code}`} size="small" />
              <Chip label={school.subscriptionName} color="secondary" size="small" />
              <Chip
                label={school.isActive ? 'Active' : 'Inactive'}
                color={school.isActive ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SectionTitle><FaGlobe size={16} /> Web & Contact Info</SectionTitle>
            <InfoBox>
              <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaGlobe /> <strong>Subdomain:</strong> {school.subdomain}.schoolos.com
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaEnvelope /> <strong>Email:</strong> {school.email}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaPhone /> <strong>Phone:</strong> {school.phone}
              </Typography>
            </InfoBox>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SectionTitle><FaAddressCard size={16} /> Campus Address</SectionTitle>
            <InfoBox>
              <Typography variant="body2" color="textPrimary" sx={{ lineHeight: 1.6 }}>
                {school.address || 'Address not configured.'}
              </Typography>
            </InfoBox>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SectionTitle><FaTools size={16} /> Features & Settings</SectionTitle>
            <InfoBox>
              <Grid container spacing={1}>
                {Object.entries(school.settings).map(([key, enabled]) => (
                  <Grid size={6} key={key}>
                    <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                      {key.replace(/Enabled$/, '').replace(/([A-Z])/g, ' $1')}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={enabled ? 'Enabled' : 'Disabled'}
                        size="small"
                        color={enabled ? 'success' : 'default'}
                        variant={enabled ? 'filled' : 'outlined'}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </InfoBox>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SectionTitle><FaSchool size={16} /> Subscriptions & Scaling</SectionTitle>
            <InfoBox>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Tier:</strong> {school.subscriptionName}
              </Typography>
              <Typography variant="body2">
                <strong>Capacity Limit:</strong> {school.maxStudents} Students
              </Typography>
              {school.admissionFee !== undefined && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Admission Fee:</strong> ₹{school.admissionFee}
                </Typography>
              )}
            </InfoBox>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid var(--color-border-default)', px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </>
  );
}
