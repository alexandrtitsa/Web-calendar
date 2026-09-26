import { create } from 'zustand';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/shared/api/firebase';
import { eventService } from '@/entities/event';
import type {
  CalendarEvent,
  CreateEventDto,
  UpdateEventDto,
} from '@/entities/event/model/types';

interface EventState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;

  subscribeToEvents: (userId: string) => () => void;

  createEvent: (dto: CreateEventDto) => Promise<void>;
  updateEvent: (id: string, updates: UpdateEventDto) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  isLoading: false,
  error: null,

  subscribeToEvents: (userId: string) => {
    set({ isLoading: true });

    const q = query(
      collection(db, 'events'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const events = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CalendarEvent, 'id'>),
        }));

        set({ events, isLoading: false });
      },
      (error) => {
        set({ error: error.message, isLoading: false });
      }
    );

    return unsubscribe;
  },

  createEvent: async (dto) => {
    await eventService.createEvent(dto);
  },

  updateEvent: async (id, updates) => {
    await eventService.updateEvent(id, updates);
  },

  deleteEvent: async (id) => {
    await eventService.deleteEvent(id);
  },
}));