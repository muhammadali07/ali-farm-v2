import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { User, Role, Language } from "@/types";

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  role: Role;
  lang: Language;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role?: Role,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  setLang: (lang: Language) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>(Language.ID);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const profile = await userService.findByAuthId(authUser.id);
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Timeout fallback - if session check takes too long, stop loading
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Session check timeout, stopping loading state");
        setLoading(false);
      }
    }, 2000);

    // Get initial session
    const initSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }

        setSession(session);
        setSupabaseUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error in session init:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      setSession(session);
      setSupabaseUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        await fetchUserProfile(session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
      // Auth state change listener will handle the rest
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: Role = Role.GUEST,
  ) => {
    setLoading(true);
    try {
      await authService.signUp(email, password, { name, role });
      // Auth state change listener will handle the rest
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setSupabaseUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (supabaseUser) {
      await fetchUserProfile(supabaseUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        role: user?.role || Role.GUEST,
        lang,
        loading,
        signIn,
        signUp,
        signOut,
        setLang,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook for pages that need auth - will show loading state
export function useRequireAuth() {
  const context = useAuth();
  return context;
}

// Hook for pages that don't require auth - won't block on loading
export function useOptionalAuth() {
  const context = useContext(AuthContext);
  return context;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthContext;
