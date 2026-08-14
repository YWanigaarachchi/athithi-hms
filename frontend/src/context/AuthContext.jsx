import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { login as loginApi, getMe } from '../api/authApi';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  _id: 'athithi-admin-01',
  name: 'Athithi Staff',
  email: 'staff@hotel.lk',
  role: 'admin',
};

const initialState = {
  user:    DEFAULT_USER,
  token:   localStorage.getItem('athithi_token') || 'direct-access-token',
  loading: false,
  error:   null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.user, token: action.token, loading: false, error: null };
    case 'LOGOUT':
      return { ...state, user: DEFAULT_USER, token: 'direct-access-token', loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_USER':
      return { ...state, user: action.user || DEFAULT_USER, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Attempt to sync real user if backend token is available
  useEffect(() => {
    const token = localStorage.getItem('athithi_token');
    if (token) {
      getMe()
        .then((res) => dispatch({ type: 'SET_USER', user: res.data.data }))
        .catch(() => {
          dispatch({ type: 'SET_USER', user: DEFAULT_USER });
        });
    }
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const res = await loginApi(credentials);
      const { token, data: user } = res.data;
      localStorage.setItem('athithi_token', token);
      localStorage.setItem('athithi_user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', user, token });
      return user;
    } catch (err) {
      dispatch({ type: 'SET_USER', user: DEFAULT_USER });
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('athithi_token');
    localStorage.removeItem('athithi_user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
