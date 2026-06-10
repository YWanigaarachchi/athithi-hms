import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor — attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('athithi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — global error shaping
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// ─── Room APIs ───────────────────────────────────────────────────────
export const roomAPI = {
  getAll:          (params) => api.get('/rooms', { params }),
  getById:         (id)     => api.get(`/rooms/${id}`),
  checkAvailability: (id, checkIn, checkOut) =>
    api.get(`/rooms/${id}/availability`, { params: { checkIn, checkOut } }),
  create:  (data)  => api.post('/rooms', data),
  update:  (id, data) => api.put(`/rooms/${id}`, data),
  delete:  (id)    => api.delete(`/rooms/${id}`),
};

// ─── Booking APIs ─────────────────────────────────────────────────────
export const bookingAPI = {
  getAll:    (params) => api.get('/bookings', { params }),
  getById:   (id)     => api.get(`/bookings/${id}`),
  create:    (data)   => api.post('/bookings', data),
  update:    (id, data) => api.put(`/bookings/${id}`, data),
  cancel:    (id)     => api.patch(`/bookings/${id}/cancel`),
  checkIn:   (id)     => api.patch(`/bookings/${id}/checkin`),
  checkOut:  (id)     => api.patch(`/bookings/${id}/checkout`),
  getToday:  ()       => api.get('/bookings/today'),
};

// ─── Guest APIs ───────────────────────────────────────────────────────
export const guestAPI = {
  getAll:    (params) => api.get('/guests', { params }),
  getById:   (id)     => api.get(`/guests/${id}`),
  create:    (data)   => api.post('/guests', data),
  update:    (id, data) => api.put(`/guests/${id}`, data),
  delete:    (id)     => api.delete(`/guests/${id}`),
  search:    (q)      => api.get('/guests/search', { params: { q } }),
};

// ─── Billing APIs ─────────────────────────────────────────────────────
export const billingAPI = {
  getForBooking: (bookingId) => api.get(`/billing/booking/${bookingId}`),
  generate:      (bookingId) => api.post(`/billing/generate/${bookingId}`),
  addLineItem:   (billId, item) => api.post(`/billing/${billId}/items`, item),
  markPaid:      (billId)   => api.patch(`/billing/${billId}/pay`),
  getInvoice:    (billId)   => api.get(`/billing/${billId}/invoice`),
};

// ─── Settings APIs ────────────────────────────────────────────────────
export const settingsAPI = {
  getTaxRates:     () => api.get('/settings/taxes'),
  updateTaxRates:  (data) => api.put('/settings/taxes', data),
  getExchangeRate: () => api.get('/settings/exchange-rate'),
  setExchangeRate: (rate) => api.put('/settings/exchange-rate', { rate }),
};

// ─── Dashboard APIs ───────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
