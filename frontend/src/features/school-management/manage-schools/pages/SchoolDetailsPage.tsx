import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import {
  FaArrowLeft,
  FaSchool,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCogs,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { useGetSchoolByIdQuery } from '../../../../api/schoolsApi';
import styled from 'styled-components';

/*------------- Styled Components -------------*/

const PageContainer = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeaderBar = styled(Box)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border-default);
`;

const SectionCard = styled(Card)`
  background-color: var(--color-background-paper) !important;
  border: 1px solid var(--color-border-default) !important;
  border-radius: 12px !important;
  box-shadow: var(--shadow-sm) !important;
`;

const SectionHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const FieldLabel = styled(Typography)`
  color: var(--color-text-secondary) !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px !important;
`;

const FieldValue = styled(Typography)`
  color: var(--color-text-primary) !important;
  font-weight: 500 !important;
`;

const FeatureItem = styled(Box)<{ enabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  background-color: ${({ enabled }) =>
    enabled ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255,255,255,0.03)'};
  border: 1px solid ${({ enabled }) =>
    enabled ? 'rgba(34, 197, 94, 0.2)' : 'var(--color-border-default)'};
`;

/*------------- Field Helper -------------*/

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <Box>
      <FieldLabel>{label}</FieldLabel>
      <FieldValue variant="body1">{value || '—'}</FieldValue>
    </Box>
  );
}

/*------------- Main Page -------------*/

export function SchoolDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetSchoolByIdQuery(id!);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data?.data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error">Failed to load school details.</Typography>
        <Button onClick={() => navigate('/school-management/manage-schools')} startIcon={<FaArrowLeft />} sx={{ mt: 2 }}>
          Back to Schools
        </Button>
      </Box>
    );
  }

  const school = data.data;
  const country = typeof school.country === 'object' ? school.country : null;
  const state = typeof school.state === 'object' ? school.state : null;
  const district = typeof school.district === 'object' ? school.district : null;
  const boardType = typeof school.boardType === 'object' ? school.boardType : null;
  const plan = typeof school.subscriptionPlan === 'object' ? school.subscriptionPlan : null;

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <PageContainer>
      {/* Header */}
      <HeaderBar>
        <Button
          startIcon={<FaArrowLeft />}
          onClick={() => navigate('/school-management/manage-schools')}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            {school.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              {school.code} · {school.subdomain}
            </Typography>
            <Chip
              label={school.isDeactive ? 'Deactivated' : school.isActive ? 'Active' : 'Inactive'}
              color={school.isDeactive ? 'error' : school.isActive ? 'success' : 'default'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>
        </Box>
      </HeaderBar>

      <Grid container spacing={3}>
        {/* General Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader>
                <FaSchool style={{ color: 'var(--color-primary-main)', fontSize: 18 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  General Information
                </Typography>
              </SectionHeader>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="School Name" value={school.name} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="Code" value={school.code} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="Subdomain" value={school.subdomain} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="Board Type" value={boardType?.acronym || boardType?.name || String(school.boardType)} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="Email" value={school.email} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Phone</FieldLabel>
                  <FieldValue>{school.countryCode} {school.phone}</FieldValue>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="Total Teachers" value={school.totalTeacher ?? 0} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="Total Students" value={school.totalStudent ?? 0} /></Grid>
              </Grid>
            </CardContent>
          </SectionCard>
        </Grid>

        {/* Location */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader>
                <FaMapMarkerAlt style={{ color: 'var(--color-primary-main)', fontSize: 18 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Location
                </Typography>
              </SectionHeader>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="Country" value={country?.name} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="State" value={state?.name} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="District" value={district?.name} /></Grid>
                <Grid size={12}><Field label="Address" value={school.address} /></Grid>
              </Grid>
            </CardContent>
          </SectionCard>
        </Grid>

        {/* Subscription */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader>
                <FaCreditCard style={{ color: 'var(--color-primary-main)', fontSize: 18 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Subscription
                </Typography>
              </SectionHeader>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="Plan" value={plan?.name || String(school.subscriptionPlan)} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Billing Cycle</FieldLabel>
                  <Chip
                    label={school.billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                    color={school.billingCycle === 'MONTHLY' ? 'info' : 'secondary'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="Max Students" value={school.maxStudents} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="Start Date" value={formatDate(school.subscriptionStartDate)} /></Grid>
                <Grid size={12}>
                  <Divider sx={{ my: 1, borderColor: 'var(--color-border-default)' }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Field label="End Date" value={formatDate(school.subscriptionEndDate)} /></Grid>
              </Grid>
            </CardContent>
          </SectionCard>
        </Grid>

        {/* Features */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader>
                <FaCogs style={{ color: 'var(--color-primary-main)', fontSize: 18 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Enabled Features
                </Typography>
              </SectionHeader>
              <Grid container spacing={1.5}>
                {[
                  { label: 'RFID Attendance', enabled: school.settings?.attendanceEnabled },
                  { label: 'Online Exams', enabled: school.settings?.onlineExamEnabled },
                  { label: 'AI Recommendations', enabled: school.settings?.aiAnalyticsEnabled },
                  { label: 'Parent Mobile App', enabled: school.settings?.parentAppEnabled },
                ].map(({ label, enabled }) => (
                  <Grid key={label} size={{ xs: 12, sm: 6 }}>
                    <FeatureItem enabled={!!enabled}>
                      {enabled
                        ? <FaCheckCircle style={{ color: 'rgb(34, 197, 94)', fontSize: 14 }} />
                        : <FaTimesCircle style={{ color: 'var(--color-text-secondary)', fontSize: 14 }} />}
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: enabled ? 'rgb(34, 197, 94)' : 'var(--color-text-secondary)' }}
                      >
                        {label}
                      </Typography>
                    </FeatureItem>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </SectionCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
