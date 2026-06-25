import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { FaTrash, FaPaperclip } from 'react-icons/fa';

export interface IFileAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface AttachmentListProps {
  attachments: IFileAttachment[];
  onChange: (attachments: IFileAttachment[]) => void;
  readOnly?: boolean;
}

export const AttachmentList: React.FC<AttachmentListProps> = React.memo(({ attachments, onChange, readOnly = false }) => {
  const [isUploading, setIsUploading] = useState(false);

  // Mock Upload Handler
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);

      // Simulate a network request to an S3/Local Multer Bucket
      setTimeout(() => {
        const newAttachment: IFileAttachment = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
          fileUrl: URL.createObjectURL(file), // Mock URL for demonstration
        };

        onChange([...attachments, newAttachment]);
        setIsUploading(false);
        // Reset input so the same file can be uploaded again if needed
        event.target.value = '';
      }, 1000);
    },
    [attachments, onChange]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newAttachments = [...attachments];
      newAttachments.splice(index, 1);
      onChange(newAttachments);
    },
    [attachments, onChange]
  );

  return (
    <Box sx={{ mt: 2 }}>
      {!readOnly && (
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<FaPaperclip />}
            disabled={isUploading}
            sx={{ borderRadius: '12px' }}
          >
            {isUploading ? 'Uploading...' : 'Attach File'}
            <input type="file" hidden onChange={handleFileUpload} />
          </Button>
          <Typography variant="body2" color="textSecondary">
            Max 5MB per file.
          </Typography>
        </Box>
      )}

      {attachments.length > 0 && (
        <List dense sx={{ mt: 1, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          {attachments.map((attachment, index) => (
            <ListItem key={index} divider={index !== attachments.length - 1}>
              <ListItemText
                primary={attachment.fileName}
                secondary={`${(attachment.fileSize / 1024 / 1024).toFixed(2)} MB`}
              />
              <ListItemSecondaryAction>
                {!readOnly ? (
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemove(index)} color="error">
                    <FaTrash size={16} />
                  </IconButton>
                ) : (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => window.open(attachment.fileUrl, '_blank')}
                  >
                    View
                  </Button>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
});

AttachmentList.displayName = 'AttachmentList';
