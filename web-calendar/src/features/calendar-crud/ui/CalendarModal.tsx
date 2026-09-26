import React, { useState } from "react";
import { useCalendarStore } from "@/entities/calendar";
import type { Calendar } from "@/entities/calendar";
import { useAuthStore } from "@/features/auth";
import styles from "./CalendarModal.module.scss";

const CALENDAR_COLORS = [
  "#fb7185", // rose-400
  "#fb923c", // orange-400
  "#facc15", // yellow-400
  "#a3e635", // lime-400
  "#4ade80", // green-400
  "#34d399", // emerald-400
  "#22d3ee", // cyan-400
  "#60a5fa", // blue-400
  "#818cf8", // indigo-400
  "#a78bfa", // violet-400
  "#e879f9", // fuchsia-400
  "#94a3b8", // slate-400
];

interface CalendarModalProps {
  calendarToEdit?: Calendar | null;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  calendarToEdit,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { createCalendar, updateCalendar } = useCalendarStore();

  const isEditing = Boolean(calendarToEdit);

  const [title, setTitle] = useState(calendarToEdit?.title || "");
  const [color, setColor] = useState(
    calendarToEdit?.color || CALENDAR_COLORS[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setIsSubmitting(true);
    try {
      if (isEditing && calendarToEdit) {
        await updateCalendar(calendarToEdit.id, { title: title.trim(), color });
      } else {
        await createCalendar({
          userId: user.uid,
          title: title.trim(),
          color,
          isVisible: true,
          isDefault: false,
        });
      }
      onClose();
    } catch (err) {
      console.error("Error saving calendar:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>{isEditing ? "Edit calendar" : "Create calendar"}</h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <span className={styles.icon}>T</span>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Title</label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                className={styles.underlineInput}
              />
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.icon}>🎨</span>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Colour</label>
              <div className={styles.colorGrid}>
                {CALENDAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.colorSwatch} ${color === c ? styles.selected : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <footer className={styles.actions}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.saveBtn}
            >
              Save
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
