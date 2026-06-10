import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DialogTitle, DialogContent, DialogActions, Button, Grid, Box, CircularProgress, Autocomplete, TextField } from '@mui/material';
import { FormTextField, FormSelectField } from '@common/Forms';
import { useGetUsersQuery, useGetUserByIdQuery } from '../../../../api/usersApi';
import { useGetStatesQuery, useGetDistrictsQuery } from '../../../../api/masterApi';
import { useGetClassesQuery } from '../../../../api/classesApi';
import { studentSchema, type StudentFormData } from '../schema/student.schema';
import type { ISchoolUser } from '../../../../api/usersApi';

interface StudentFormDialogProps {
  onClose: () => void;
  onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void;
  userId?: string;
  isLoading?: boolean;
}



export function StudentFormDialog({ onClose, onSubmit, userId, isLoading = false }: StudentFormDialogProps) {
  const { data: userRes, isLoading: isUserLoading } = useGetUserByIdQuery(userId!, { skip: !userId });
  const user = userRes?.success ? userRes.data : null;
  const { data: parentsRes } = useGetUsersQuery({ role: 'PARENT' });
  const parents = parentsRes?.success ? parentsRes.data : [];

  const { handleSubmit, control, watch, reset } = useForm<StudentFormData>({
    resolver: yupResolver(studentSchema) as unknown as Resolver<StudentFormData>,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      userCode: '',
      phone: '',
      classId: '',
      sectionId: '',
      parentId: '',
      address: {
        street: '',
        state: '',
        district: '',
        pincode: undefined,
      },
    },
  });

  const selectedState = watch('address.state');
  const selectedClassId = watch('classId');

  const mapToOpts = (items: { _id: string; name: string }[]) => items.map(i => ({ value: i._id, label: i.name }));

  const { data: classesRes } = useGetClassesQuery();
  const classes = classesRes?.success ? classesRes.data : [];
  const classOptions = mapToOpts(classes);

  const selectedClass = classes.find(c => c._id === selectedClassId);
  const sectionOptions = selectedClass ? mapToOpts(selectedClass.sections) : [];

  const { data: statesRes } = useGetStatesQuery('');
  const states = statesRes?.success ? statesRes.data : [];

  const { data: districtsRes } = useGetDistrictsQuery(selectedState || '');
  const districts = districtsRes?.success ? districtsRes.data : [];

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        userCode: user.userCode,
        phone: user.phone || '',
        classId: user.classId || '',
        sectionId: user.sectionId || '',
        parentId: typeof user.parentId === 'object' ? user.parentId._id : user.parentId || '',
        address: {
          street: user.address?.street || '',
          state: typeof user.address?.state === 'object' ? user.address.state._id : user.address?.state || '',
          district: typeof user.address?.district === 'object' ? user.address.district._id : user.address?.district || '',
          pincode: user.address?.pincode || undefined,
        },
      });
    }
  }, [user, reset]);


  const onFormSubmit = (formData: StudentFormData) => {
    const submitPayload: Partial<ISchoolUser> & { password?: string } = {
      name: formData.name,
      email: formData.email,
      userCode: formData.userCode,
      phone: formData.phone || undefined,
      classId: formData.classId || undefined,
      sectionId: formData.sectionId || undefined,
      parentId: formData.parentId || undefined,
      address: formData.address ? {
        street: formData.address.street || undefined,
        state: formData.address.state || undefined,
        district: formData.address.district || undefined,
        pincode: formData.address.pincode || undefined,
      } : undefined,
      role: {
        name: 'STUDENT',
        access: [],
      },
    };
    if (formData.password) {
      submitPayload.password = formData.password;
    }
    onSubmit(submitPayload);
  };

  if (isUserLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minHeight: 300, alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        {userId ? 'Edit Student' : 'Add New Student'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="name" control={control} label="Student Name" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="email" control={control} label="Email Address" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="password" control={control} label={userId ? 'Password (Leave blank to keep same)' : 'Password'} type="password" required={!userId} disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="userCode" control={control} label="Admission Number" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="phone" control={control} label="Phone Number" disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormSelectField
                name="classId"
                control={control}
                label="Class"
                options={classOptions}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormSelectField
                name="sectionId"
                control={control}
                label="Section"
                options={sectionOptions}
                required
                disabled={!selectedClassId || sectionOptions.length === 0}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="parentId"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  const parentOptions = parents.map(p => ({ value: p._id, label: `${p.name} (${p.userCode})` }));
                  const selectedOption = parentOptions.find(o => o.value === value) || null;
                  return (
                    <Autocomplete
                      options={parentOptions}
                      getOptionLabel={(option) => option.label}
                      value={selectedOption}
                      onChange={(_, newValue) => {
                        onChange(newValue ? newValue.value : '');
                      }}
                      disabled={isLoading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Parent/Guardian"
                          error={!!error}
                          helperText={error?.message}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'var(--color-bg-primary)',
                              borderRadius: '8px'
                            }
                          }}
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 12 }}>
              <FormTextField name="address.street" control={control} label="Street Address" disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormSelectField name="address.state" control={control} label="State" options={mapToOpts(states)} disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormSelectField name="address.district" control={control} label="District" options={mapToOpts(districts)} disabled={!selectedState || isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormTextField name="address.pincode" control={control} label="Pincode" type="number" disabled={isLoading} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--color-border-default)', pt: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onFormSubmit)} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          {userId ? 'Save Changes' : 'Add Student'}
        </Button>
      </DialogActions>
    </>
  );
}
