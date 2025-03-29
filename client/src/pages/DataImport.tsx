import React, { useState } from 'react';
import FileUploader from '@/components/data/FileUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { formatShortDate } from '@/utils/dateUtils';

interface ImportRecord {
  id: number;
  fileName: string;
  date: string;
  status: string;
  recordCount: number;
}

// Mock import history since we don't have an API endpoint for this
const importHistory: ImportRecord[] = [
  {
    id: 1,
    fileName: 'timetable_file.csv',
    date: new Date(2025, 2, 15).toISOString(),
    status: 'Success',
    recordCount: 46
  },
  {
    id: 2,
    fileName: 'Substitude_file.csv',
    date: new Date(2025, 2, 15).toISOString(),
    status: 'Success',
    recordCount: 35
  }
];

const DataImport: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Refresh teacher and timetable data
  const { refetch: refetchTeachers } = useQuery({
    queryKey: ['/api/teachers'],
    // Default query function from setup
  });
  
  const { refetch: refetchTimetable } = useQuery({
    queryKey: ['/api/timetable'],
    // Default query function from setup
  });
  
  const handleUploadComplete = () => {
    refetchTeachers();
    refetchTimetable();
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">
        Upload CSV files to import teacher and timetable data
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FileUploader 
          title="Timetable File"
          description="Upload the CSV file containing class schedules and teacher assignments."
          fileType="timetable"
          onUploadComplete={handleUploadComplete}
        />
        
        <FileUploader 
          title="Substitute File"
          description="Upload the CSV file containing substitute teacher information and contacts."
          fileType="teachers"
          onUploadComplete={handleUploadComplete}
        />
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Import History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.fileName}</TableCell>
                  <TableCell>{formatShortDate(new Date(record.date))}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className="bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.recordCount} rows</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImport;
