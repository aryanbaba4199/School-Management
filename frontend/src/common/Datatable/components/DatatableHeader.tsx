import { Box, TextField, Button, ButtonGroup, InputAdornment } from '@mui/material';
import { FaSearch, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import styled from 'styled-components';

const HeaderBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SearchInput = styled(TextField)`
  min-width: 280px;
  max-width: 400px;
  flex-grow: 1;
  & .MuiOutlinedInput-root {
    border-radius: 8px !important;
    background-color: var(--color-background-paper) !important;
  }
`;

const ExportGroup = styled(ButtonGroup)`
  border-radius: 8px !important;
  & .MuiButton-root {
    text-transform: none !important;
    font-weight: 600 !important;
    border-color: var(--color-border-default) !important;
  }
`;

interface DatatableHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  searchPlaceholder?: string;
}

export default function DatatableHeader({
  searchValue,
  onSearchChange,
  onExportCSV,
  onExportPDF,
  searchPlaceholder = 'Search records...',
}: DatatableHeaderProps) {
  return (
    <HeaderBox>
      <SearchInput
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        size="small"
        variant="outlined"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch style={{ color: 'var(--color-text-secondary)' }} />
              </InputAdornment>
            ),
          },
        }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <ExportGroup variant="outlined" size="small">
          {onExportCSV && (
            <Button startIcon={<FaFileCsv />} onClick={onExportCSV}>
              CSV
            </Button>
          )}
          {onExportPDF && (
            <Button startIcon={<FaFilePdf />} onClick={onExportPDF}>
              PDF
            </Button>
          )}
        </ExportGroup>
      </Box>
    </HeaderBox>
  );
}
