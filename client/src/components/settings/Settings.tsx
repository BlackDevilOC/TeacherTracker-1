import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { PeriodConfig } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { formatTime } from '@/utils/dateUtils';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [newPeriod, setNewPeriod] = useState({
    periodNumber: '',
    startTime: '',
    endTime: '',
    active: true
  });

  const { data: periods = [], isLoading } = useQuery({
    queryKey: ['/api/periods'],
    // Default query function from setup
  });

  const addPeriodMutation = useMutation({
    mutationFn: async () => {
      const periodNumber = parseInt(newPeriod.periodNumber);
      if (isNaN(periodNumber) || periodNumber <= 0) {
        throw new Error('Period number must be a positive number');
      }

      if (!newPeriod.startTime || !newPeriod.endTime) {
        throw new Error('Start time and end time are required');
      }

      return apiRequest('POST', '/api/periods', {
        periodNumber,
        startTime: newPeriod.startTime,
        endTime: newPeriod.endTime,
        active: newPeriod.active
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/periods'] });
      setNewPeriod({
        periodNumber: '',
        startTime: '',
        endTime: '',
        active: true
      });
      toast({
        title: 'Period Added',
        description: 'The new period has been added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Add Period',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  });

  const togglePeriodMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number, active: boolean }) => {
      return apiRequest('POST', `/api/periods/${id}`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/periods'] });
      toast({
        title: 'Period Updated',
        description: 'The period status has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Update Period',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  });

  const handleAddPeriod = () => {
    addPeriodMutation.mutate();
  };

  const handleTogglePeriod = (id: number, currentActive: boolean) => {
    togglePeriodMutation.mutate({ id, active: !currentActive });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Period Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="periodNumber">Period Number</Label>
              <Input
                id="periodNumber"
                type="number"
                min="1"
                value={newPeriod.periodNumber}
                onChange={(e) => setNewPeriod({ ...newPeriod, periodNumber: e.target.value })}
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newPeriod.startTime}
                onChange={(e) => setNewPeriod({ ...newPeriod, startTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newPeriod.endTime}
                onChange={(e) => setNewPeriod({ ...newPeriod, endTime: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddPeriod} 
                disabled={addPeriodMutation.isPending}
                className="w-full"
              >
                {addPeriodMutation.isPending ? 'Adding...' : 'Add Period'}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-md"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No periods configured yet
                    </TableCell>
                  </TableRow>
                ) : (
                  periods
                    .sort((a: PeriodConfig, b: PeriodConfig) => a.periodNumber - b.periodNumber)
                    .map((period: PeriodConfig) => (
                      <TableRow key={period.id}>
                        <TableCell>{period.periodNumber}</TableCell>
                        <TableCell>{formatTime(period.startTime)}</TableCell>
                        <TableCell>{formatTime(period.endTime)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            period.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {period.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Switch
                              checked={period.active}
                              onCheckedChange={() => handleTogglePeriod(period.id, period.active)}
                              aria-label="Toggle period active state"
                            />
                            <span className="ml-2 text-sm text-gray-500">
                              {period.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="darkMode" className="text-base">Dark Mode</Label>
                <p className="text-sm text-gray-500">Enable dark theme for the application</p>
              </div>
              <Switch id="darkMode" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-base">Notifications</Label>
                <p className="text-sm text-gray-500">Enable desktop notifications</p>
              </div>
              <Switch id="notifications" checked={true} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoRefresh" className="text-base">Auto Refresh</Label>
                <p className="text-sm text-gray-500">Automatically refresh data every 5 minutes</p>
              </div>
              <Switch id="autoRefresh" checked={true} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
