import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Import from the file above

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('/api/auth/me', config);
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) fetchUser();
    else setLoading(false);
  }, [token, fetchUser]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const value = useMemo(() => ({
    user, token, loading, login, register, logout, updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student'
  }), [user, token, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}