import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Teacher model
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number"),
  initials: text("initials").notNull(),
});

export const insertTeacherSchema = createInsertSchema(teachers).pick({
  name: true,
  phoneNumber: true,
  initials: true,
});

// Attendance model
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull(), // "present" or "absent"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).pick({
  teacherId: true,
  date: true,
  status: true,
});

// Timetable model
export const timetable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(),
  period: integer("period").notNull(),
  class: text("class").notNull(),
  teacherId: integer("teacher_id").notNull(),
});

export const insertTimetableSchema = createInsertSchema(timetable).pick({
  day: true,
  period: true,
  class: true,
  teacherId: true,
});

// Substitution model
export const substitutions = pgTable("substitutions", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  period: integer("period").notNull(),
  class: text("class").notNull(),
  originalTeacherId: integer("original_teacher_id").notNull(),
  substituteTeacherId: integer("substitute_teacher_id").notNull(),
  status: text("status").notNull(), // "pending", "confirmed", "completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubstitutionSchema = createInsertSchema(substitutions).pick({
  date: true,
  period: true,
  class: true,
  originalTeacherId: true,
  substituteTeacherId: true,
  status: true,
});

// Period configuration model
export const periodConfigs = pgTable("period_configs", {
  id: serial("id").primaryKey(),
  periodNumber: integer("period_number").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertPeriodConfigSchema = createInsertSchema(periodConfigs).pick({
  periodNumber: true,
  startTime: true,
  endTime: true,
  active: true,
});

// Activity log model
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  teacherId: integer("teacher_id").notNull(),
  action: text("action").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  date: true,
  teacherId: true,
  action: true,
  status: true,
});

// Message model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  message: text("message").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull(), // "pending", "sent", "delivered", "failed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  teacherId: true,
  message: true,
  date: true,
  status: true,
});

// Types
export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Timetable = typeof timetable.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;

export type Substitution = typeof substitutions.$inferSelect;
export type InsertSubstitution = z.infer<typeof insertSubstitutionSchema>;

export type PeriodConfig = typeof periodConfigs.$inferSelect;
export type InsertPeriodConfig = z.infer<typeof insertPeriodConfigSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
