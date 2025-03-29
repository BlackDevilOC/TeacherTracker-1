import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getCurrentDate } from '@/utils/dateUtils';
import { TeacherWithAttendance } from '@/types';

const StatusCard: React.FC<{
  title: string;
  count: number;
  status?: string;
  statusColor?: string;
}> = ({ title, count, status, statusColor = 'text-gray-500' }) => (
  <Card>
    <CardContent className="p-6">
      <h3 className="font-medium text-gray-500 mb-3">{title}</h3>
      <div className="flex items-end">
        <span className="text-3xl font-bold mr-2">{count}</span>
        {status && <span className={`text-sm ${statusColor}`}>{status}</span>}
      </div>
    </CardContent>
  </Card>
);

const StatusOverview: React.FC = () => {
  const currentDate = getCurrentDate();
  
  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: [`/api/attendance?date=${currentDate}`],
    // Default query function from setup
  });
  
  const { data: timetable = [], isLoading: timetableLoading } = useQuery({
    queryKey: [`/api/timetable?day=${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`],
    // Default query function from setup
  });

  const { data: substitutions = [], isLoading: substitutionsLoading } = useQuery({
    queryKey: [`/api/substitutions?date=${currentDate}`],
    // Default query function from setup
  });

  // Count of all teachers
  const teacherCount = teachers.length;
  
  // Count of absent teachers
  const absentTeacherCount = teachers.filter(
    (teacher: TeacherWithAttendance) => teacher.status === 'absent'
  ).length;
  
  // Determine teacher status message
  const getTeacherStatusMessage = () => {
    if (teachersLoading) return 'Loading...';
    if (absentTeacherCount === 0) return 'All Present';
    return `${absentTeacherCount} Absent`;
  };
  
  // Count of all classes today
  const classCount = timetableLoading ? '...' : timetable.length;
  
  // Count of substitutions
  const substitutionCount = substitutionsLoading ? '...' : substitutions.length;
  
  // Determine substitution status message
  const getSubstitutionStatusMessage = () => {
    if (substitutionsLoading) return 'Loading...';
    if (substitutionCount === 0) return 'None Required';
    return 'Assigned';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatusCard
        title="Teachers"
        count={teacherCount}
        status={getTeacherStatusMessage()}
        statusColor={absentTeacherCount === 0 ? 'text-secondary' : 'text-amber-500'}
      />
      
      <StatusCard
        title="Classes Today"
        count={classCount as number}
        status="Scheduled"
      />
      
      <StatusCard
        title="Substitutions"
        count={substitutionCount as number}
        status={getSubstitutionStatusMessage()}
        statusColor={substitutionCount === 0 ? 'text-gray-500' : 'text-amber-500'}
      />
    </div>
  );
};

export default StatusOverview;
