import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, AuthResponse } from '../api/auth';

interface User {
  _id: string;
  email: string;
  role: 'STUDENT' | 'VENDOR' | 'ADMIN';
  name?: string;
  whatsappNumber?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'STUDENT' | 'VENDOR' | 'ADMIN', name?: string, whatsappNumber?: string, adminPin?: string) => Promise<void>;
  googleSignUp: (firebaseUID: string, name: string, email: string, role: 'STUDENT' | 'VENDOR' | 'ADMIN', whatsappNumber?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // Verify token with backend and get current user
          const currentUser = await authAPI.getMe();
          setToken(storedToken);
          setUser(currentUser);
          // Update localStorage with verified user data
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
          // Token is invalid or expired, clear everything
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await authAPI.login({ email, password });
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const register = async (
    email: string,
    password: string,
    role: 'STUDENT' | 'VENDOR' | 'ADMIN',
    name?: string,
    whatsappNumber?: string,
    adminPin?: string
  ) => {
    const response = await authAPI.register({ email, password, role, name, whatsappNumber, adminPin });
    // Note: register doesn't return a token - email verification is required first
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const googleSignUp = async (
    firebaseUID: string,
    name: string,
    email: string,
    role: 'STUDENT' | 'VENDOR' | 'ADMIN',
    whatsappNumber?: string
  ) => {
    const response: AuthResponse = await authAPI.googleRegister({ 
      firebaseUID, 
      name, 
      email, 
      role, 
      whatsappNumber 
    });
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, googleSignUp, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


