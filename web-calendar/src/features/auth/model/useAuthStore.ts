import { create } from 'zustand';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '@/shared/api/firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не вдалося увійти';
      set({ error: message, isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut(auth);
      set({ user: null, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Помилка при виході';
      set({ error: message, isLoading: false });
    }
  },

  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      set({ user: currentUser, isLoading: false });
    });
    return unsubscribe;
  },
}));