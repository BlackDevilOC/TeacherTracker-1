// Teacher Types
export interface Teacher {
  id: number;
  name: string;
  phoneNumber: string | null;
  initials: string;
}

export interface TeacherWithAttendance extends Teacher {
  status: 'present' | 'absent';
  attendanceId: number | null;
}

// Attendance Types
export interface Attendance {
  id: number;
  teacherId: number;
  date: string;
  status: 'present' | 'absent';
  createdAt: Date;
}

// Timetable Types
export interface TimetableEntry {
  id: number;
  day: string;
  period: number;
  class: string;
  teacherId: number;
  teacherName?: string;
}

// Substitution Types
export interface Substitution {
  id: number;
  date: string;
  period: number;
  class: string;
  originalTeacherId: number;
  substituteTeacherId: number;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: Date;
  originalTeacherName?: string;
  substituteTeacherName?: string;
}

// Period Config Types
export interface PeriodConfig {
  id: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

// Activity Log Types
export interface ActivityLog {
  id: number;
  date: string;
  teacherId: number;
  action: string;
  status: string;
  createdAt: Date;
  teacherName?: string;
}

// Message Types
export interface Message {
  id: number;
  teacherId: number;
  message: string;
  date: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: Date;
  teacherName?: string;
  phoneNumber?: string | null;
}

// Upload Results
export interface UploadResult {
  message: string;
  teachers?: Teacher[];
  count?: number;
}

// CSV Data Structures
export interface TeacherCSVData {
  name: string;
  phoneNumber?: string;
}

export interface TimetableCSVData {
  day: string;
  period: number;
  className: string;
  teacherName: string;
}

// Application State
export interface AppState {
  currentDate: string;
  currentPeriod: PeriodConfig | null;
}
