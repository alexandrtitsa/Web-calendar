import { create } from 'zustand';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/shared/api/firebase';
import { calendarService } from '@/entities/calendar';
import type {
  Calendar,
  CreateCalendarDto,
  UpdateCalendarDto,
} from '@/entities/calendar/model/types';

export type CalendarViewMode = 'day' | 'week';

interface CalendarState {
  currentDate: Date;
  viewMode: CalendarViewMode;

  calendars: Calendar[];
  isLoading: boolean;
  error: string | null;

  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  nextPeriod: () => void;
  prevPeriod: () => void;
  setToday: () => void;

  subscribeToCalendars: (userId: string) => () => void;

  createCalendar: (dto: CreateCalendarDto) => Promise<void>;
  updateCalendar: (id: string, updates: UpdateCalendarDto) => Promise<void>;
  toggleCalendarVisibility: (id: string) => Promise<void>;
  deleteCalendar: (calendar: Calendar) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: new Date(),
  viewMode: 'week',
  calendars: [],
  isLoading: true,
  error: null,

  setCurrentDate: (currentDate) => set({ currentDate }),
  setViewMode: (viewMode) => set({ viewMode }),
  setToday: () => set({ currentDate: new Date() }),

  nextPeriod: () => {
    const { currentDate, viewMode } = get();
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    set({ currentDate: newDate });
  },

  prevPeriod: () => {
    const { currentDate, viewMode } = get();
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    set({ currentDate: newDate });
  },

  subscribeToCalendars: (userId: string) => {
    set({ isLoading: true });

    const q = query(
      collection(db, 'calendars'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          await calendarService.createDefaultCalendar(userId);
          return;
        }

        const calendars = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Calendar, 'id'>),
        }));

        set({ calendars, isLoading: false });
      },
      (error) => set({ error: error.message, isLoading: false })
    );

    return unsubscribe;
  },

  createCalendar: async (dto) => {
    await calendarService.createCalendar(dto);
  },

  updateCalendar: async (id, updates) => {
    await calendarService.updateCalendar(id, updates);
  },

  toggleCalendarVisibility: async (id) => {
    const calendar = get().calendars.find((c) => c.id === id);
    if (calendar) {
      await calendarService.updateCalendar(id, {
        isVisible: !calendar.isVisible,
      });
    }
  },

  deleteCalendar: async (calendar) => {
    await calendarService.deleteCalendar(calendar);
  },
}));