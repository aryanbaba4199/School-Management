import { TablePagination, Box } from '@mui/material';
import styled from 'styled-components';

const FooterBox = styled(Box)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-top: 1px solid var(--color-border-default);
  background-color: var(--color-background-paper);
  padding: 8px 16px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

interface DatatableFooterProps {
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
}

export default function DatatableFooter({
  page,
  rowsPerPage,
  totalCount,
  onChangePage,
  onChangeRowsPerPage,
  rowsPerPageOptions = [5, 10, 25, 50],
}: DatatableFooterProps) {
  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    onChangePage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChangeRowsPerPage(parseInt(event.target.value, 10));
  };

  return (
    <FooterBox>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        sx={{
          color: 'var(--color-text-primary)',
          '.MuiTablePagination-selectIcon': {
            color: 'var(--color-text-secondary)',
          },
          '.MuiIconButton-root': {
            color: 'var(--color-text-secondary)',
            '&.Mui-disabled': {
              color: 'var(--color-text-disabled)',
            },
          },
        }}
      />
    </FooterBox>
  );
}
