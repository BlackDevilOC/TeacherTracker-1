import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, CheckSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Teacher } from '@/types';

interface RecipientSelectorProps {
  onSelectionChange: (teachers: Teacher[]) => void;
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({ onSelectionChange }) => {
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<Set<number>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  
  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['/api/teachers'],
    // Default query function from setup
  });
  
  // Handle select all
  const handleSelectAll = () => {
    const allIds = new Set(teachers.map((teacher: Teacher) => teacher.id));
    setSelectedTeacherIds(allIds);
    updateParentSelection(allIds);
  };
  
  // Handle clear all
  const handleClearAll = () => {
    setSelectedTeacherIds(new Set());
    onSelectionChange([]);
  };
  
  // Toggle a single teacher selection
  const toggleTeacher = (teacherId: number) => {
    const newSelection = new Set(selectedTeacherIds);
    
    if (newSelection.has(teacherId)) {
      newSelection.delete(teacherId);
    } else {
      newSelection.add(teacherId);
    }
    
    setSelectedTeacherIds(newSelection);
    updateParentSelection(newSelection);
  };
  
  // Update parent component with selected teachers
  const updateParentSelection = (selectedIds: Set<number>) => {
    const selectedTeachers = teachers.filter(
      (teacher: Teacher) => selectedIds.has(teacher.id)
    );
    onSelectionChange(selectedTeachers);
  };
  
  // Filter teachers based on selection type
  const getFilteredTeachers = () => {
    if (filterType === 'all') {
      return teachers;
    }
    
    // Additional filter types could be implemented here
    // For example, filtering by substitute teachers or regular teachers
    return teachers;
  };
  
  const filteredTeachers = getFilteredTeachers();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Select Recipients</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Select All
          </Button>
        </div>
      </div>
      
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-full mb-4">
          <SelectValue placeholder="Filter teachers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Teachers</SelectItem>
          <SelectItem value="substitutes">Substitute Teachers</SelectItem>
          <SelectItem value="regular">Regular Teachers</SelectItem>
        </SelectContent>
      </Select>
      
      <Card>
        <CardContent className="p-0">
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="animate-pulse space-y-4 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-md"></div>
                ))}
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No teachers found. Import teachers from the Data Import page.
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredTeachers.map((teacher: Teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Checkbox
                        id={`teacher-${teacher.id}`}
                        className="mr-3 h-5 w-5"
                        checked={selectedTeacherIds.has(teacher.id)}
                        onCheckedChange={() => toggleTeacher(teacher.id)}
                      />
                      <Label 
                        htmlFor={`teacher-${teacher.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {teacher.name}
                      </Label>
                    </div>
                    {teacher.phoneNumber && (
                      <span className="text-xs text-gray-500">{teacher.phoneNumber}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipientSelector;
