import { billsStore } from '../mock/demoStore';

export const getBills = async (params = {}) => {
  const result = billsStore.getAll(params);
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

export const getBillForBooking = async (bId) => {
  const bill = billsStore.getById(bId);
  return { data: { success: true, data: bill } };
};

export const generateBill = async (bId) => {
  return { data: { success: true, data: {} } };
};

export const addLineItem = async (id, data) => {
  const updated = billsStore.addItem(id, data);
  return { data: { success: true, data: updated } };
};

export const removeLineItem = async (id, index) => {
  return { data: { success: true } };
};

export const markPaid = async (id, data) => {
  const updated = billsStore.markPaid(id, data);
  return { data: { success: true, data: updated } };
};

export const getInvoice = async (id) => {
  const bill = billsStore.getById(id);
  return { data: { success: true, data: bill } };
};
