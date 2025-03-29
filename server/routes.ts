import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import multer from 'multer';
import { format } from 'date-fns';
import {
  insertTeacherSchema,
  insertAttendanceSchema,
  insertTimetableSchema,
  insertSubstitutionSchema,
  insertPeriodConfigSchema,
  insertActivityLogSchema,
  insertMessageSchema
} from '@shared/schema';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      fs.mkdir(uploadDir, { recursive: true })
        .then(() => cb(null, uploadDir))
        .catch(err => cb(err, uploadDir));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  })
});

// Helper to normalize teacher names
function normalizeTeacherName(name: string): string {
  return name.trim()
    .replace(/\s+/g, ' ')
    .replace(/^(sir|miss|mrs|mr|dr)\s+/i, (match) => match.toLowerCase())
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Helper to generate initials from name
function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Set up API routes
  const apiRouter = app.route('/api');

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => format(new Date(), 'yyyy-MM-dd');

  // Teacher routes
  app.get('/api/teachers', async (req: Request, res: Response) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      res.status(500).json({ message: 'Failed to fetch teachers' });
    }
  });

  app.get('/api/teachers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const teacher = await storage.getTeacher(id);
      
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      
      res.json(teacher);
    } catch (error) {
      console.error('Error fetching teacher:', error);
      res.status(500).json({ message: 'Failed to fetch teacher' });
    }
  });

  app.post('/api/teachers', async (req: Request, res: Response) => {
    try {
      const validatedData = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(validatedData);
      res.status(201).json(teacher);
    } catch (error) {
      console.error('Error creating teacher:', error);
      res.status(400).json({ message: 'Invalid teacher data' });
    }
  });

  // Attendance routes
  app.get('/api/attendance', async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string || getCurrentDate();
      const attendance = await storage.getAttendanceByDate(date);
      
      // Get all teachers to provide complete attendance data
      const teachers = await storage.getTeachers();
      
      // Map teachers to their attendance status for the requested date
      const attendanceData = teachers.map(teacher => {
        const record = attendance.find(a => a.teacherId === teacher.id);
        return {
          teacherId: teacher.id,
          name: teacher.name,
          phoneNumber: teacher.phoneNumber,
          initials: teacher.initials,
          status: record ? record.status : 'present', // Default to present if no record
          attendanceId: record ? record.id : null
        };
      });
      
      res.json(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ message: 'Failed to fetch attendance' });
    }
  });

  app.post('/api/attendance', async (req: Request, res: Response) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      
      // Check if attendance record already exists for this teacher and date
      const existingRecords = await storage.getAttendanceByDate(validatedData.date);
      const existingRecord = existingRecords.find(record => record.teacherId === validatedData.teacherId);
      
      let attendance;
      if (existingRecord) {
        // Update existing record
        attendance = await storage.updateAttendance(existingRecord.id, {
          status: validatedData.status
        });
      } else {
        // Create new record
        attendance = await storage.createAttendance(validatedData);
      }
      
      // Log activity
      const teacher = await storage.getTeacher(validatedData.teacherId);
      if (teacher) {
        await storage.createActivityLog({
          date: validatedData.date,
          teacherId: validatedData.teacherId,
          action: `Marked ${validatedData.status}`,
          status: 'Completed'
        });
      }
      
      res.status(201).json(attendance);
    } catch (error) {
      console.error('Error recording attendance:', error);
      res.status(400).json({ message: 'Invalid attendance data' });
    }
  });

  // Timetable routes
  app.get('/api/timetable', async (req: Request, res: Response) => {
    try {
      const day = req.query.day as string;
      const teacherId = req.query.teacherId ? parseInt(req.query.teacherId as string) : undefined;
      
      let timetable;
      if (day) {
        timetable = await storage.getTimetableByDay(day);
      } else if (teacherId) {
        timetable = await storage.getTimetableByTeacher(teacherId);
      } else {
        timetable = await storage.getTimetable();
      }
      
      // Get all teachers to include teacher names in response
      const teachers = await storage.getTeachers();
      
      // Enrich timetable data with teacher names
      const enrichedTimetable = timetable.map(entry => {
        const teacher = teachers.find(t => t.id === entry.teacherId);
        return {
          ...entry,
          teacherName: teacher ? teacher.name : 'Unknown Teacher'
        };
      });
      
      res.json(enrichedTimetable);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      res.status(500).json({ message: 'Failed to fetch timetable' });
    }
  });

  // Substitution routes
  app.get('/api/substitutions', async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string || getCurrentDate();
      const substitutions = await storage.getSubstitutionsByDate(date);
      
      // Get all teachers to include teacher names in response
      const teachers = await storage.getTeachers();
      
      // Enrich substitution data with teacher names
      const enrichedSubstitutions = substitutions.map(sub => {
        const originalTeacher = teachers.find(t => t.id === sub.originalTeacherId);
        const substituteTeacher = teachers.find(t => t.id === sub.substituteTeacherId);
        
        return {
          ...sub,
          originalTeacherName: originalTeacher ? originalTeacher.name : 'Unknown Teacher',
          substituteTeacherName: substituteTeacher ? substituteTeacher.name : 'Unknown Teacher'
        };
      });
      
      res.json(enrichedSubstitutions);
    } catch (error) {
      console.error('Error fetching substitutions:', error);
      res.status(500).json({ message: 'Failed to fetch substitutions' });
    }
  });

  app.post('/api/substitutions', async (req: Request, res: Response) => {
    try {
      const validatedData = insertSubstitutionSchema.parse(req.body);
      const substitution = await storage.createSubstitution(validatedData);
      
      // Log activity
      const substituteTeacher = await storage.getTeacher(validatedData.substituteTeacherId);
      if (substituteTeacher) {
        await storage.createActivityLog({
          date: validatedData.date,
          teacherId: validatedData.substituteTeacherId,
          action: `Substituted Class ${validatedData.class}`,
          status: 'Assigned'
        });
      }
      
      res.status(201).json(substitution);
    } catch (error) {
      console.error('Error creating substitution:', error);
      res.status(400).json({ message: 'Invalid substitution data' });
    }
  });

  // Period config routes
  app.get('/api/periods', async (req: Request, res: Response) => {
    try {
      const periodConfigs = await storage.getPeriodConfigs();
      res.json(periodConfigs);
    } catch (error) {
      console.error('Error fetching period configs:', error);
      res.status(500).json({ message: 'Failed to fetch period configurations' });
    }
  });

  app.post('/api/periods', async (req: Request, res: Response) => {
    try {
      const validatedData = insertPeriodConfigSchema.parse(req.body);
      const periodConfig = await storage.createPeriodConfig(validatedData);
      res.status(201).json(periodConfig);
    } catch (error) {
      console.error('Error creating period config:', error);
      res.status(400).json({ message: 'Invalid period configuration data' });
    }
  });

  // Activity log routes
  app.get('/api/activity-logs', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activityLogs = await storage.getActivityLogs(limit);
      
      // Get all teachers to include teacher names in response
      const teachers = await storage.getTeachers();
      
      // Enrich activity log data with teacher names
      const enrichedLogs = activityLogs.map(log => {
        const teacher = teachers.find(t => t.id === log.teacherId);
        return {
          ...log,
          teacherName: teacher ? teacher.name : 'Unknown Teacher'
        };
      });
      
      res.json(enrichedLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ message: 'Failed to fetch activity logs' });
    }
  });

  // Message routes
  app.get('/api/messages', async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessages();
      
      // Get all teachers to include teacher names in response
      const teachers = await storage.getTeachers();
      
      // Enrich message data with teacher names
      const enrichedMessages = messages.map(message => {
        const teacher = teachers.find(t => t.id === message.teacherId);
        return {
          ...message,
          teacherName: teacher ? teacher.name : 'Unknown Teacher',
          phoneNumber: teacher ? teacher.phoneNumber : null
        };
      });
      
      res.json(enrichedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', async (req: Request, res: Response) => {
    try {
      // If request contains an array of messages, handle bulk creation
      if (Array.isArray(req.body)) {
        const messages = await Promise.all(
          req.body.map(async (messageData) => {
            const validatedData = insertMessageSchema.parse(messageData);
            return await storage.createMessage(validatedData);
          })
        );
        
        // Log activity for each message
        for (const message of messages) {
          await storage.createActivityLog({
            date: message.date,
            teacherId: message.teacherId,
            action: 'SMS Sent',
            status: 'Delivered'
          });
        }
        
        return res.status(201).json(messages);
      }
      
      // Handle single message creation
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      
      // Log activity
      await storage.createActivityLog({
        date: message.date,
        teacherId: message.teacherId,
        action: 'SMS Sent',
        status: 'Delivered'
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(400).json({ message: 'Invalid message data' });
    }
  });

  // File upload routes
  app.post('/api/upload/teachers', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Read the uploaded CSV file
      const fileData = await fs.readFile(req.file.path, 'utf8');
      const records = parse(fileData, {
        columns: false,
        skip_empty_lines: true
      });
      
      // Process teacher data
      const teachers = await storage.getTeachers();
      const teacherMap = new Map(teachers.map(t => [t.name.toLowerCase(), t]));
      
      const newTeachers = [];
      const processedCount = { total: 0, created: 0, skipped: 0 };
      
      for (const record of records) {
        processedCount.total++;
        
        if (record.length < 1) continue;
        
        const name = normalizeTeacherName(record[0]);
        const phoneNumber = record.length > 1 ? record[1] : null;
        
        if (teacherMap.has(name.toLowerCase())) {
          processedCount.skipped++;
          continue;
        }
        
        const initials = generateInitials(name);
        const teacher = await storage.createTeacher({
          name,
          phoneNumber,
          initials
        });
        
        newTeachers.push(teacher);
        teacherMap.set(name.toLowerCase(), teacher);
        processedCount.created++;
      }
      
      // Delete the temporary file
      await fs.unlink(req.file.path);
      
      res.status(201).json({
        message: `Processed ${processedCount.total} records: ${processedCount.created} created, ${processedCount.skipped} skipped`,
        teachers: newTeachers
      });
    } catch (error) {
      console.error('Error processing teachers CSV:', error);
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      res.status(500).json({ message: 'Failed to process teacher data' });
    }
  });

  app.post('/api/upload/timetable', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Read the uploaded CSV file
      const fileData = await fs.readFile(req.file.path, 'utf8');
      const records = parse(fileData, {
        columns: true,
        skip_empty_lines: true
      });
      
      // Get all teachers to map names to IDs
      const teachers = await storage.getTeachers();
      const teacherMap = new Map();
      
      // Create normalized name map
      for (const teacher of teachers) {
        const normalizedName = teacher.name.toLowerCase();
        teacherMap.set(normalizedName, teacher.id);
      }
      
      // Process timetable data
      const timetableEntries = [];
      const processedCount = { total: 0, created: 0, skipped: 0 };
      
      for (const record of records) {
        processedCount.total++;
        
        const day = record.Day?.trim();
        const period = parseInt(record.Period);
        
        if (!day || isNaN(period)) {
          processedCount.skipped++;
          continue;
        }
        
        // Process each class in the record
        for (const [key, value] of Object.entries(record)) {
          // Skip non-class columns
          if (key === 'Day' || key === 'Period' || !value || value === 'empty') {
            continue;
          }
          
          const className = key;
          const teacherName = normalizeTeacherName(value as string);
          const normalizedTeacherName = teacherName.toLowerCase();
          
          // Get teacher ID from map
          const teacherId = teacherMap.get(normalizedTeacherName);
          
          // If teacher not found, create a new one
          if (!teacherId) {
            const initials = generateInitials(teacherName);
            const newTeacher = await storage.createTeacher({
              name: teacherName,
              phoneNumber: null,
              initials
            });
            
            teacherMap.set(normalizedTeacherName, newTeacher.id);
            
            timetableEntries.push({
              day,
              period,
              class: className,
              teacherId: newTeacher.id
            });
          } else {
            timetableEntries.push({
              day,
              period,
              class: className,
              teacherId
            });
          }
          
          processedCount.created++;
        }
      }
      
      // Bulk create timetable entries
      const createdEntries = await storage.bulkCreateTimetable(timetableEntries);
      
      // Delete the temporary file
      await fs.unlink(req.file.path);
      
      res.status(201).json({
        message: `Processed ${processedCount.total} records: ${processedCount.created} entries created`,
        count: createdEntries.length
      });
    } catch (error) {
      console.error('Error processing timetable CSV:', error);
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      res.status(500).json({ message: 'Failed to process timetable data' });
    }
  });

  // Initialize default period configurations if none exist
  const initializeDefaultData = async () => {
    try {
      const periodConfigs = await storage.getPeriodConfigs();
      
      if (periodConfigs.length === 0) {
        // Create default period configurations
        const defaultPeriods = [
          { periodNumber: 1, startTime: '08:00', endTime: '08:45', active: true },
          { periodNumber: 2, startTime: '08:50', endTime: '09:35', active: true },
          { periodNumber: 3, startTime: '09:40', endTime: '10:25', active: true },
          { periodNumber: 4, startTime: '10:30', endTime: '11:15', active: true },
          { periodNumber: 5, startTime: '11:30', endTime: '12:15', active: true },
          { periodNumber: 6, startTime: '12:20', endTime: '13:05', active: true },
          { periodNumber: 7, startTime: '13:10', endTime: '13:55', active: true },
          { periodNumber: 8, startTime: '14:00', endTime: '14:45', active: true }
        ];
        
        for (const period of defaultPeriods) {
          await storage.createPeriodConfig(period);
        }
        
        console.log('Initialized default period configurations');
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  };
  
  // Call initialization function
  initializeDefaultData();

  return httpServer;
}
