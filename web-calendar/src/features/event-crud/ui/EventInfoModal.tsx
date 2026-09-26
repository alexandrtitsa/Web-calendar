import React, { useState } from "react";
import type { CalendarEvent } from "@/entities/event";
import { useEventStore } from "@/entities/event";
import { useCalendarStore } from "@/entities/calendar";
import styles from "./EventModal.module.scss";

interface EventInfoModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
}

const formatDisplayDate = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDisplayTime = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const EventInfoModal: React.FC<EventInfoModalProps> = ({
  event,
  onClose,
  onEdit,
}) => {
  const { calendars } = useCalendarStore();
  const { deleteEvent } = useEventStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const currentCalendar = calendars.find((c) => c.id === event.calendarId);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      onClose();
    } catch (err) {
      console.error("Error deleting event:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isConfirmOpen) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <header className={styles.header}>
            <h2>Delete event</h2>
            <button
              onClick={onClose}
              className={styles.closeBtn}
              aria-label="Close"
            >
              ✕
            </button>
          </header>

          <p className={styles.deleteWarning}>
            Are you sure you want to delete {event.title}? You'll no longer have
            access to it.
          </p>

          <footer className={styles.deleteActions}>
            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              className={styles.cancelBtn}
            >
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
  }

  const dateText = formatDisplayDate(event.startDate);
  const startTimeText = formatDisplayTime(event.startDate);
  const endTimeText = formatDisplayTime(event.endDate);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>Event information</h2>
          <div className={styles.headerActions}>
            <button
              className={styles.iconBtn}
              onClick={onEdit}
              title="Edit event"
            >
              ✏️
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setIsConfirmOpen(true)}
              title="Delete event"
            >
              🗑️
            </button>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.row}>
            <span className={styles.icon}>T</span>
            <span className={styles.title}>{event.title}</span>
          </div>

          <div className={styles.row}>
            <span className={styles.icon}>🕒</span>
            <div className={styles.dateTimeGroup}>
              <div>
                {dateText}
                {!event.isAllDay && `, ${startTimeText} - ${endTimeText}`}
              </div>
              {event.isAllDay && <div className={styles.subText}>All day</div>}
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.icon}>📅</span>
            <div className={styles.calendarTag}>
              <span
                className={styles.colorDot}
                style={{ backgroundColor: currentCalendar?.color || "#3b82f6" }}
              />
              <span>{currentCalendar?.title || "Calendar"}</span>
            </div>
          </div>

          {event.description && (
            <div className={styles.row}>
              <span className={styles.icon}>≡</span>
              <p className={styles.description}>{event.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
