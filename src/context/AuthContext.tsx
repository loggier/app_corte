"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  // You can add login and logout functions here later
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Check local storage for authentication status on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuthStatus = localStorage.getItem('isAuthenticated');
      if (storedAuthStatus === 'true') {
        setIsAuthenticated(true);
      }
    }
    setIsInitialLoad(false); // Mark initial load as complete
  }, []);

  // Placeholder login and logout functions
  const login = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAuthenticated', 'true');
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
    }
    setIsAuthenticated(false);
  };

  // Avoid rendering children until initial auth check is done
  if (isInitialLoad) {
      return null; // Or a loading spinner
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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