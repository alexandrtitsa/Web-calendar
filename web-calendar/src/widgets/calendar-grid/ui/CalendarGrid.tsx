import React, { useState, useRef, useEffect, useMemo } from "react";
import { useCalendarStore } from "@/entities/calendar";
import { useEventStore } from "@/entities/event";
import { getWeekDays, getEventPosition } from "@/shared/lib/dateUtils";
import { isSameDay, format, setHours, setMinutes, addMinutes } from "date-fns";
import { TimeIndicator } from "@/widgets/calendar-grid";
import { EventModal, EventInfoModal } from "@/features/event-crud";
import type { CalendarEvent } from "@/entities/event";
import styles from "./CalendarGrid.module.scss";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60;

type DragAction = {
  type: "move" | "resize-top" | "resize-bottom";
  event: CalendarEvent;
  startY: number;
  initialStartDate: Date;
  initialEndDate: Date;
  dayIndex: number;
};

export const CalendarGrid: React.FC = () => {
  const { currentDate, viewMode, calendars } = useCalendarStore();
  const { events = [], updateEvent } = useEventStore();

  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);

  const [dragAction, setDragAction] = useState<DragAction | null>(null);
  const [draggedOffsetMinutes, setDraggedOffsetMinutes] = useState<number>(0);
  const [targetDayIndex, setTargetDayIndex] = useState<number | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const daysGridRef = useRef<HTMLDivElement>(null);
  const days = useMemo(() => {
    return viewMode === "week" ? getWeekDays(currentDate) : [currentDate];
  }, [viewMode, currentDate]);

  const visibleCalendarIds = new Set(
    calendars.filter((c) => c.isVisible).map((c) => c.id)
  );

  const handleCellClick = (day: Date, hour: number) => {
    const slotDate = setMinutes(setHours(day, hour), 0);
    setSelectedSlotDate(slotDate);
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    if (!hasDragged) {
      setSelectedEvent(event);
    }
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    event: CalendarEvent,
    type: "move" | "resize-top" | "resize-bottom",
    dayIndex: number
  ) => {
    e.stopPropagation();

    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    setHasDragged(false);

    setDragAction({
      type,
      event,
      startY: e.clientY,
      initialStartDate: new Date(event.startDate),
      initialEndDate: new Date(event.endDate),
      dayIndex,
    });
    setTargetDayIndex(dayIndex);
  };

  useEffect(() => {
    if (!dragAction) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragStartPosRef.current) {
        const deltaX = Math.abs(e.clientX - dragStartPosRef.current.x);
        const deltaY = Math.abs(e.clientY - dragStartPosRef.current.y);
        if (deltaX > 5 || deltaY > 5) {
          setHasDragged(true);
        }
      }

      const deltaY = e.clientY - dragAction.startY;
      const minutesDelta = Math.round(((deltaY / HOUR_HEIGHT) * 60) / 15) * 15;
      setDraggedOffsetMinutes(minutesDelta);

      if (daysGridRef.current && dragAction.type === "move") {
        const rect = daysGridRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const colWidth = rect.width / days.length;
        const newDayIndex = Math.min(
          Math.max(0, Math.floor(relativeX / colWidth)),
          days.length - 1
        );
        setTargetDayIndex(newDayIndex);
      }
    };

    const handleMouseUp = async () => {
      if (dragAction && hasDragged) {
        const { type, event, initialStartDate, initialEndDate, dayIndex } =
          dragAction;
        let newStart = new Date(initialStartDate);
        let newEnd = new Date(initialEndDate);

        const currentTargetDayIndex = targetDayIndex ?? dayIndex;
        if (currentTargetDayIndex !== dayIndex) {
          const targetDay = days[currentTargetDayIndex];
          const daysDiff = Math.round(
            (targetDay.getTime() - days[dayIndex].getTime()) /
              (1000 * 60 * 60 * 24)
          );
          newStart.setDate(newStart.getDate() + daysDiff);
          newEnd.setDate(newEnd.getDate() + daysDiff);
        }

        if (type === "move") {
          newStart = addMinutes(newStart, draggedOffsetMinutes);
          newEnd = addMinutes(newEnd, draggedOffsetMinutes);
        } else if (type === "resize-top") {
          const proposedStart = addMinutes(newStart, draggedOffsetMinutes);
          if (proposedStart < addMinutes(newEnd, -15)) {
            newStart = proposedStart;
          }
        } else if (type === "resize-bottom") {
          const proposedEnd = addMinutes(newEnd, draggedOffsetMinutes);
          if (proposedEnd > addMinutes(newStart, 15)) {
            newEnd = proposedEnd;
          }
        }

        if (
          newStart.toISOString() !== event.startDate ||
          newEnd.toISOString() !== event.endDate
        ) {
          await updateEvent(event.id, {
            startDate: newStart.toISOString(),
            endDate: newEnd.toISOString(),
          });
        }
      }

      setDragAction(null);
      setDraggedOffsetMinutes(0);
      setTargetDayIndex(null);
      dragStartPosRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    dragAction,
    draggedOffsetMinutes,
    targetDayIndex,
    days,
    updateEvent,
    hasDragged,
  ]);

  return (
    <div className={styles.gridContainer}>
      {/* Дні тижня */}
      <div className={styles.headerRow}>
        <div className={styles.timeGutterHeader} />
        {days.map((day) => (
          <div key={day.toISOString()} className={styles.dayHeader}>
            <span className={styles.dayName}>{format(day, "EEE")}</span>
            <span className={styles.dayNumber}>{format(day, "d")}</span>
          </div>
        ))}
      </div>

      {/* Секція для цілоденних подій (All-Day Events) */}
      <div className={styles.allDayRow}>
        <div className={styles.timeGutterHeader}>
          <span className={styles.allDayLabel}>all-day</span>
        </div>
        <div
          className={styles.allDayColumns}
          style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
        >
          {days.map((day) => {
            const allDayEvents = (events || []).filter(
              (e) =>
                visibleCalendarIds.has(e.calendarId) &&
                e.isAllDay &&
                e.startDate &&
                isSameDay(new Date(e.startDate), day)
            );

            return (
              <div key={`all-day-${day.toISOString()}`} className={styles.allDayColumn}>
                {allDayEvents.map((event) => {
                  const calendar = calendars.find((c) => c.id === event.calendarId);

                  return (
                    <div
                      key={event.id}
                      className={styles.allDayEventBadge}
                      onClick={(e) => handleEventClick(e, event)}
                      style={{
                        backgroundColor: calendar?.color || "#3B82F6",
                      }}
                    >
                      <span className={styles.allDayTitle}>{event.title}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Годинна сітка зi звичайними подіями */}
      <div className={styles.body}>
        <div className={styles.timeColumn}>
          {HOURS.map((hour) => (
            <div key={hour} className={styles.timeSlot}>
              {`${hour}:00`}
            </div>
          ))}
        </div>

        <div
          ref={daysGridRef}
          className={styles.daysColumns}
          style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
        >
          {days.map((day, dayIndex) => {
            // Фільтруємо лише події з конкретним часом (не isAllDay)
            const timedEvents = (events || []).filter(
              (e) =>
                visibleCalendarIds.has(e.calendarId) &&
                !e.isAllDay &&
                e.startDate &&
                isSameDay(new Date(e.startDate), day)
            );

            return (
              <div key={day.toISOString()} className={styles.dayColumn}>
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className={styles.hourCell}
                    onClick={() => handleCellClick(day, hour)}
                  />
                ))}

                <TimeIndicator day={day} />

                {timedEvents.map((event) => {
                  const calendar = calendars.find((c) => c.id === event.calendarId);
                  const isBeingDragged = dragAction?.event.id === event.id;

                  let displayStart = new Date(event.startDate);
                  let displayEnd = new Date(event.endDate);

                  if (isBeingDragged && dragAction) {
                    if (dragAction.type === "move") {
                      displayStart = addMinutes(displayStart, draggedOffsetMinutes);
                      displayEnd = addMinutes(displayEnd, draggedOffsetMinutes);
                    } else if (dragAction.type === "resize-top") {
                      displayStart = addMinutes(displayStart, draggedOffsetMinutes);
                    } else if (dragAction.type === "resize-bottom") {
                      displayEnd = addMinutes(displayEnd, draggedOffsetMinutes);
                    }
                  }

                  const { top, height } = getEventPosition(
                    displayStart.toISOString(),
                    displayEnd.toISOString()
                  );

                  return (
                    <div
                      key={event.id}
                      className={`${styles.eventCard} ${isBeingDragged ? styles.dragging : ""}`}
                      onClick={(e) => handleEventClick(e, event)}
                      onMouseDown={(e) => handleMouseDown(e, event, "move", dayIndex)}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: calendar?.color || "#3B82F6",
                      }}
                    >
                      <div
                        className={styles.resizeHandleTop}
                        onMouseDown={(e) =>
                          handleMouseDown(e, event, "resize-top", dayIndex)
                        }
                      />

                      <div className={styles.eventTitle}>{event.title}</div>
                      <div className={styles.eventTime}>
                        {format(displayStart, "HH:mm")} - {format(displayEnd, "HH:mm")}
                      </div>

                      <div
                        className={styles.resizeHandleBottom}
                        onMouseDown={(e) =>
                          handleMouseDown(e, event, "resize-bottom", dayIndex)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {selectedEvent && (
        <EventInfoModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => {
            setEventToEdit(selectedEvent);
            setSelectedEvent(null);
          }}
        />
      )}

      {selectedSlotDate && (
        <EventModal
          initialStartDate={selectedSlotDate}
          onClose={() => setSelectedSlotDate(null)}
        />
      )}

      {eventToEdit && (
        <EventModal
          eventToEdit={eventToEdit}
          onClose={() => setEventToEdit(null)}
        />
      )}
    </div>
  );
};