import { bookingsStore } from '../mock/demoStore';

export const getBookings = async (params = {}) => {
  const result = bookingsStore.getAll(params);
  return {
    data: {
      success: true,
      data: result.data,
      count: result.data.length,
      total: result.total,
      pagination: { total: result.total, page: 1, pages: 1 },
    },
  };
};

export const getTodayBookings = async () => {
  const data = bookingsStore.getToday();
  return {
    data: {
      success: true,
      data,
    },
  };
};

export const getBookingById = async (id) => {
  const booking = bookingsStore.getById(id);
  return { data: { success: true, data: booking } };
};

export const createBooking = async (data) => {
  const booking = bookingsStore.create(data);
  return { data: { success: true, data: booking } };
};

export const updateBooking = async (id, data) => {
  return { data: { success: true, data } };
};

export const confirmBooking = async (id) => {
  const updated = bookingsStore.updateStatus(id, 'confirmed');
  return { data: { success: true, data: updated } };
};

export const checkIn = async (id) => {
  const updated = bookingsStore.updateStatus(id, 'checked-in');
  return { data: { success: true, data: updated } };
};

export const checkOut = async (id) => {
  const updated = bookingsStore.updateStatus(id, 'checked-out');
  return { data: { success: true, data: updated } };
};

export const cancelBooking = async (id) => {
  const updated = bookingsStore.updateStatus(id, 'cancelled');
  return { data: { success: true, data: updated } };
};
