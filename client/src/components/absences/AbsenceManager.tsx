import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/utils/dateUtils';
import { TeacherWithAttendance, TimetableEntry } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import SubstituteAssigner from './SubstituteAssigner';

interface AbsenceManagerProps {
  date: Date;
  onRefresh: () => void;
}

const AbsenceManager: React.FC<AbsenceManagerProps> = ({ date, onRefresh }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithAttendance | null>(null);
  const [isSubstituteSheetOpen, setIsSubstituteSheetOpen] = useState(false);
  
  const dateStr = formatDate(date);
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Get absent teachers for the selected date
  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: [`/api/attendance?date=${dateStr}`],
    // Default query function from setup
  });
  
  // Get timetable for the current day
  const { data: timetable = [], isLoading: timetableLoading } = useQuery({
    queryKey: [`/api/timetable?day=${dayOfWeek}`],
    // Default query function from setup
  });
  
  // Get existing substitutions
  const { data: substitutions = [], isLoading: substitutionsLoading } = useQuery({
    queryKey: [`/api/substitutions?date=${dateStr}`],
    // Default query function from setup
  });
  
  // Filter absent teachers
  const absentTeachers = teachers.filter(
    (teacher: TeacherWithAttendance) => teacher.status === 'absent'
  );
  
  // Get classes for absent teachers
  const getClassesForTeacher = (teacherId: number) => {
    return timetable
      .filter((entry: TimetableEntry) => entry.teacherId === teacherId)
      .map((entry: TimetableEntry) => ({
        period: entry.period,
        class: entry.class,
        hasSubstitute: substitutions.some(
          (sub: any) => 
            sub.originalTeacherId === teacherId && 
            sub.period === entry.period && 
            sub.class === entry.class
        )
      }));
  };
  
  const handleAssignSubstitute = (teacher: TeacherWithAttendance) => {
    setSelectedTeacher(teacher);
    setIsSubstituteSheetOpen(true);
  };
  
  const isLoading = teachersLoading || timetableLoading || substitutionsLoading;

  return (
    <>
      <div className="flex space-x-3 mb-6">
        <Button 
          variant="outline"
          className="flex items-center"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          <span>Refresh Data</span>
        </Button>
        
        <Sheet open={isSubstituteSheetOpen} onOpenChange={setIsSubstituteSheetOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              <span>Assign Substitute</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Assign Substitute Teacher</SheetTitle>
              <SheetDescription>
                Select a substitute teacher to cover classes for the absent teacher.
              </SheetDescription>
            </SheetHeader>
            {selectedTeacher && (
              <SubstituteAssigner 
                teacher={selectedTeacher}
                date={date}
                onAssigned={() => setIsSubstituteSheetOpen(false)}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Absent Teachers Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
              ))}
            </div>
          ) : absentTeachers.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <RefreshCw className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Absences Reported</h3>
              <p className="text-gray-500 text-sm">
                All teachers are present today. Check back later for any updates.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {absentTeachers.map((teacher: TeacherWithAttendance) => {
                    const classes = getClassesForTeacher(teacher.teacherId);
                    const allClassesHaveSubstitutes = classes.length > 0 && 
                      classes.every(c => c.hasSubstitute);
                    
                    return (
                      <tr key={teacher.teacherId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center">
                              <span>{teacher.initials}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{teacher.name}</div>
                              <div className="text-sm text-gray-500">
                                {teacher.phoneNumber || 'No phone number'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {classes.length === 0 ? (
                            <span className="text-gray-500 text-sm">No classes today</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {classes.map((c, idx) => (
                                <Badge key={idx} variant="outline" className={`
                                  text-xs rounded-full
                                  ${c.hasSubstitute 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'}
                                `}>
                                  Period {c.period}: {c.class}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className={`
                            text-xs rounded-full px-2 py-1
                            ${classes.length === 0
                              ? 'bg-gray-100 text-gray-800'
                              : allClassesHaveSubstitutes
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'}
                          `}>
                            {classes.length === 0
                              ? 'No Classes'
                              : allClassesHaveSubstitutes
                                ? 'All Assigned'
                                : 'Pending Assignment'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button 
                            variant="link" 
                            className="text-primary p-0 h-auto"
                            onClick={() => handleAssignSubstitute(teacher)}
                            disabled={classes.length === 0}
                          >
                            Assign Substitute
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Button 
        className="w-full flex items-center justify-center"
        onClick={() => window.location.href = '/absences/view'}
      >
        <span>View Assigned Substitutes</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2 h-4 w-4"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Button>
    </>
  );
};

export default AbsenceManager;
