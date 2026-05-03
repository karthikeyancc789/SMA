import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

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
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const { data } = await axios.get('/api/auth/me', config);
      setUser(data);
    } catch (err) {
      // ✅ FIX: Use 'err' to satisfy ESLint and help with debugging
      console.error('Error fetching user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      return { success: true, data };
    } catch (error) {
      // ✅ Alternative FIX: You can also use 'error' here if this triggers a warning
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = useCallback(async (userData) => {
    try {
      // Convert year to number and ensure all required fields
      const dataToSend = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        department: userData.department,
        year: parseInt(userData.year),
        role: userData.role || 'student',
        rollNumber: userData.rollNumber || ''
      };
      
      console.log('Sending registration data:', dataToSend);
      
      const { data } = await axios.post('/api/auth/register', dataToSend);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed' 
      };
    }
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  }), [user, token, loading, logout, register]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}