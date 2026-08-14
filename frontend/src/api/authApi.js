import { dashboardStore } from '../mock/demoStore';

export const login = async (credentials) => {
  return {
    data: {
      token: 'demo-token-12345',
      data: {
        _id: 'athithi-admin-01',
        name: 'Athithi Staff',
        email: credentials.email || 'staff@hotel.lk',
        role: 'admin',
      },
    },
  };
};

export const register = async (data) => {
  return { data: { success: true, data } };
};

export const getMe = async () => {
  return {
    data: {
      data: {
        _id: 'athithi-admin-01',
        name: 'Athithi Staff',
        email: 'staff@hotel.lk',
        role: 'admin',
      },
    },
  };
};

export const getDashboardStats = async () => {
  const stats = dashboardStore.getStats();
  return {
    data: {
      success: true,
      data: stats,
    },
  };
};
