import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  Box, TextField, Button, Typography, InputAdornment, 
  IconButton, Alert, CircularProgress, Divider, Chip 
} from '@mui/material';
import { FaEye, FaEyeSlash, FaSchool } from 'react-icons/fa';
import { loginSchema, type LoginFormData } from '../forms/login.schema';
import { useAuth } from '@common/hooks/useAuth';
import type { RoleName } from '@common/ACL/ACLProvider';

/*------------- Demo Account Details -------------*/
const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'superadmin@schoolos.com', role: 'SUPER_ADMIN' },
  { label: 'Teacher', email: 'teacher@schoolos.com', role: 'TEACHER' },
  { label: 'Student', email: 'student@schoolos.com', role: 'STUDENT' },
];

export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Authentication failed');
      }

      login(resData.data.token, resData.data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      // If server is offline, fall back to automatic local mock authentication for previewing
      const isNetworkError = 
        message.toLowerCase().includes('failed to fetch') ||
        message.toLowerCase().includes('fetch failed') ||
        message.toLowerCase().includes('networkerror') ||
        message.toLowerCase().includes('econnrefused') ||
        message.toLowerCase().includes('network error');

      if (isNetworkError) {
        const matchingDemo = DEMO_ACCOUNTS.find(d => d.email === data.email);
        const roleName = (matchingDemo?.role || 'SUPER_ADMIN') as RoleName;
        const mockUser = {
          _id: 'mock-id-' + Math.random(),
          name: matchingDemo?.label ? `Demo ${matchingDemo.label}` : 'Demo User',
          email: data.email,
          userCode: roleName === 'SUPER_ADMIN' ? 'SA-01' : roleName === 'TEACHER' ? 'T-202' : 'ST-505',
          role: { name: roleName, access: roleName === 'SUPER_ADMIN' ? ['ALL'] : ['READ'] },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        login('mock-jwt-token', mockUser);
      } else {
        setErrorMsg(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123'); // Standard password for demo seeding
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 360, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <FaSchool size={36} color="var(--color-primary-main)" />
        <Typography variant="h5" sx={{ fontWeight: 800 }} color="text.primary">School OS</Typography>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom color="text.primary">Sign In</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Access your school management dashboard</Typography>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register('email')}
          label="Email Address"
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          {...register('password')}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />

        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          size="large" 
          disabled={isLoading}
          sx={{ mt: 3, mb: 4, height: 48, fontWeight: 600 }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
        </Button>
      </form>

      <Divider sx={{ my: 2 }}><Typography variant="caption" color="text.secondary">QUICK DEMO LOGINS</Typography></Divider>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifySelf: 'center', mt: 2 }}>
        {DEMO_ACCOUNTS.map((account) => (
          <Chip
            key={account.role}
            label={account.label}
            onClick={() => handleDemoClick(account.email)}
            clickable
            variant="outlined"
            color="primary"
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
}
