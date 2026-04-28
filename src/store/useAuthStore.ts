import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User,
  Session,
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  signInWithMagicLink,
  signOut as supabaseSignOut,
  getCurrentUser,
  getSession,
  onAuthStateChange,
} from '@/lib/database/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signInWithLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      initialized: false,

      initialize: async () => {
        try {
          const session = await getSession();
          const user = await getCurrentUser();
          set({ 
            session, 
            user, 
            loading: false,
            initialized: true 
          });

          onAuthStateChange((event, session) => {
            set({ 
              session, 
              user: session?.user || null 
            });
          });
        } catch (error) {
          set({ 
            loading: false,
            initialized: true 
          });
        }
      },

      signIn: async (email, password) => {
        set({ loading: true });
        try {
          const { data, error } = await signInWithEmail(email, password);
          if (error) throw error;
          set({ 
            session: data.session, 
            user: data.session?.user || null,
            loading: false 
          });
          return { error: null };
        } catch (error: any) {
          set({ loading: false });
          return { error: new Error(error.message) };
        }
      },

      signUp: async (email, password, fullName) => {
        set({ loading: true });
        try {
          const { data, error } = await signUpWithEmail(email, password, { 
            data: { full_name: fullName } 
          });
          if (error) throw error;
          if (data.user) {
            set({ 
              user: data.user,
              loading: false 
            });
          }
          return { error: null };
        } catch (error: any) {
          set({ loading: false });
          return { error: new Error(error.message) };
        }
      },

      signInWithGoogle: async () => {
        set({ loading: true });
        try {
          const { error } = await signInWithOAuth('google');
          if (error) throw error;
          return { error: null };
        } catch (error: any) {
          set({ loading: false });
          return { error: new Error(error.message) };
        }
      },

      signInWithGithub: async () => {
        set({ loading: true });
        try {
          const { error } = await signInWithOAuth('github');
          if (error) throw error;
          return { error: null };
        } catch (error: any) {
          set({ loading: false });
          return { error: new Error(error.message) };
        }
      },

      signInWithLink: async (email) => {
        set({ loading: true });
        try {
          const { error } = await signInWithMagicLink(email);
          if (error) throw error;
          set({ loading: false });
          return { error: null };
        } catch (error: any) {
          set({ loading: false });
          return { error: new Error(error.message) };
        }
      },

      signOut: async () => {
        set({ loading: true });
        await supabaseSignOut();
        set({ 
          user: null, 
          session: null, 
          loading: false 
        });
      },

      resetPassword: async (email) => {
        try {
          const { error } = await import('@/lib/database/client').then(m => m.resetPassword(email));
          if (error) throw error;
          return { error: null };
        } catch (error: any) {
          return { error: new Error(error.message) };
        }
      },
    }),
    {
      name: 'synergyhub-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);