import { useAuthStore } from "@/features/auth";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const logout = useAuthStore((state) => state.logout);

  return {
    user,
    isLoading,
    error,
    loginWithGoogle,
    logout,
  };
};
