import { format, parse, isToday, isTomorrow, isYesterday, addDays } from 'date-fns';

// Format a date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Format a date to a readable format
export const formatReadableDate = (date: Date): string => {
  return format(date, 'EEEE, MMMM d, yyyy');
};

// Format a date to a short format
export const formatShortDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

// Get current date in YYYY-MM-DD format
export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

// Get a relative date description
export const getRelativeDateDescription = (dateStr: string): string => {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  
  if (isToday(date)) {
    return 'Today';
  } else if (isTomorrow(date)) {
    return 'Tomorrow';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'EEEE, MMMM d');
  }
};

// Get a list of days of the week
export const getDaysOfWeek = (): string[] => {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
};

// Get the current day of the week
export const getCurrentDay = (): string => {
  return format(new Date(), 'EEEE');
};

// Get a date for a specific day of the week
export const getDateForDayOfWeek = (dayName: string): Date => {
  const today = new Date();
  const currentDayNum = today.getDay();
  const targetDayNum = getDaysOfWeek().findIndex(day => day === dayName) + 1; // 1 = Monday, 7 = Sunday
  
  const daysToAdd = (targetDayNum - currentDayNum + 7) % 7;
  return addDays(today, daysToAdd);
};

// Format time in 12-hour format
export const formatTime = (timeStr: string): string => {
  const date = parse(timeStr, 'HH:mm', new Date());
  return format(date, 'h:mm a');
};

// Get current time in HH:MM format
export const getCurrentTime = (): string => {
  return format(new Date(), 'HH:mm');
};

// Check if a time is between start and end
export const isTimeBetween = (time: string, start: string, end: string): boolean => {
  const timeDate = parse(time, 'HH:mm', new Date());
  const startDate = parse(start, 'HH:mm', new Date());
  const endDate = parse(end, 'HH:mm', new Date());
  
  return timeDate >= startDate && timeDate <= endDate;
};
