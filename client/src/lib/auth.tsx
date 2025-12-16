import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employer' | 'jobseeker' | 'freelancer';
  company?: string;
  profileImage?: string | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string, role: string, company?: string) => Promise<void>;
  logout: () => void;
  setAuth: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('gw_token');
    const u = localStorage.getItem('gw_user');
    if (t && u) {
      setToken(t);
      try { setUser(JSON.parse(u)); } catch { setUser(null); }
    }
    setIsLoading(false);
  }, []);

  const setAuth = (t: string, u: User) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('gw_token', t);
    localStorage.setItem('gw_user', JSON.stringify(u));
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Login failed');
      }

      const data = await response.json();
      setAuth(data.token, data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: string,
    company?: string
  ) => {
    try {
      let endpoint = '/api/auth/signup/jobseeker';
      const name = `${firstName} ${lastName}`.trim();
      let body: any = { name, firstName, lastName, email, password, role };

      if (role === 'employer') {
        endpoint = '/api/auth/signup/employer';
        body = { name, email, password, company };
      } else if (role === 'admin') {
        endpoint = '/api/auth/signup/admin';
      }

      console.log('Signup request:', { endpoint, body });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Signup error response:', errorData);
        throw new Error(errorData.error?.message || 'Signup failed');
      }

      const data = await response.json();
      console.log('Signup success:', data);
      setAuth(data.token, data.user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gw_token');
    localStorage.removeItem('gw_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, signup, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = localStorage.getItem('gw_token');
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(input, { ...init, headers });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (typeof (data as any)?.message === 'string') {
        message = (data as any).message;
      } else if (typeof (data as any)?.error === 'string') {
        message = (data as any).error;
      } else if (typeof (data as any)?.error?.message === 'string') {
        message = (data as any).error.message;
      }
    } catch {
      // ignore JSON parse errors and fall back to default message
    }
    throw new Error(message);
  }

  return response;
}
