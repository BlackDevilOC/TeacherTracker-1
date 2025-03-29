import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { formatShortDate } from '@/utils/dateUtils';
import { ActivityLog } from '@/types';

const RecentActivity: React.FC = () => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['/api/activity-logs?limit=5'],
    // Default query function from setup
  });

  // Get badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-amber-100 text-amber-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b flex justify-between items-center">
        <CardTitle className="text-base font-medium">Recent Activities</CardTitle>
        <Button variant="link" size="sm" className="text-primary p-0">
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teacher
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Loading recent activities...
                </TableCell>
              </TableRow>
            ) : activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No recent activities found.
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity: ActivityLog) => (
                <TableRow key={activity.id} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {formatShortDate(new Date(activity.date))}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {activity.teacherName || `Teacher #${activity.teacherId}`}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {activity.action}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(activity.status)}`}
                    >
                      {activity.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
