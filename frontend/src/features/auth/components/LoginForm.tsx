import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  Box, TextField, Button, Typography, InputAdornment, 
  IconButton, Alert, CircularProgress 
} from '@mui/material';
import { FaEye, FaEyeSlash, FaSchool } from 'react-icons/fa';
import { loginSchema, type LoginFormData } from '../forms/login.schema';
import { useAuth } from '@common/hooks/useAuth';
import { API_BASE_URL } from '@constants';


export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
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
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
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
    </Box>
  );
}
