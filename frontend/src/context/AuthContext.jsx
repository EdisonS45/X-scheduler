import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user in localStorage on initial load
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.token) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse stored user", error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiLogin(email, password);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      navigate('/');
    } catch (error) {
      console.error("Login failed", error);
      throw error.response.data.message || 'Login failed';
    }
  };

  const register = async (email, password) => {
    try {
      const res = await apiRegister(email, password);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      navigate('/');
    } catch (error) {
      console.error("Registration failed", error);
      throw error.response.data.message || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  if (loading) {
    return <div>Loading...</div>; // Or a proper splash screen
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};