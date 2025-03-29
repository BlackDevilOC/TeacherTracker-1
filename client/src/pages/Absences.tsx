import React, { useState } from 'react';
import AbsenceManager from '@/components/absences/AbsenceManager';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/utils/dateUtils';

const Absences: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const dateStr = formatDate(selectedDate);
  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
  
  const { refetch } = useQuery({
    queryKey: [`/api/attendance?date=${dateStr}`],
    // Default query function from setup
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <div>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="pl-3 pr-3 flex gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{formattedDate}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(newDate) => {
                  if (newDate) {
                    setSelectedDate(newDate);
                    setIsCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Absence Manager Component */}
      <AbsenceManager 
        date={selectedDate}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default Absences;
