import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  sessionExpiry: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        sessionExpiry: action.payload.sessionExpiry
      };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'LOADING_DONE':
      return { ...state, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set API defaults
  useEffect(() => {
    if (state.token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete API.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Intercept 401 (token expired / session invalid)
  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          const code = err.response?.data?.code;
          if (code === 'TOKEN_EXPIRED') {
            toast.error('Your session has expired. Please login again.');
          } else if (code === 'SESSION_INVALID') {
            toast.error('Session is no longer valid. Please login again.');
          }
          if (state.isAuthenticated) logout(true);
        }
        return Promise.reject(err);
      }
    );
    return () => API.interceptors.response.eject(interceptor);
  }, [state.isAuthenticated]);

  // Restore session from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('fh_token');
      const userData = localStorage.getItem('fh_user');
      const expiry = localStorage.getItem('fh_expiry');

      if (token && userData && expiry) {
        if (Date.now() > parseInt(expiry)) {
          clearSession();
          dispatch({ type: 'LOADING_DONE' });
          return;
        }
        try {
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await API.get('/auth/me');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: res.data.user, token, sessionExpiry: parseInt(expiry) }
          });
        } catch {
          clearSession();
          dispatch({ type: 'LOADING_DONE' });
        }
      } else {
        dispatch({ type: 'LOADING_DONE' });
      }
    };
    restoreSession();
  }, []);

  // 5-hour session timeout check
  useEffect(() => {
    if (!state.sessionExpiry) return;
    const checkInterval = setInterval(() => {
      if (Date.now() > state.sessionExpiry) {
        toast.error('Session expired after 5 hours. Please login again.');
        logout(true);
      }
    }, 60000); // Check every minute
    return () => clearInterval(checkInterval);
  }, [state.sessionExpiry]);

  const clearSession = () => {
    localStorage.removeItem('fh_token');
    localStorage.removeItem('fh_user');
    localStorage.removeItem('fh_expiry');
    delete API.defaults.headers.common['Authorization'];
  };

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user, sessionExpiresIn } = res.data;
      const sessionExpiry = Date.now() + sessionExpiresIn;

      localStorage.setItem('fh_token', token);
      localStorage.setItem('fh_user', JSON.stringify(user));
      localStorage.setItem('fh_expiry', sessionExpiry.toString());

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token, sessionExpiry } });
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, mobile, password) => {
    try {
      await API.post('/auth/register', { name, email, mobile, password });
      toast.success('Account created! Please login.');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = useCallback(async (silent = false) => {
    try {
      if (!silent) await API.post('/auth/logout');
    } catch {}
    clearSession();
    dispatch({ type: 'LOGOUT' });
    if (!silent) toast.success('Logged out successfully.');
  }, []);

  const updateUser = (updates) => dispatch({ type: 'UPDATE_USER', payload: updates });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
