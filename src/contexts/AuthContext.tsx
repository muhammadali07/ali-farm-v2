import { createContext, useContext, ReactNode } from 'react';
import { User, Role, Language } from '../types';

interface AuthContextType {
  user: User | null;
  role: Role;
  lang: Language;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  value
}: {
  children: ReactNode;
  value: AuthContextType;
}) {
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
