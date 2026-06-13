import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useGetStudentMarksQuery, useGetExamSchedulesQuery, useGetReportCardsQuery } from '@api/examApi';
import { useGetSchoolsQuery } from '@api/schoolsApi';
import { ReportCardContent } from '../components/ReportCardContent';
import { FaPrint } from 'react-icons/fa';

export function PrintReportCardPage() {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('examId');
  const studentId = searchParams.get('studentId');
  const classId = searchParams.get('classId');
  const sectionId = searchParams.get('sectionId');

  const { data: schoolsRes } = useGetSchoolsQuery();
  const school = schoolsRes?.data?.[0];

  const { data: marksRes, isLoading: loadingMarks } = useGetStudentMarksQuery(
    { examId: examId as string, studentId: studentId as string },
    { skip: !examId || !studentId }
  );

  const { data: schedulesRes, isLoading: loadingSchedules } = useGetExamSchedulesQuery(
    { examId: examId as string, classId: classId as string, sectionId: sectionId as string },
    { skip: !examId || !classId || !sectionId }
  );

  const { data: reportCardsRes, isLoading: loadingCards } = useGetReportCardsQuery(
    { examId: examId as string, classId: classId as string, sectionId: sectionId as string },
    { skip: !examId || !classId || !sectionId }
  );

  const isLoading = loadingMarks || loadingSchedules || loadingCards;
  const marks = marksRes?.data || [];
  const schedules = schedulesRes?.data || [];
  const reportCard = reportCardsRes?.data?.find(rc => rc.studentId._id === studentId);

  useEffect(() => {
    // Only auto-print if data is successfully loaded and we have a report card
    if (!isLoading && reportCard) {
      // Small timeout to allow images/fonts to render
      setTimeout(() => window.print(), 500);
    }
  }, [isLoading, reportCard]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography>Generating printable report card...</Typography>
      </Box>
    );
  }

  if (!reportCard) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" color="error">Report Card Not Found</Typography>
        <Typography variant="body2" color="text.secondary">The requested report card could not be loaded or generated.</Typography>
        <Button variant="outlined" onClick={() => window.close()}>Close Tab</Button>
      </Box>
    );
  }

  return (
    <>
      <Box className="no-print" sx={{ p: 2, bgcolor: 'var(--color-bg-subtle)', display: 'flex', justifyContent: 'center', gap: 2, borderBottom: '1px solid var(--color-border-subtle)' }}>
        <Button variant="contained" startIcon={<FaPrint />} onClick={() => window.print()} sx={{ textTransform: 'none' }}>
          Print / Save PDF
        </Button>
        <Button variant="outlined" onClick={() => window.close()} sx={{ textTransform: 'none' }}>
          Close Tab
        </Button>
      </Box>
      
      <Box id="printable-report-card">
        <ReportCardContent 
          reportCard={reportCard}
          marks={marks}
          schedules={schedules}
          school={school}
          isLoading={false}
        />
      </Box>

      <style>
        {`
          body {
            background-color: var(--color-bg-subtle);
          }
          @media print {
            @page { margin: 10mm; size: auto; }
            body * { visibility: hidden; }
            #printable-report-card, #printable-report-card * { visibility: visible; }
            #printable-report-card { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
            body { background-color: white; }
          }
        `}
      </style>
    </>
  );
}
