import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { GoogleIcon } from "@/shared/assets/icons/GoogleIcon";
import { LogoIcon } from "@/shared/assets/icons/LogoIcon";
import styles from "./LoginPage.module.scss";

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoHeader}>
          <LogoIcon className={styles.logoIcon} />
          <h1 className={styles.title}>WebCalendar</h1>
        </div>

        <button className={styles.googleBtn} onClick={handleGoogleLogin}>
          <GoogleIcon className={styles.icon} />
          Continue with Google
        </button>
      </div>
    </div>
  );
};
