// src/context/AuthContext.jsx
// Provides global auth state — user info, login, logout, and isAdmin flag.
// Works with the Axios-based api.js (JWT stored in localStorage).

import { createContext, useContext, useState, useCallback } from 'react';
import { getSession, setSession as persistSession, clearSession } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize state from localStorage (persists across page refresh)
  const [user, setUser] = useState(() => getSession());

  // Called after successful login/register — saves user + token
  const login = useCallback((userData) => {
    persistSession(userData); // Saves to localStorage
    const { token, ...userInfo } = userData;
    setUser(userInfo);
  }, []);

  // Called after profile update — merges updated user fields without losing token
  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      persistSession(merged);
      return merged;
    });
  }, []);

  // Called on logout — clears localStorage and resets state
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      updateUser,
      logout,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
