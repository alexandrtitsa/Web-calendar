import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  differenceInMinutes, 
  startOfDay 
} from 'date-fns';
import { enUS } from 'date-fns/locale';

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Початок з понеділка
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getEventPosition = (startDateStr: string, endDateStr: string) => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const dayStart = startOfDay(start);
  const startMinutes = differenceInMinutes(start, dayStart);
  const durationMinutes = Math.max(differenceInMinutes(end, start), 30); // Мін. тривалість 30 хв

  const top = startMinutes; 
  const height = durationMinutes;

  return { top, height };
};

export const formatHeaderDate = (date: Date): string => {
  return format(date, 'LLLL yyyy', { locale: enUS });
};