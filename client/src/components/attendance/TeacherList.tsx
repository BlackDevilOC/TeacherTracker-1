import React, { useState } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { TeacherWithAttendance } from '@/types';
import { getCurrentDate } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  X, 
  Phone, 
  MoreVertical 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeacherListProps {
  date: string;
  onCountChange?: (count: { total: number, present: number, absent: number }) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({ date, onCountChange }) => {
  const { toast } = useToast();
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);

  const { data: teachers = [], isLoading, refetch } = useQuery({
    queryKey: [`/api/attendance?date=${date}`],
    // Default query function from setup
  });

  // Update parent component with counts
  React.useEffect(() => {
    if (teachers.length > 0) {
      const presentCount = teachers.filter(
        (teacher: TeacherWithAttendance) => teacher.status === 'present'
      ).length;
      
      onCountChange?.({
        total: teachers.length,
        present: presentCount,
        absent: teachers.length - presentCount
      });
    }
  }, [teachers, onCountChange]);

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ teacherId, status }: { teacherId: number, status: 'present' | 'absent' }) => {
      return apiRequest('POST', '/api/attendance', {
        teacherId,
        date,
        status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/attendance?date=${date}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity-logs'] });
      toast({
        title: 'Attendance Updated',
        description: 'Teacher attendance has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update attendance',
        variant: 'destructive',
      });
    }
  });

  const markAttendance = (teacherId: number, status: 'present' | 'absent') => {
    setSelectedTeacher(teacherId);
    updateAttendanceMutation.mutate({ teacherId, status });
  };

  // Generate initials for a teacher
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {teachers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No teachers found. Import teachers from the Data Import page.
            </div>
          ) : (
            teachers.map((teacher: TeacherWithAttendance) => (
              <div key={teacher.teacherId} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                      <span>{teacher.initials || getInitials(teacher.name)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-medium">{teacher.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      {teacher.phoneNumber ? (
                        <>
                          <Phone className="h-3 w-3 mr-1" />
                          {teacher.phoneNumber}
                        </>
                      ) : (
                        'No phone number'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex space-x-2 mr-2">
                    <Button
                      size="sm"
                      variant={teacher.status === 'present' ? 'default' : 'outline'}
                      className={`px-3 ${teacher.status === 'present' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                      onClick={() => markAttendance(teacher.teacherId, 'present')}
                      disabled={updateAttendanceMutation.isPending && selectedTeacher === teacher.teacherId}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={teacher.status === 'absent' ? 'default' : 'outline'}
                      className={`px-3 ${teacher.status === 'absent' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                      onClick={() => markAttendance(teacher.teacherId, 'absent')}
                      disabled={updateAttendanceMutation.isPending && selectedTeacher === teacher.teacherId}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        navigator.clipboard.writeText(teacher.phoneNumber || '');
                        toast({
                          title: 'Copied',
                          description: 'Phone number copied to clipboard',
                        });
                      }}>
                        Copy Phone Number
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        window.location.href = `tel:${teacher.phoneNumber}`;
                      }}>
                        Call Teacher
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherList;
