import api from './axios';

export const getBookings      = (params) => api.get('/bookings', { params });
export const getTodayBookings = ()        => api.get('/bookings/today');
export const getBookingById   = (id)      => api.get(`/bookings/${id}`);
export const createBooking    = (data)    => api.post('/bookings', data);
export const updateBooking    = (id, d)   => api.put(`/bookings/${id}`, d);
export const confirmBooking   = (id)      => api.patch(`/bookings/${id}/confirm`);
export const checkIn          = (id)      => api.patch(`/bookings/${id}/checkin`);
export const checkOut         = (id)      => api.patch(`/bookings/${id}/checkout`);
export const cancelBooking    = (id, d)   => api.patch(`/bookings/${id}/cancel`, d);
