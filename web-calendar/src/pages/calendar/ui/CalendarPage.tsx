import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth";
import { useCalendarStore } from "@/entities/calendar";
import { useEventStore } from "@/entities/event";
import { Header } from "@/widgets/header";
import { Sidebar } from "@/widgets/sidebar";
import { CalendarGrid } from "@/widgets/calendar-grid";
import { EventModal } from "@/features/event-crud";
import styles from "./CalendarPage.module.scss";

export const CalendarPage: React.FC = () => {
  const { user } = useAuthStore();
  const { subscribeToCalendars, isLoading: isCalendarLoading } = useCalendarStore();
  const { subscribeToEvents, isLoading: isEventLoading } = useEventStore();

  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    const unsubCalendars = subscribeToCalendars(user.uid);
    const unsubEvents = subscribeToEvents(user.uid);

    return () => {
      if (typeof unsubCalendars === "function") unsubCalendars();
      if (typeof unsubEvents === "function") unsubEvents();
    };
  }, [user, subscribeToCalendars, subscribeToEvents]);

  const isLoading = isCalendarLoading || isEventLoading;

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinner} />
        <p>Loading the calendar...</p>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.content}>
        <Sidebar onOpenCreateEventModal={() => setIsEventModalOpen(true)} />
        <main className={styles.mainGrid}>
          <CalendarGrid />
        </main>
      </div>

      {isEventModalOpen && (
        <EventModal onClose={() => setIsEventModalOpen(false)} />
      )}
    </div>
  );
};
