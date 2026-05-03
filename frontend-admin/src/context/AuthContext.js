import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sb_admin_token');
    if (token) {
      API.get('/auth/me').then(r => {
        if (r.data.is_admin) setUser(r.data);
        else localStorage.removeItem('sb_admin_token');
      }).catch(() => localStorage.removeItem('sb_admin_token')).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const r = await API.post('/auth/login', { email, password });
    if (!r.data.user.is_admin) throw new Error('Not an admin account');
    localStorage.setItem('sb_admin_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = () => {
    localStorage.removeItem('sb_admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
