import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, RefreshCw, Download } from 'lucide-react';
import { format } from 'date-fns';
import { generateCSV } from '@/utils/csvParser';
import { TeacherWithAttendance } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface AttendanceControlsProps {
  date: Date;
  onDateChange: (date: Date) => void;
  stats: {
    total: number;
    present: number;
    absent: number;
  };
  onRefresh: () => void;
}

const AttendanceControls: React.FC<AttendanceControlsProps> = ({ 
  date, 
  onDateChange, 
  stats, 
  onRefresh 
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const formattedDate = format(date, 'MMMM do, yyyy');
  
  const dateStr = format(date, 'yyyy-MM-dd');
  const { data: teachers = [] } = useQuery({
    queryKey: [`/api/attendance?date=${dateStr}`],
    // Default query function from setup
  });

  const handleExportToExcel = () => {
    const headers = ['ID', 'Name', 'Phone Number', 'Status', 'Date'];
    
    const data = teachers.map((teacher: TeacherWithAttendance) => [
      teacher.teacherId,
      teacher.name,
      teacher.phoneNumber || 'N/A',
      teacher.status,
      dateStr
    ]);
    
    generateCSV(
      data,
      headers,
      `teacher-attendance-${dateStr}.csv`
    );
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="bg-blue-50 text-primary px-4 py-2 rounded-lg font-medium flex items-center">
        <span>Total Teachers: {stats.total}</span>
        {stats.total > 0 && (
          <>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-green-600">{stats.present} Present</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-red-600">{stats.absent} Absent</span>
          </>
        )}
      </div>
      <div className="flex space-x-2">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>{formattedDate}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  onDateChange(newDate);
                  setIsCalendarOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button className="bg-primary" onClick={handleExportToExcel}>
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>
    </div>
  );
};

export default AttendanceControls;
