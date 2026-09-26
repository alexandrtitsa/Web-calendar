import React from "react";
import { useCalendarStore } from "@/entities/calendar";
import { useAuthStore } from "@/features/auth";
import { formatHeaderDate } from "@/shared/lib/dateUtils";
import { LogoIcon } from "@/shared/assets/icons/LogoIcon";
import { UserIcon } from "@/shared/assets/icons/UserIcon";
import styles from "./Header.module.scss";

export const Header: React.FC = () => {
  const {
    currentDate,
    viewMode,
    setViewMode,
    nextPeriod,
    prevPeriod,
    setToday,
  } = useCalendarStore();
  const { user, logout } = useAuthStore();

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.logo}>
          <LogoIcon className={styles.logoIcon} />
          <span className={styles.logoText}>WebCalendar</span>
        </div>

        <button onClick={setToday} className={styles.todayBtn}>
          Today
        </button>

        <div className={styles.navGroup}>
          <button
            onClick={prevPeriod}
            className={styles.navBtn}
            aria-label="Previous period"
          >
            ‹
          </button>
          <button
            onClick={nextPeriod}
            className={styles.navBtn}
            aria-label="Next period"
          >
            ›
          </button>
        </div>

        <h2 className={styles.currentDate}>{formatHeaderDate(currentDate)}</h2>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.selectWrapper}>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "day" | "week")}
            className={styles.viewSelect}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
          </select>
        </div>

        {user && (
          <div className={styles.userProfile} onClick={logout} title="Logout">
            <span className={styles.userName}>
              {user.displayName || "Username"}
            </span>
            <div className={styles.avatarIconWrapper}>
              <UserIcon className={styles.userIcon} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
