import { DialogContent, Button, Box } from '@mui/material';
import { useGetStudentMarksQuery, useGetExamSchedulesQuery } from '@api/examApi';
import { useGetSchoolsQuery } from '@api/schoolsApi';
import type { IReportCard } from '@api/examApi';
import { FaPrint } from 'react-icons/fa';
import { ReportCardContent } from './ReportCardContent';

interface ReportCardDialogProps {
  onClose: () => void;
  reportCard: IReportCard;
}

export function ReportCardDialog({ onClose, reportCard }: ReportCardDialogProps) {
  const { examId, studentId, classId, sectionId } = reportCard;

  const { data: marksRes, isLoading: loadingMarks } = useGetStudentMarksQuery({
    examId: examId._id,
    studentId: studentId._id
  });

  const { data: schedulesRes, isLoading: loadingSchedules } = useGetExamSchedulesQuery({
    examId: examId._id,
    classId: classId._id,
    sectionId: sectionId._id
  });

  const { data: schoolsRes } = useGetSchoolsQuery();
  const school = schoolsRes?.data?.[0]; // Get current school

  const marks = marksRes?.data || [];
  const schedules = schedulesRes?.data || [];

  const isLoading = loadingMarks || loadingSchedules;

  const handlePrint = () => {
    // Open the dedicated print page in a new tab
    const url = `/print/report-card?examId=${examId._id}&studentId=${studentId._id}&classId=${classId._id}&sectionId=${sectionId._id}`;
    window.open(url, '_blank');
  };

  return (
    <DialogContent sx={{ p: 0, bgcolor: 'var(--color-bg-subtle)' }}>
      <Box sx={{ maxWidth: 850, mx: 'auto', p: { xs: 3, md: 5 } }}>
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4, borderBottom: '1px solid var(--color-border-subtle)', pb: 2 }}>
          <Button variant="outlined" onClick={onClose} sx={{ textTransform: 'none', borderRadius: '8px' }}>Close</Button>
          <Button variant="contained" startIcon={<FaPrint />} onClick={handlePrint} sx={{ textTransform: 'none', borderRadius: '8px' }}>Print Report</Button>
        </Box>

        <ReportCardContent 
          reportCard={reportCard} 
          marks={marks} 
          schedules={schedules} 
          school={school as unknown as null} 
          isLoading={isLoading} 
        />
      </Box>
    </DialogContent>
  );
}
