import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { TeacherWithAttendance, TimetableEntry } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';

interface SubstituteAssignerProps {
  teacher: TeacherWithAttendance;
  date: Date;
  onAssigned: () => void;
}

interface ClassToSubstitute {
  period: number;
  class: string;
  hasSubstitute: boolean;
}

const SubstituteAssigner: React.FC<SubstituteAssignerProps> = ({ 
  teacher, 
  date,
  onAssigned 
}) => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<ClassToSubstitute | null>(null);
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<string>('');
  
  const dateStr = formatDate(date);
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Get timetable for the absent teacher
  const { data: timetable = [] } = useQuery({
    queryKey: [`/api/timetable?day=${dayOfWeek}&teacherId=${teacher.teacherId}`],
    // Default query function from setup
  });
  
  // Get existing substitutions
  const { data: substitutions = [] } = useQuery({
    queryKey: [`/api/substitutions?date=${dateStr}`],
    // Default query function from setup
  });
  
  // Get all teachers for substitute selection
  const { data: allTeachers = [] } = useQuery({
    queryKey: ['/api/teachers'],
    // Default query function from setup
  });
  
  // Filter out the absent teacher and already assigned substitutes
  const availableSubstitutes = allTeachers
    .filter((t: any) => 
      t.id !== teacher.teacherId && 
      !substitutions.some((s: any) => 
        s.substituteTeacherId === t.id && 
        selectedClass && 
        s.period === selectedClass.period
      )
    );
  
  // Get classes for the absent teacher
  const classesToSubstitute: ClassToSubstitute[] = timetable
    .map((entry: TimetableEntry) => ({
      period: entry.period,
      class: entry.class,
      hasSubstitute: substitutions.some(
        (sub: any) => 
          sub.originalTeacherId === teacher.teacherId && 
          sub.period === entry.period && 
          sub.class === entry.class
      )
    }));
  
  // Set first available class as selected by default
  useEffect(() => {
    const firstAvailableClass = classesToSubstitute.find(c => !c.hasSubstitute);
    if (firstAvailableClass) {
      setSelectedClass(firstAvailableClass);
    }
  }, [timetable, substitutions]);
  
  const assignSubstituteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClass || !selectedSubstituteId) {
        throw new Error('Please select a class and substitute teacher');
      }
      
      return apiRequest('POST', '/api/substitutions', {
        date: dateStr,
        period: selectedClass.period,
        class: selectedClass.class,
        originalTeacherId: teacher.teacherId,
        substituteTeacherId: parseInt(selectedSubstituteId),
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/substitutions?date=${dateStr}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity-logs'] });
      
      toast({
        title: 'Substitute Assigned',
        description: `Substitute teacher has been assigned successfully for Period ${selectedClass?.period}`,
      });
      
      onAssigned();
    },
    onError: (error) => {
      toast({
        title: 'Assignment Failed',
        description: error instanceof Error ? error.message : 'Failed to assign substitute',
        variant: 'destructive',
      });
    }
  });
  
  const handleAssignSubstitute = () => {
    assignSubstituteMutation.mutate();
  };
  
  // Create a substitute message for SMS
  const generateSubstituteMessage = () => {
    if (!selectedClass || !selectedSubstituteId) return '';
    
    const substitute = allTeachers.find((t: any) => t.id.toString() === selectedSubstituteId);
    if (!substitute) return '';
    
    return `Dear ${substitute.name}, You have been assigned as a substitute for ${selectedClass.class} during Period ${selectedClass.period} on ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Please confirm your availability. Thank you.`;
  };

  return (
    <div className="mt-6 space-y-6">
      <div>
        <Label className="text-base">Absent Teacher</Label>
        <div className="mt-2 p-4 border rounded-md bg-gray-50">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center">
              <span>{teacher.initials}</span>
            </div>
            <div className="ml-3">
              <p className="font-medium">{teacher.name}</p>
              <p className="text-sm text-gray-500">
                {teacher.phoneNumber || 'No phone number'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <Label className="text-base">Select Class to Substitute</Label>
        <RadioGroup 
          className="mt-2"
          value={selectedClass ? `${selectedClass.period}-${selectedClass.class}` : ''}
          onValueChange={(value) => {
            const [period, className] = value.split('-');
            const classObj = classesToSubstitute.find(
              c => c.period.toString() === period && c.class === className
            );
            setSelectedClass(classObj || null);
          }}
        >
          {classesToSubstitute.length === 0 ? (
            <div className="text-gray-500 p-2">No classes found for this teacher today.</div>
          ) : (
            classesToSubstitute.map((cls) => (
              <div 
                key={`${cls.period}-${cls.class}`}
                className={`flex items-center space-x-2 p-4 border rounded-md ${
                  cls.hasSubstitute ? 'bg-gray-100 opacity-60' : ''
                }`}
              >
                <RadioGroupItem 
                  value={`${cls.period}-${cls.class}`} 
                  id={`${cls.period}-${cls.class}`}
                  disabled={cls.hasSubstitute}
                />
                <Label 
                  htmlFor={`${cls.period}-${cls.class}`}
                  className="flex-1 cursor-pointer flex justify-between"
                >
                  <span>Period {cls.period}: {cls.class}</span>
                  {cls.hasSubstitute && (
                    <span className="text-green-600 text-sm">
                      Already Assigned
                    </span>
                  )}
                </Label>
              </div>
            ))
          )}
        </RadioGroup>
      </div>
      
      <div>
        <Label className="text-base">Select Substitute Teacher</Label>
        <Select
          value={selectedSubstituteId}
          onValueChange={setSelectedSubstituteId}
          disabled={!selectedClass || selectedClass.hasSubstitute}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select a substitute teacher" />
          </SelectTrigger>
          <SelectContent>
            {availableSubstitutes.length === 0 ? (
              <SelectItem value="none" disabled>
                No available substitutes
              </SelectItem>
            ) : (
              availableSubstitutes.map((substitute: any) => (
                <SelectItem key={substitute.id} value={substitute.id.toString()}>
                  {substitute.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      {selectedSubstituteId && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <Label className="text-sm font-medium text-gray-700 mb-2">
            SMS Preview
          </Label>
          <p className="text-sm text-gray-600">
            {generateSubstituteMessage()}
          </p>
        </div>
      )}
      
      <div className="flex space-x-3 pt-4">
        <Button
          variant="outline"
          onClick={onAssigned}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          className="flex-1"
          onClick={handleAssignSubstitute}
          disabled={
            !selectedClass || 
            selectedClass.hasSubstitute || 
            !selectedSubstituteId || 
            assignSubstituteMutation.isPending
          }
        >
          Assign Substitute
        </Button>
      </div>
    </div>
  );
};

export default SubstituteAssigner;
