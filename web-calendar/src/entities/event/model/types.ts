export interface CalendarEvent {
  id: string;
  userId: string;
  calendarId: string;
  title: string;
  description?: string;
  startDate: string; // ISO String: "2026-09-18T09:00:00.000Z"
  endDate: string;   // ISO String: "2026-09-18T10:00:00.000Z"
  isAllDay: boolean;
  createdAt: string;
}

export type CreateEventDto = Omit<CalendarEvent, 'id' | 'createdAt'>;
export type UpdateEventDto = Partial<Omit<CalendarEvent, 'id' | 'userId' | 'createdAt'>>;