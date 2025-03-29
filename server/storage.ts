import { promises as fs } from 'fs';
import path from 'path';
import { 
  Teacher, InsertTeacher, 
  Attendance, InsertAttendance,
  Timetable, InsertTimetable,
  Substitution, InsertSubstitution,
  PeriodConfig, InsertPeriodConfig,
  ActivityLog, InsertActivityLog,
  Message, InsertMessage
} from '@shared/schema';

// Define storage interface
export interface IStorage {
  // Teacher CRUD
  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: number): Promise<Teacher | undefined>;
  getTeacherByName(name: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: number, teacher: Partial<Teacher>): Promise<Teacher | undefined>;
  
  // Attendance CRUD
  getAttendanceByDate(date: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, attendance: Partial<Attendance>): Promise<Attendance | undefined>;
  
  // Timetable CRUD
  getTimetable(): Promise<Timetable[]>;
  getTimetableByDay(day: string): Promise<Timetable[]>;
  getTimetableByTeacher(teacherId: number): Promise<Timetable[]>;
  createTimetable(timetable: InsertTimetable): Promise<Timetable>;
  bulkCreateTimetable(timetables: InsertTimetable[]): Promise<Timetable[]>;
  
  // Substitution CRUD
  getSubstitutions(): Promise<Substitution[]>;
  getSubstitutionsByDate(date: string): Promise<Substitution[]>;
  createSubstitution(substitution: InsertSubstitution): Promise<Substitution>;
  updateSubstitution(id: number, substitution: Partial<Substitution>): Promise<Substitution | undefined>;
  
  // Period Config CRUD
  getPeriodConfigs(): Promise<PeriodConfig[]>;
  createPeriodConfig(periodConfig: InsertPeriodConfig): Promise<PeriodConfig>;
  updatePeriodConfig(id: number, periodConfig: Partial<PeriodConfig>): Promise<PeriodConfig | undefined>;
  
  // Activity Log CRUD
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog>;
  
  // Message CRUD
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, message: Partial<Message>): Promise<Message | undefined>;
}

// File paths for storage
const DATA_DIR = path.resolve(process.cwd(), 'data');
const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');
const ATTENDANCE_FILE = path.join(DATA_DIR, 'attendance.json');
const TIMETABLE_FILE = path.join(DATA_DIR, 'timetable.json');
const SUBSTITUTION_FILE = path.join(DATA_DIR, 'substitutions.json');
const PERIOD_CONFIG_FILE = path.join(DATA_DIR, 'period_configs.json');
const ACTIVITY_LOG_FILE = path.join(DATA_DIR, 'activity_logs.json');
const MESSAGE_FILE = path.join(DATA_DIR, 'messages.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Read data from a file or return empty array if file doesn't exist
async function readData<T>(filePath: string): Promise<T[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

// Write data to a file
async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// File-based storage implementation
export class FileStorage implements IStorage {
  private async getNextId<T extends { id: number }>(filePath: string): Promise<number> {
    const data = await readData<T>(filePath);
    const maxId = data.reduce((max, item) => Math.max(max, item.id), 0);
    return maxId + 1;
  }

  // Teacher CRUD
  async getTeachers(): Promise<Teacher[]> {
    return readData<Teacher>(TEACHERS_FILE);
  }

  async getTeacher(id: number): Promise<Teacher | undefined> {
    const teachers = await this.getTeachers();
    return teachers.find(teacher => teacher.id === id);
  }

  async getTeacherByName(name: string): Promise<Teacher | undefined> {
    const teachers = await this.getTeachers();
    return teachers.find(teacher => 
      teacher.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createTeacher(teacherData: InsertTeacher): Promise<Teacher> {
    const teachers = await this.getTeachers();
    const id = await this.getNextId<Teacher>(TEACHERS_FILE);
    
    const teacher: Teacher = { ...teacherData, id };
    teachers.push(teacher);
    
    await writeData(TEACHERS_FILE, teachers);
    return teacher;
  }

  async updateTeacher(id: number, teacherData: Partial<Teacher>): Promise<Teacher | undefined> {
    const teachers = await this.getTeachers();
    const index = teachers.findIndex(teacher => teacher.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const updatedTeacher = { ...teachers[index], ...teacherData };
    teachers[index] = updatedTeacher;
    
    await writeData(TEACHERS_FILE, teachers);
    return updatedTeacher;
  }

  // Attendance CRUD
  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    const attendanceRecords = await readData<Attendance>(ATTENDANCE_FILE);
    return attendanceRecords.filter(record => record.date === date);
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const attendanceRecords = await readData<Attendance>(ATTENDANCE_FILE);
    const id = await this.getNextId<Attendance>(ATTENDANCE_FILE);
    
    const attendance: Attendance = { 
      ...attendanceData, 
      id, 
      createdAt: new Date() 
    };
    
    attendanceRecords.push(attendance);
    await writeData(ATTENDANCE_FILE, attendanceRecords);
    return attendance;
  }

  async updateAttendance(id: number, attendanceData: Partial<Attendance>): Promise<Attendance | undefined> {
    const attendanceRecords = await readData<Attendance>(ATTENDANCE_FILE);
    const index = attendanceRecords.findIndex(record => record.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const updatedAttendance = { ...attendanceRecords[index], ...attendanceData };
    attendanceRecords[index] = updatedAttendance;
    
    await writeData(ATTENDANCE_FILE, attendanceRecords);
    return updatedAttendance;
  }

  // Timetable CRUD
  async getTimetable(): Promise<Timetable[]> {
    return readData<Timetable>(TIMETABLE_FILE);
  }

  async getTimetableByDay(day: string): Promise<Timetable[]> {
    const timetable = await this.getTimetable();
    return timetable.filter(entry => entry.day.toLowerCase() === day.toLowerCase());
  }

  async getTimetableByTeacher(teacherId: number): Promise<Timetable[]> {
    const timetable = await this.getTimetable();
    return timetable.filter(entry => entry.teacherId === teacherId);
  }

  async createTimetable(timetableData: InsertTimetable): Promise<Timetable> {
    const timetable = await this.getTimetable();
    const id = await this.getNextId<Timetable>(TIMETABLE_FILE);
    
    const newEntry: Timetable = { ...timetableData, id };
    timetable.push(newEntry);
    
    await writeData(TIMETABLE_FILE, timetable);
    return newEntry;
  }

  async bulkCreateTimetable(timetablesData: InsertTimetable[]): Promise<Timetable[]> {
    const timetable = await this.getTimetable();
    let nextId = await this.getNextId<Timetable>(TIMETABLE_FILE);
    
    const newEntries: Timetable[] = timetablesData.map(data => {
      const entry: Timetable = { ...data, id: nextId++ };
      return entry;
    });
    
    timetable.push(...newEntries);
    await writeData(TIMETABLE_FILE, timetable);
    return newEntries;
  }

  // Substitution CRUD
  async getSubstitutions(): Promise<Substitution[]> {
    return readData<Substitution>(SUBSTITUTION_FILE);
  }

  async getSubstitutionsByDate(date: string): Promise<Substitution[]> {
    const substitutions = await this.getSubstitutions();
    return substitutions.filter(sub => sub.date === date);
  }

  async createSubstitution(substitutionData: InsertSubstitution): Promise<Substitution> {
    const substitutions = await this.getSubstitutions();
    const id = await this.getNextId<Substitution>(SUBSTITUTION_FILE);
    
    const substitution: Substitution = { 
      ...substitutionData, 
      id, 
      createdAt: new Date() 
    };
    
    substitutions.push(substitution);
    await writeData(SUBSTITUTION_FILE, substitutions);
    return substitution;
  }

  async updateSubstitution(id: number, substitutionData: Partial<Substitution>): Promise<Substitution | undefined> {
    const substitutions = await this.getSubstitutions();
    const index = substitutions.findIndex(sub => sub.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const updatedSubstitution = { ...substitutions[index], ...substitutionData };
    substitutions[index] = updatedSubstitution;
    
    await writeData(SUBSTITUTION_FILE, substitutions);
    return updatedSubstitution;
  }

  // Period Config CRUD
  async getPeriodConfigs(): Promise<PeriodConfig[]> {
    return readData<PeriodConfig>(PERIOD_CONFIG_FILE);
  }

  async createPeriodConfig(periodConfigData: InsertPeriodConfig): Promise<PeriodConfig> {
    const periodConfigs = await this.getPeriodConfigs();
    const id = await this.getNextId<PeriodConfig>(PERIOD_CONFIG_FILE);
    
    const periodConfig: PeriodConfig = { ...periodConfigData, id };
    periodConfigs.push(periodConfig);
    
    await writeData(PERIOD_CONFIG_FILE, periodConfigs);
    return periodConfig;
  }

  async updatePeriodConfig(id: number, periodConfigData: Partial<PeriodConfig>): Promise<PeriodConfig | undefined> {
    const periodConfigs = await this.getPeriodConfigs();
    const index = periodConfigs.findIndex(config => config.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const updatedConfig = { ...periodConfigs[index], ...periodConfigData };
    periodConfigs[index] = updatedConfig;
    
    await writeData(PERIOD_CONFIG_FILE, periodConfigs);
    return updatedConfig;
  }

  // Activity Log CRUD
  async getActivityLogs(limit?: number): Promise<ActivityLog[]> {
    const logs = await readData<ActivityLog>(ACTIVITY_LOG_FILE);
    // Sort by creation date, newest first
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return limit ? logs.slice(0, limit) : logs;
  }

  async createActivityLog(activityLogData: InsertActivityLog): Promise<ActivityLog> {
    const logs = await readData<ActivityLog>(ACTIVITY_LOG_FILE);
    const id = await this.getNextId<ActivityLog>(ACTIVITY_LOG_FILE);
    
    const activityLog: ActivityLog = { 
      ...activityLogData, 
      id, 
      createdAt: new Date() 
    };
    
    logs.push(activityLog);
    await writeData(ACTIVITY_LOG_FILE, logs);
    return activityLog;
  }

  // Message CRUD
  async getMessages(): Promise<Message[]> {
    return readData<Message>(MESSAGE_FILE);
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const messages = await readData<Message>(MESSAGE_FILE);
    const id = await this.getNextId<Message>(MESSAGE_FILE);
    
    const message: Message = { 
      ...messageData, 
      id, 
      createdAt: new Date() 
    };
    
    messages.push(message);
    await writeData(MESSAGE_FILE, messages);
    return message;
  }

  async updateMessage(id: number, messageData: Partial<Message>): Promise<Message | undefined> {
    const messages = await readData<Message>(MESSAGE_FILE);
    const index = messages.findIndex(msg => msg.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const updatedMessage = { ...messages[index], ...messageData };
    messages[index] = updatedMessage;
    
    await writeData(MESSAGE_FILE, messages);
    return updatedMessage;
  }
}

// Initialize storage instance
export const storage = new FileStorage();
