import React, { useEffect, useState } from 'react';
import { differenceInMinutes, startOfDay, isSameDay } from 'date-fns';
import styles from './TimeIndicator.module.scss';

interface TimeIndicatorProps {
  day: Date;
}

export const TimeIndicator: React.FC<TimeIndicatorProps> = ({ day }) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  if (!isSameDay(day, now)) {
    return null;
  }

  const minutesFromStart = differenceInMinutes(now, startOfDay(now));

  return (
    <div
      className={styles.indicator}
      style={{ top: `${minutesFromStart}px` }}
    >
      <div className={styles.dot} />
      <div className={styles.line} />
    </div>
  );
};