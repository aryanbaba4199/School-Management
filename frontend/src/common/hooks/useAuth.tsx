/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { IUser } from '../types/user.types';

/*------------- Auth Types -------------*/

export interface AuthContextProps {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: IUser) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

/*------------- JWT Utility Helper -------------*/

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;
  // exp is in seconds, Date.now() in ms
  return decoded.exp * 1000 < Date.now();
}

/*------------- Auth Provider Component -------------*/

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        if (isTokenExpired(storedToken)) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          return null;
        }
        return storedToken;
      }
    } catch {
      // Ignore reading storage errors on init
    }
    return null;
  });

  const [user, setUser] = useState<IUser | null>(() => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      if (storedToken && storedUser && !isTokenExpired(storedToken)) {
        const parsedUser = JSON.parse(storedUser) as IUser;
        if (typeof parsedUser.role === 'string') {
          parsedUser.role = { name: parsedUser.role, access: [] } as any;
        }
        return parsedUser;
      }
    } catch {
      // Ignore reading storage errors on init
    }
    return null;
  });

  const [loading] = useState<boolean>(false);

  const login = useCallback((newToken: string, newUser: IUser) => {
    try {
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    } catch (e) {
      console.warn('Failed to store authentication credentials in localStorage', e);
    }
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } catch (e) {
      console.warn('Failed to clear authentication credentials from localStorage', e);
    }
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextProps = {
    user,
    token,
    isAuthenticated: !!token && !isTokenExpired(token),
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/*------------- Custom useAuth Hook -------------*/

export function useAuth(): AuthContextProps {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
