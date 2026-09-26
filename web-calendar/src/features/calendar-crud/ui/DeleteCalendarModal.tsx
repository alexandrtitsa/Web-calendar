import React, { useState } from "react";
import { useCalendarStore } from "@/entities/calendar";
import type { Calendar } from "@/entities/calendar";
import styles from "./CalendarModal.module.scss";

interface DeleteCalendarModalProps {
  calendar: Calendar;
  onClose: () => void;
}

export const DeleteCalendarModal: React.FC<DeleteCalendarModalProps> = ({
  calendar,
  onClose,
}) => {
  const { deleteCalendar } = useCalendarStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCalendar(calendar);
      onClose();
    } catch (err) {
      console.error("Error deleting calendar:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>Delete calendar</h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <p className={styles.deleteWarning}>
          Are you sure you want to delete {calendar.title}? You'll no longer
          have access to this calendar and its events.
        </p>

        <footer className={styles.deleteActions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={styles.confirmDeleteBtn}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </footer>
      </div>
    </div>
  );
};
