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
  CalendarEvent,
  CreateEventDto,
  UpdateEventDto,
} from "@/entities/event";

const COLLECTION_NAME = "events";

export const eventService = {
  async getUserEvents(userId: string): Promise<CalendarEvent[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<CalendarEvent, "id">),
    }));
  },

  async createEvent(data: CreateEventDto): Promise<CalendarEvent> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: new Date().toISOString(),
    });

    return { id: docRef.id, createdAt: new Date().toISOString(), ...data };
  },

  async updateEvent(id: string, updates: UpdateEventDto): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...updates });
  },

  async deleteEvent(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },
};
