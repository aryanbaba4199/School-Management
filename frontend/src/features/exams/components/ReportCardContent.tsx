import { Box, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import type { IReportCard } from '@api/examApi';
import dayjs from 'dayjs';

interface ReportCardContentProps {
  reportCard: IReportCard;
  marks: any[];
  schedules: any[];
  school: any;
  isLoading: boolean;
}

export function ReportCardContent({ reportCard, marks, schedules, school, isLoading }: ReportCardContentProps) {
  const { examId, studentId, classId, sectionId } = reportCard;

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', bgcolor: 'var(--color-bg-default)', minHeight: 'auto', p: { xs: 3, md: 5 }, position: 'relative', boxShadow: 'none', borderRadius: 0, m: '0 auto' }}>
      {/* School Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'var(--color-text-primary)', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
          {school?.name || 'School Name Not Found'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {school?.address?.street ? `${school?.address?.street}, ` : ''}
          {typeof school?.address?.city === 'object' ? school.address.city.name : school?.address?.city || ''}
          {school?.address?.pincode ? ` - ${school.address.pincode}` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {school?.contactEmail ? `Email: ${school.contactEmail}` : ''} 
          {school?.contactPhone ? ` | Phone: ${school.contactPhone}` : ''}
        </Typography>
        <Divider sx={{ my: 3, borderWidth: 2, borderColor: 'var(--color-border-default)' }} />
        <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--color-primary-main)' }}>
          {examId.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary' }}>Academic Session: {examId.academicYear}</Typography>
      </Box>

      {/* Student Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, p: 2.5, bgcolor: 'var(--color-bg-subtle)', borderRadius: 2, border: '1px solid var(--color-border-subtle)' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Student Name</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>{studentId.name}</Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Enrollment No.</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{studentId.userCode}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Class & Section</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>{classId.name} - {sectionId.name}</Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Date of Issue</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{dayjs(reportCard.generatedAt).format('DD MMMM YYYY')}</Typography>
        </Box>
      </Box>

      {/* Marks Table */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, borderBottom: '2px solid var(--color-border-default)', pb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Academic Performance</Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Table size="small" sx={{ 
            '& .MuiTableCell-root': { borderBottom: '1px solid var(--color-border-subtle)', py: 1.5 },
            '& .MuiTableHead-root .MuiTableCell-root': { fontWeight: 800, bgcolor: 'var(--color-bg-subtle)', borderBottom: '2px solid var(--color-border-default)' }
          }}>
            <TableHead>
              <TableRow>
                <TableCell>SUBJECT</TableCell>
                <TableCell align="center">MAX MARKS</TableCell>
                <TableCell align="center">PASS MARKS</TableCell>
                <TableCell align="center">MARKS OBTAINED</TableCell>
                <TableCell align="center">REMARKS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map(schedule => {
                const mark = marks.find(m => m.subjectId._id === schedule.subjectId._id);
                return (
                  <TableRow key={schedule._id}>
                    <TableCell sx={{ fontWeight: 600 }}>{schedule.subjectId.name}</TableCell>
                    <TableCell align="center" sx={{ color: 'text.secondary' }}>{schedule.maxMarks}</TableCell>
                    <TableCell align="center" sx={{ color: 'text.secondary' }}>{schedule.passMarks}</TableCell>
                    <TableCell align="center" sx={{ 
                      fontWeight: 800, 
                      color: mark?.attendanceStatus === 'ABSENT' ? 'var(--color-error-main)' : 
                             (mark && mark.obtainedMarks !== undefined && mark.obtainedMarks < schedule.passMarks) ? 'var(--color-error-main)' : 'var(--color-text-primary)' 
                    }}>
                      {mark?.attendanceStatus === 'ABSENT' ? 'ABSENT' : mark?.obtainedMarks ?? '-'}
                    </TableCell>
                    <TableCell align="center" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.85rem' }}>{mark?.remarks || '-'}</TableCell>
                  </TableRow>
                );
              })}
              
              {/* Totals Row */}
              <TableRow sx={{ '& .MuiTableCell-root': { borderTop: '2px solid var(--color-border-default)', borderBottom: 'none', pt: 3, pb: 1 } }}>
                <TableCell sx={{ fontWeight: 900, fontSize: '1rem' }}>GRAND TOTAL</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{reportCard.totalMarks}</TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-primary-main)' }}>{reportCard.obtainedMarks}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Box>

      {/* Results Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Box sx={{ flex: 1, p: 2, bgcolor: 'var(--color-bg-subtle)', borderRadius: 2, border: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>Overall Percentage</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>{reportCard.percentage.toFixed(2)}%</Typography>
        </Box>
        <Box sx={{ flex: 1, p: 2, bgcolor: reportCard.result === 'PASS' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)', borderRadius: 2, border: '1px solid', borderColor: reportCard.result === 'PASS' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: reportCard.result === 'PASS' ? '#2e7d32' : '#c62828', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>Final Result</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: reportCard.result === 'PASS' ? '#2e7d32' : '#c62828' }}>{reportCard.result}</Typography>
        </Box>
        <Box sx={{ flex: 1, p: 2, bgcolor: 'var(--color-bg-subtle)', borderRadius: 2, border: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>Class Rank / Grade</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>{reportCard.rank || '-'}{reportCard.rank ? ' / ' : ''}{reportCard.grade || '-'}</Typography>
        </Box>
      </Box>

      {/* Signatures */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, px: 6 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ width: 150, borderBottom: '2px solid var(--color-border-default)', mb: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>Class Teacher</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ width: 150, borderBottom: '2px solid var(--color-border-default)', mb: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>Principal</Typography>
        </Box>
      </Box>
    </Box>
  );
}
