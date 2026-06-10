import api from './axios';

export const getGuests        = (params) => api.get('/guests', { params });
export const searchGuests     = (q)      => api.get('/guests/search', { params: { q } });
export const getGuestById     = (id)     => api.get(`/guests/${id}`);
export const createGuest      = (data)   => api.post('/guests', data);
export const updateGuest      = (id, d)  => api.put(`/guests/${id}`, d);
export const deleteGuest      = (id)     => api.delete(`/guests/${id}`);
export const validateNIC      = (data)   => api.post('/guests/validate-nic', data);
