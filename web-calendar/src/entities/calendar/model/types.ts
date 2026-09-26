export interface Calendar {
  id: string;
  userId: string;
  title: string;
  color: string;
  isDefault: boolean;
  isVisible: boolean;
  createdAt: string;
}

export type CreateCalendarDto = Omit<Calendar, 'id' | 'createdAt'>;
export type UpdateCalendarDto = Partial<Omit<Calendar, 'id' | 'userId' | 'isDefault' | 'createdAt'>>;