import { useState, useRef } from 'react';
import { Box, Typography, IconButton, Avatar, CircularProgress } from '@mui/material';
import { FaCamera, FaTrash } from 'react-icons/fa';

interface LogoUploadProps {
  logoUrl?: string;
  onChange: (base64String: string) => void;
  disabled?: boolean;
}

export function LogoUpload({ logoUrl, onChange, disabled }: LogoUploadProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLoading(false);
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={logoUrl || undefined}
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'var(--color-bg-subtle)',
            border: '2px dashed var(--color-border-default)',
            img: { objectFit: 'contain' }
          }}
        >
          {!logoUrl && <FaCamera size={24} color="var(--color-text-secondary)" />}
        </Avatar>
        {loading && (
          <CircularProgress 
            size={80} 
            sx={{ position: 'absolute', top: 0, left: 0, color: 'var(--color-primary-main)' }} 
          />
        )}
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          School Logo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          JPG, PNG or GIF up to 2MB
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            color="primary" 
            component="label" 
            disabled={disabled || loading}
            sx={{ border: '1px solid var(--color-border-default)', borderRadius: 1 }}
          >
            <FaCamera size={16} />
            <input 
              type="file" 
              hidden 
              accept="image/png, image/jpeg, image/gif" 
              onChange={handleFileChange} 
              ref={fileInputRef}
            />
          </IconButton>
          {logoUrl && (
            <IconButton 
              color="error" 
              onClick={handleRemove} 
              disabled={disabled || loading}
              sx={{ border: '1px solid var(--color-border-default)', borderRadius: 1 }}
            >
              <FaTrash size={16} />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}
