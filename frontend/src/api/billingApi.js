import api from './axios';

export const getBills          = (params) => api.get('/billing', { params });
export const getBillForBooking = (bId)    => api.get(`/billing/booking/${bId}`);
export const generateBill      = (bId)    => api.post(`/billing/generate/${bId}`);
export const addLineItem       = (id, d)  => api.post(`/billing/${id}/items`, d);
export const removeLineItem    = (id, i)  => api.delete(`/billing/${id}/items/${i}`);
export const markPaid          = (id, d)  => api.patch(`/billing/${id}/pay`, d);
export const getInvoice        = (id)     => api.get(`/billing/${id}/invoice`);
