import React, { useState } from 'react';
import styles from './DatePicker.module.scss';

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  locale?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  locale = 'en-US',
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const calendarDays = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }

  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
    });
  }

  return (
    <div className={styles.calendar}>
      <header className={styles.header}>
        <span className={styles.monthTitle}>
          {currentMonth.toLocaleString(locale, {
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <div className={styles.navGroup}>
          <button onClick={handlePrevMonth} aria-label="Previous month">‹</button>
          <button onClick={handleNextMonth} aria-label="Next month">›</button>
        </div>
      </header>

      <div className={styles.grid}>
        {dayHeaders.map((day, index) => (
          <span key={`header-${index}`} className={styles.dayHeader}>
            {day}
          </span>
        ))}

        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const isSelected =
            selectedDate.getDate() === date.getDate() &&
            selectedDate.getMonth() === date.getMonth() &&
            selectedDate.getFullYear() === date.getFullYear();

          const classNames = [
            styles.dayCell,
            !isCurrentMonth ? styles['dayCell--outside'] : '',
            isSelected ? styles['dayCell--selected'] : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={index}
              className={classNames}
              onClick={() => {
                onChange(date);
                if (!isCurrentMonth) {
                  setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                }
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};