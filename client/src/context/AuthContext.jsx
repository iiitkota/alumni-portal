import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const payload = decodeToken(savedToken);
      if (payload && payload.exp && payload.exp > Date.now() / 1000) {
        return savedToken;
      }
      localStorage.removeItem('token');
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const payload = decodeToken(savedToken);
      if (payload && payload.exp && payload.exp > Date.now() / 1000) {
        const mappedRole = payload.role === 'student' ? 'student' : 'alumni';
        return { id: payload.id, role: mappedRole };
      }
    }
    return null;
  });

  useEffect(() => {
    // Periodic check to clear expired tokens during active sessions
    const interval = setInterval(() => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        const payload = decodeToken(savedToken);
        if (!payload || !payload.exp || payload.exp <= Date.now() / 1000) {
          logout();
        }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const payload = decodeToken(newToken);
    if (payload) {
      const mappedRole = payload.role === 'student' ? 'student' : 'alumni';
      setUser({ id: payload.id, role: mappedRole });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
