import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PeriodConfig } from '@/types';
import { getCurrentTime, isTimeBetween } from '@/utils/dateUtils';

const PeriodStatus: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  
  const { data: periods, isLoading, refetch } = useQuery({
    queryKey: ['/api/periods'],
    // Default query function from setup
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Determine current period based on time
  const getCurrentPeriod = (): PeriodConfig | null => {
    if (!periods || periods.length === 0) return null;

    const activePeriod = periods.find(
      (period: PeriodConfig) => 
        period.active && 
        isTimeBetween(currentTime, period.startTime, period.endTime)
    );

    return activePeriod || null;
  };

  const currentPeriod = getCurrentPeriod();
  
  // Get next period if there is one
  const getNextPeriod = (): PeriodConfig | null => {
    if (!periods || periods.length === 0) return null;
    
    const sortedPeriods = [...periods]
      .filter(p => p.active)
      .sort((a, b) => a.periodNumber - b.periodNumber);
    
    if (!currentPeriod) {
      // Find the first period that hasn't started yet
      return sortedPeriods.find(
        period => currentTime < period.startTime
      ) || null;
    }
    
    // Find the next period after the current one
    const currentIndex = sortedPeriods.findIndex(p => p.id === currentPeriod.id);
    return currentIndex < sortedPeriods.length - 1 
      ? sortedPeriods[currentIndex + 1] 
      : null;
  };
  
  const nextPeriod = getNextPeriod();
  
  const getPeriodStatus = (): string => {
    if (currentPeriod) return 'in progress';
    if (nextPeriod) return 'next period';
    return 'school day ended';
  };

  const formatPeriodTime = (period: PeriodConfig | null): string => {
    if (!period) return '';
    return `${period.startTime} • ${periods?.length || 0} periods configured`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse h-16"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">
              {currentPeriod 
                ? `Period ${currentPeriod.periodNumber}` 
                : nextPeriod 
                  ? `Period ${nextPeriod.periodNumber}` 
                  : 'No Active Period'}
            </h2>
            <p className="text-sm text-gray-500">{getPeriodStatus()}</p>
            <p className="text-xs text-gray-400">
              {currentPeriod 
                ? formatPeriodTime(currentPeriod)
                : nextPeriod
                  ? formatPeriodTime(nextPeriod)
                  : ''}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodStatus;
