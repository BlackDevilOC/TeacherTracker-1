import React, { useState } from 'react';
import AttendanceControls from '@/components/attendance/AttendanceControls';
import TeacherList from '@/components/attendance/TeacherList';
import { formatDate } from '@/utils/dateUtils';
import { useQuery } from '@tanstack/react-query';

const Attendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0
  });
  
  const dateStr = formatDate(selectedDate);
  
  const { refetch } = useQuery({
    queryKey: [`/api/attendance?date=${dateStr}`],
    // Default query function from setup
  });

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleCountChange = (counts: { total: number, present: number, absent: number }) => {
    setAttendanceStats(counts);
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">
        Mark and track teacher attendance
      </p>
      
      {/* Attendance Controls */}
      <AttendanceControls 
        date={selectedDate}
        onDateChange={handleDateChange}
        stats={attendanceStats}
        onRefresh={handleRefresh}
      />
      
      {/* Teacher List */}
      <TeacherList 
        date={dateStr} 
        onCountChange={handleCountChange}
      />
    </div>
  );
};

export default Attendance;
