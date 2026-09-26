import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/shared/api/firebase";
import type {
  Calendar,
  CreateCalendarDto,
  UpdateCalendarDto,
} from "@/entities/calendar";

const COLLECTION_NAME = "calendars";

export const calendarService = {
  async getUserCalendars(userId: string): Promise<Calendar[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const defaultCalendar = await this.createDefaultCalendar(userId);
      return [defaultCalendar];
    }

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Calendar, "id">),
    }));
  },

  async createDefaultCalendar(userId: string): Promise<Calendar> {
    const defaultData: CreateCalendarDto = {
      userId,
      title: "Default",
      color: "#10B981",
      isDefault: true,
      isVisible: true,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...defaultData,
      createdAt: new Date().toISOString(),
    });

    return {
      id: docRef.id,
      createdAt: new Date().toISOString(),
      ...defaultData,
    };
  },

  async createCalendar(data: CreateCalendarDto): Promise<Calendar> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      isDefault: false,
      createdAt: new Date().toISOString(),
    });

    return { id: docRef.id, createdAt: new Date().toISOString(), ...data };
  },

  async updateCalendar(id: string, updates: UpdateCalendarDto): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...updates });
  },

  async deleteCalendar(calendar: Calendar): Promise<void> {
    if (calendar.isDefault) {
      throw new Error("It is not possible to delete the default calendar");
    }
    const docRef = doc(db, COLLECTION_NAME, calendar.id);
    await deleteDoc(docRef);
  },
};
