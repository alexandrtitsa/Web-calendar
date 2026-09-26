import React, { useState } from "react";
import { useCalendarStore } from "@/entities/calendar";
import type { Calendar } from "@/entities/calendar";
import { DatePicker } from "@/shared/ui";
import { CalendarModal } from "@/features/calendar-crud";
import { DeleteCalendarModal } from "@/features/calendar-crud";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  onOpenCreateEventModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateEventModal }) => {
  const { calendars, currentDate, setCurrentDate, toggleCalendarVisibility } =
    useCalendarStore();

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<Calendar | null>(null);
  const [deletingCalendar, setDeletingCalendar] = useState<Calendar | null>(
    null,
  );

  const handleOpenCreate = () => {
    setEditingCalendar(null);
    setIsCalendarModalOpen(true);
  };

  const handleOpenEdit = (calendar: Calendar) => {
    setEditingCalendar(calendar);
    setIsCalendarModalOpen(true);
  };

  return (
    <aside className={styles.sidebar}>
      <button className={styles.createBtn} onClick={onOpenCreateEventModal}>
        + Create
      </button>

      <div className={styles.miniCalendarWrapper}>
        <DatePicker selectedDate={currentDate} onChange={setCurrentDate} />
      </div>

      {/* Блок My calendars */}
      <div className={styles.calendarCard}>
        <div className={styles.cardHeader}>
          <h3>My calendars</h3>
          <button
            onClick={handleOpenCreate}
            title="Add calendar"
            className={styles.addBtn}
            aria-label="Add calendar"
          >
            +
          </button>
        </div>

        <ul className={styles.calendarList}>
          {calendars.map((calendar) => (
            <li key={calendar.id} className={styles.calendarItem}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={calendar.isVisible}
                  onChange={() => toggleCalendarVisibility(calendar.id)}
                  style={{ accentColor: calendar.color }}
                />
                <span className={styles.title}>{calendar.title}</span>
              </label>

              <div className={styles.itemActions}>
                {!calendar.isDefault && (
                  <button
                    className={styles.actionBtn}
                    onClick={() => setDeletingCalendar(calendar)}
                    title="Delete calendar"
                    aria-label="Delete calendar"
                  >
                    🗑️
                  </button>
                )}
                <button
                  className={styles.actionBtn}
                  onClick={() => handleOpenEdit(calendar)}
                  title="Edit calendar"
                  aria-label="Edit calendar"
                >
                  ✏️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isCalendarModalOpen && (
        <CalendarModal
          calendarToEdit={editingCalendar}
          onClose={() => setIsCalendarModalOpen(false)}
        />
      )}

      {deletingCalendar && (
        <DeleteCalendarModal
          calendar={deletingCalendar}
          onClose={() => setDeletingCalendar(null)}
        />
      )}
    </aside>
  );
};
