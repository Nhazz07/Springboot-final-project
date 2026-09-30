import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  // Synchronize authentication changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      // Spring Boot AuthResponse contains accessToken, tokenType, username, email, role, imageUrl
      const authToken = data.accessToken || data.token;
      const roleStr = typeof data.role === 'string' ? data.role : data.role?.name || 'USER';
      const cleanRole = roleStr.replace('ROLE_', '');
      const userData = {
        userId: data.userId,
        username: data.username,
        email: data.email,
        role: cleanRole,
        roles: [`ROLE_${cleanRole}`],
        imageUrl: data.imageUrl || null,
      };

      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Authentication failed. Please check your credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      await authService.register({ username, email, password });
      return {
        success: true,
        message: 'Account created successfully! Please sign in with your credentials.',
      };
    } catch (error) {
      console.error('Register error:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed. Username or email may already be in use.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = Boolean(
    user && (
      user.role === 'ADMIN' ||
      user.role === 'ROLE_ADMIN' ||
      user.roles?.some((role) =>
        typeof role === 'string' ? role.includes('ADMIN') : role?.name?.includes('ADMIN')
      )
    )
  );

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token,
    isAdmin,
    login,
    register,
    updateUserData,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
