import Papa from 'papaparse';
import { TeacherCSVData, TimetableCSVData } from '@/types';

// Parse teachers CSV file
export const parseTeachersCSV = (file: File): Promise<TeacherCSVData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const teachers: TeacherCSVData[] = results.data.map((row: any) => {
            // Row should be an array with either one or two elements
            const name = row[0] ? String(row[0]).trim() : '';
            const phoneNumber = row.length > 1 ? String(row[1]).trim() : undefined;
            
            return { name, phoneNumber };
          }).filter(teacher => teacher.name !== '');

          resolve(teachers);
        } catch (error) {
          reject(new Error('Error parsing CSV: Invalid format'));
        }
      },
      error: (error) => {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    });
  });
};

// Parse timetable CSV file
export const parseTimetableCSV = (file: File): Promise<TimetableCSVData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const timetableEntries: TimetableCSVData[] = [];
          
          results.data.forEach((row: any) => {
            const day = row.Day?.trim();
            const period = parseInt(row.Period);
            
            if (!day || isNaN(period)) {
              return;
            }
            
            // Process each class column in the row
            for (const [key, value] of Object.entries(row)) {
              // Skip non-class columns
              if (key === 'Day' || key === 'Period' || !value || value === 'empty') {
                continue;
              }
              
              const className = key;
              const teacherName = String(value).trim();
              
              timetableEntries.push({
                day,
                period,
                className,
                teacherName
              });
            }
          });
          
          resolve(timetableEntries);
        } catch (error) {
          reject(new Error('Error parsing CSV: Invalid format'));
        }
      },
      error: (error) => {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    });
  });
};

// Generate a CSV file for download
export const generateCSV = <T>(data: T[], headers: string[], filename: string): void => {
  // Convert data to CSV format
  const csv = Papa.unparse({
    fields: headers,
    data
  });
  
  // Create a blob
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create the URL
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Append the link
  document.body.appendChild(link);
  
  // Click the link
  link.click();
  
  // Clean up
  document.body.removeChild(link);
};
