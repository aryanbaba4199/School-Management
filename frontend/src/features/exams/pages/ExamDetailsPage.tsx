import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Tabs, Tab, CircularProgress, Chip } from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa';
import { PageWrapper } from '@common/Datatable';
import { useGetExamsQuery, useGetExamSchedulesQuery } from '@api/examApi';
import type { IExamSchedule } from '@api/examApi';
import { useGetClassesQuery, useGetSectionsQuery } from '@api/classesApi';
import dayjs from 'dayjs';
import { Datatable, DatatableHeader, ActionMenu } from '@common/Datatable';
import { useDialog } from '@common/Dialogs/dialog.provider';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const TimetableTab = ({ examId }: { examId: string }) => {
  const { openDialog } = useDialog();
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');

  const { data: classesRes } = useGetClassesQuery();
  const classes = classesRes?.data || [];

  const { data: sectionsRes } = useGetSectionsQuery({ classId: classId || undefined }, { skip: !classId });
  const sections = sectionsRes?.data || [];

  const { data: schedulesRes, isLoading } = useGetExamSchedulesQuery(
    { examId, classId: classId || undefined, sectionId: sectionId || undefined },
    { skip: !examId }
  );
  const schedules = schedulesRes?.data || [];

  const columns = [
    { id: 'examDate', label: 'Date', render: (row: IExamSchedule) => dayjs(row.examDate).format('DD MMM YYYY') },
    { id: 'subjectId', label: 'Subject', render: (row: IExamSchedule) => row.subjectId?.name },
    { id: 'time', label: 'Time', render: (row: IExamSchedule) => `${row.startTime} - ${row.endTime}` },
    { id: 'room', label: 'Room', render: (row: IExamSchedule) => row.room || '-' },
    { id: 'marks', label: 'Marks (Max/Pass)', render: (row: IExamSchedule) => `${row.maxMarks} / ${row.passMarks}` },
    { id: 'classSection', label: 'Class/Section', render: (row: IExamSchedule) => `${row.classId?.name} - ${row.sectionId?.name}` },
    { id: 'actions', label: 'Actions', align: 'center', render: (row: IExamSchedule) => (
      <ActionMenu 
        items={[
          { 
            label: 'Edit', 
            onClick: () => openDialog('SCHEDULE_SUBJECT_FORM', { examId, classId, sectionId, schedule: row }), 
            color: 'primary' 
          }
        ]}
      />
    )}
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter Class</InputLabel>
          <Select value={classId} label="Filter Class" onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}>
            <MenuItem value="">All Classes</MenuItem>
            {classes.map(c => (
              <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 200 }} disabled={!classId}>
          <InputLabel>Filter Section</InputLabel>
          <Select value={sectionId} label="Filter Section" onChange={(e) => setSectionId(e.target.value)}>
            <MenuItem value="">All Sections</MenuItem>
            {sections.map(s => (
              <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          variant="contained" 
          onClick={() => openDialog('SCHEDULE_SUBJECT_FORM', { examId, classId, sectionId })}
          disabled={!classId || !sectionId}
        >
          Schedule Subject
        </Button>
      </Box>

      {(!classId || !sectionId) && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select a specific Class and Section to schedule new subjects.
        </Typography>
      )}

      <Datatable<IExamSchedule>
        columns={columns}
        data={schedules}
        loading={isLoading}
        tableName="examSchedules"
      />
    </Box>
  );
};
import { useGetUsersQuery } from '@api/usersApi';
import { useSaveStudentMarksMutation, useGetStudentMarksQuery, useGenerateResultsMutation, useGetReportCardsQuery } from '@api/examApi';
import type { IReportCard } from '@api/examApi';
import { TextField, Switch } from '@mui/material';

const MarksEntryTab = ({ examId }: { examId: string }) => {
  const { showSuccess, showError } = useNotifier();
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [examScheduleId, setExamScheduleId] = useState('');
  const [marksState, setMarksState] = useState<Record<string, { obtainedMarks: number | ''; remarks: string; attendanceStatus: 'PRESENT' | 'ABSENT' }>>({});

  const { data: classesRes } = useGetClassesQuery();
  const classes = classesRes?.data || [];

  const { data: sectionsRes } = useGetSectionsQuery({ classId: classId || undefined }, { skip: !classId });
  const sections = sectionsRes?.data || [];

  const { data: schedulesRes } = useGetExamSchedulesQuery(
    { examId, classId: classId || undefined, sectionId: sectionId || undefined },
    { skip: !examId || !classId || !sectionId }
  );
  const schedules = schedulesRes?.data || [];
  const selectedSchedule = schedules.find(s => s._id === examScheduleId);

  const { data: usersRes, isLoading: loadingUsers } = useGetUsersQuery(
    { role: 'STUDENT', classId: classId || undefined, sectionId: sectionId || undefined, limit: 100 },
    { skip: !classId || !sectionId }
  );
  const students = usersRes?.data || [];

  const { data: marksRes, isLoading: loadingMarks } = useGetStudentMarksQuery(
    { examScheduleId },
    { skip: !examScheduleId }
  );
  const existingMarks = marksRes?.data || [];

  const [saveMarks, { isLoading: isSaving }] = useSaveStudentMarksMutation();

  // Sync existing marks into local state
  useEffect(() => {
    if (students.length > 0 && selectedSchedule) {
      const newState: typeof marksState = {};
      students.forEach(student => {
        const existing = existingMarks.find(m => m.studentId._id === student._id);
        newState[student._id] = {
          obtainedMarks: existing?.obtainedMarks ?? '',
          remarks: existing?.remarks || '',
          attendanceStatus: existing?.attendanceStatus || 'PRESENT'
        };
      });
      setMarksState(newState);
    }
  }, [students, existingMarks, selectedSchedule]);

  const handleSave = async () => {
    if (!selectedSchedule) return;

    const marksData = Object.entries(marksState).map(([studentId, data]) => ({
      studentId,
      obtainedMarks: data.obtainedMarks === '' ? undefined : Number(data.obtainedMarks),
      remarks: data.remarks,
      attendanceStatus: data.attendanceStatus,
    }));

    try {
      await saveMarks({
        examId,
        examScheduleId: selectedSchedule._id,
        classId,
        sectionId,
        subjectId: selectedSchedule.subjectId._id,
        maxMarks: selectedSchedule.maxMarks,
        marksData,
      }).unwrap();
      showSuccess('Marks saved successfully');
    } catch (err: any) {
      showError(err?.data?.error || 'Failed to save marks');
    }
  };

  const columns = [
    { id: 'rollNo', label: 'Code', render: (row: any) => row.userCode },
    { id: 'name', label: 'Student Name', render: (row: any) => row.name },
    { id: 'attendance', label: 'Attendance', render: (row: any) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Switch 
          checked={marksState[row._id]?.attendanceStatus === 'PRESENT'}
          onChange={(e) => setMarksState(prev => ({
            ...prev,
            [row._id]: { ...prev[row._id], attendanceStatus: e.target.checked ? 'PRESENT' : 'ABSENT' }
          }))}
          color="success"
          size="small"
        />
        <Typography variant="body2" sx={{ width: 50, color: marksState[row._id]?.attendanceStatus === 'PRESENT' ? 'success.main' : 'error.main' }}>
          {marksState[row._id]?.attendanceStatus}
        </Typography>
      </Box>
    )},
    { id: 'obtainedMarks', label: `Obtained (Max: ${selectedSchedule?.maxMarks || 0})`, render: (row: any) => (
      <TextField 
        size="small"
        type="number"
        disabled={marksState[row._id]?.attendanceStatus === 'ABSENT'}
        value={marksState[row._id]?.obtainedMarks}
        onChange={(e) => setMarksState(prev => ({
          ...prev,
          [row._id]: { ...prev[row._id], obtainedMarks: e.target.value === '' ? '' : Number(e.target.value) }
        }))}
        sx={{ width: 100 }}
      />
    )},
    { id: 'remarks', label: 'Remarks', render: (row: any) => (
      <TextField 
        size="small"
        value={marksState[row._id]?.remarks}
        onChange={(e) => setMarksState(prev => ({
          ...prev,
          [row._id]: { ...prev[row._id], remarks: e.target.value }
        }))}
        fullWidth
      />
    )}
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter Class</InputLabel>
          <Select value={classId} label="Filter Class" onChange={(e) => { setClassId(e.target.value); setSectionId(''); setExamScheduleId(''); }}>
            <MenuItem value="">Select Class</MenuItem>
            {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!classId}>
          <InputLabel>Filter Section</InputLabel>
          <Select value={sectionId} label="Filter Section" onChange={(e) => { setSectionId(e.target.value); setExamScheduleId(''); }}>
            <MenuItem value="">Select Section</MenuItem>
            {sections.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }} disabled={!sectionId}>
          <InputLabel>Select Subject</InputLabel>
          <Select value={examScheduleId} label="Select Subject" onChange={(e) => setExamScheduleId(e.target.value)}>
            <MenuItem value="">Select Subject</MenuItem>
            {schedules.map(s => <MenuItem key={s._id} value={s._id}>{s.subjectId.name} ({s.maxMarks} marks)</MenuItem>)}
          </Select>
        </FormControl>
        
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!examScheduleId || isSaving || students.length === 0}
        >
          {isSaving ? 'Saving...' : 'Save Marks'}
        </Button>
      </Box>

      {!examScheduleId ? (
        <Typography variant="body2" color="text.secondary">
          Select a class, section, and subject to begin entering marks.
        </Typography>
      ) : (
        <Datatable<any>
          columns={columns}
          data={students}
          loading={loadingUsers || loadingMarks}
          tableName="marksEntry"
        />
      )}
    </Box>
  );
};

const ResultsTab = ({ examId }: { examId: string }) => {
  const { showSuccess, showError } = useNotifier();
  const { openDialog } = useDialog();
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');

  const { data: classesRes } = useGetClassesQuery();
  const classes = classesRes?.data || [];

  const { data: sectionsRes } = useGetSectionsQuery({ classId: classId || undefined }, { skip: !classId });
  const sections = sectionsRes?.data || [];

  const { data: reportCardsRes, isLoading: loadingReports } = useGetReportCardsQuery(
    { examId, classId, sectionId },
    { skip: !examId || !classId || !sectionId }
  );
  
  const [generateResults, { isLoading: isGenerating }] = useGenerateResultsMutation();

  const reportCards = reportCardsRes?.data || [];

  const handleGenerate = async () => {
    try {
      await generateResults({ examId, classId, sectionId }).unwrap();
      showSuccess('Results generated successfully');
    } catch (err: any) {
      showError(err?.data?.error || 'Failed to generate results. Make sure marks are entered for all subjects.');
    }
  };

  const columns = [
    { id: 'student', label: 'Student Name', render: (row: IReportCard) => row.studentId?.name },
    { id: 'totalMarks', label: 'Marks', render: (row: IReportCard) => `${row.obtainedMarks} / ${row.totalMarks}` },
    { id: 'percentage', label: 'Percentage', render: (row: IReportCard) => `${row.percentage.toFixed(2)}%` },
    { id: 'grade', label: 'Grade', render: (row: IReportCard) => <Chip label={row.grade || '-'} size="small" /> },
    { id: 'rank', label: 'Rank', render: (row: IReportCard) => row.rank || '-' },
    { 
      id: 'result', 
      label: 'Result', 
      render: (row: IReportCard) => (
        <Chip 
          label={row.result} 
          size="small" 
          color={row.result === 'PASS' ? 'success' : 'error'} 
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (row: IReportCard) => (
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => openDialog('REPORT_CARD_VIEW', { reportCard: row })}
        >
          View Card
        </Button>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
        <DatatableHeader title="Results & Reports" />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select Class</InputLabel>
          <Select value={classId} label="Select Class" onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}>
            {classes.map(c => (
              <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 200 }} disabled={!classId}>
          <InputLabel>Select Section</InputLabel>
          <Select value={sectionId} label="Select Section" onChange={(e) => setSectionId(e.target.value)}>
            {sections.map(s => (
              <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          variant="contained" 
          onClick={handleGenerate}
          disabled={!classId || !sectionId || isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Results'}
        </Button>
      </Box>

      {(!classId || !sectionId) ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select a specific Class and Section to view or generate results.
        </Typography>
      ) : reportCards.length === 0 && !loadingReports ? (
        <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--color-bg-subtle)', borderRadius: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            No report cards found for this class and section.
          </Typography>
          <Button variant="outlined" onClick={handleGenerate} disabled={isGenerating}>
            Generate Results Now
          </Button>
        </Box>
      ) : (
        <Datatable<IReportCard>
          columns={columns}
          data={reportCards}
          loading={loadingReports}
          tableName="reportCards"
        />
      )}
    </Box>
  );
};

export function ExamDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const { data: res, isLoading } = useGetExamsQuery();
  const exam = res?.data?.find(e => e._id === id);

  if (isLoading) {
    return (
      <PageWrapper title="Loading Exam...">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      </PageWrapper>
    );
  }

  if (!exam) {
    return (
      <PageWrapper title="Exam Not Found">
        <Box sx={{ textAlign: 'center', p: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            We couldn't find the examination you are looking for.
          </Typography>
          <Button variant="outlined" startIcon={<FaArrowLeft />} onClick={() => navigate('/exams')}>
            Back to Exams
          </Button>
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title={exam.name}
      actions={[
        { label: 'Back to Exams', onClick: () => navigate('/exams'), variant: 'outlined' }
      ]}
    >
      <Box sx={{ 
        bgcolor: 'var(--color-bg-subtle)', 
        borderRadius: '16px', 
        p: 3, 
        mb: 4,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        border: '1px solid var(--color-border-subtle)'
      }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Academic Year</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{exam.academicYear}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Term</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{exam.term}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Duration</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {dayjs(exam.startDate).format('DD MMM YYYY')} - {dayjs(exam.endDate).format('DD MMM YYYY')}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Status</Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip 
              label={exam.status} 
              size="small"
              color={
                exam.status === 'COMPLETED' ? 'success' : 
                exam.status === 'ONGOING' ? 'warning' : 
                exam.status === 'SCHEDULED' ? 'info' : 'default'
              } 
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label="Timetable Schedule" sx={{ fontWeight: 600 }} />
          <Tab label="Marks Entry" sx={{ fontWeight: 600 }} />
          <Tab label="Results & Reports" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {activeTab === 0 && <TimetableTab examId={exam._id} />}
      {activeTab === 1 && <MarksEntryTab examId={exam._id} />}
      {activeTab === 2 && <ResultsTab examId={exam._id} />}

    </PageWrapper>
  );
}
