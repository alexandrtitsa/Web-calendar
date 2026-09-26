import React, { useState } from 'react';
import type { CalendarEvent, CreateEventDto, UpdateEventDto } from '@/entities/event';
import { useEventStore } from '@/entities/event';
import { useCalendarStore } from '@/entities/calendar';
import { useAuthStore } from '@/features/auth';
import styles from './EventModal.module.scss';

interface EventModalProps {
  eventToEdit?: CalendarEvent | null;
  initialStartDate?: Date | string | null;
  onClose: () => void;
}

const parseIsoDate = (dateObj?: Date | string | null) => {
  if (!dateObj) return { date: '', time: '' };
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
};

const getDefaultEndTime = (timeStr: string) => {
  if (!timeStr) return '13:00';
  const [h, m] = timeStr.split(':').map(Number);
  const endHour = String((h + 1) % 24).padStart(2, '0');
  return `${endHour}:${String(m).padStart(2, '0')}`;
};

const toIsoString = (dateStr: string, timeStr: string) => {
  if (!dateStr) return new Date().toISOString();
  const [hours, minutes] = (timeStr || '00:00').split(':');
  const date = new Date(dateStr);
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return date.toISOString();
};

export const EventModal: React.FC<EventModalProps> = ({
  eventToEdit,
  initialStartDate,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { calendars } = useCalendarStore();
  const { createEvent, updateEvent } = useEventStore(); // Беремо методи для подій з useEventStore

  const isEditing = Boolean(eventToEdit);

  const initialStart = parseIsoDate(eventToEdit?.startDate || initialStartDate);
  const initialEnd = parseIsoDate(eventToEdit?.endDate);

  const defaultDateStr = initialStart.date || new Date().toISOString().split('T')[0];
  const defaultStartTimeStr = initialStart.time || '12:00';
  const defaultEndTimeStr = initialEnd.time || getDefaultEndTime(defaultStartTimeStr);

  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [date, setDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState(defaultStartTimeStr);
  const [endTime, setEndTime] = useState(defaultEndTimeStr);
  const [isAllDay, setIsAllDay] = useState(eventToEdit?.isAllDay || false);
  const [calendarId, setCalendarId] = useState(
    eventToEdit?.calendarId || calendars[0]?.id || ''
  );
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCalendar = calendars.find((c) => c.id === calendarId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !calendarId || !user) return;

    setIsSubmitting(true);
    try {
      const startDate = toIsoString(date, startTime);
      const endDate = toIsoString(date, endTime);

      if (isEditing && eventToEdit) {
        const updateDto: UpdateEventDto = {
          title: title.trim(),
          startDate,
          endDate,
          isAllDay,
          calendarId,
          description: description.trim(),
        };
        await updateEvent(eventToEdit.id, updateDto);
      } else {
        const createDto: CreateEventDto = {
          userId: user.uid,
          calendarId,
          title: title.trim(),
          description: description.trim(),
          startDate,
          endDate,
          isAllDay,
        };
        await createEvent(createDto);
      }
      onClose();
    } catch (err) {
      console.error('Error saving event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>{isEditing ? 'Edit event' : 'Create event'}</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
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
            <span className={styles.icon}>🕒</span>
            <div className={styles.dateTimeGroup}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={styles.underlineInput}
                />
              </div>

              {!isAllDay && (
                <div className={styles.timeInputs}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={styles.underlineInput}
                    />
                  </div>
                  <span className={styles.timeSeparator}>–</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`${styles.underlineInput} ${styles.endTimeInput}`}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={`${styles.row} ${styles.optionsRow}`}>
            <span className={styles.iconPlaceholder} />
            <div className={styles.optionsGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                />
                <span>All day</span>
              </label>
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.icon}>📅</span>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Calendar</label>
              <div className={styles.calendarSelectWrapper}>
                <span
                  className={styles.colorBadge}
                  style={{ backgroundColor: selectedCalendar?.color || '#3b82f6' }}
                />
                <select
                  value={calendarId}
                  onChange={(e) => setCalendarId(e.target.value)}
                  className={styles.underlineSelect}
                >
                  {calendars.map((cal) => (
                    <option key={cal.id} value={cal.id}>
                      {cal.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.icon}>≡</span>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                rows={2}
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.underlineInput}
              />
            </div>
          </div>

          <footer className={styles.actions}>
            <button type="submit" disabled={isSubmitting} className={styles.saveBtn}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
