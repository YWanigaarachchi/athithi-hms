import api from './axios';

export const getRooms         = (params) => api.get('/rooms', { params });
export const getRoomById      = (id)     => api.get(`/rooms/${id}`);
export const createRoom       = (data)   => api.post('/rooms', data);
export const updateRoom       = (id, d)  => api.put(`/rooms/${id}`, d);
export const deleteRoom       = (id)     => api.delete(`/rooms/${id}`);
export const checkRoomAvail   = (id, p)  => api.get(`/rooms/${id}/availability`, { params: p });
