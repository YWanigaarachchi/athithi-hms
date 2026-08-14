import { guestsStore } from '../mock/demoStore';

export const getGuests = async (params = {}) => {
  const result = guestsStore.getAll(params);
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

export const searchGuests = async (q) => {
  const result = guestsStore.getAll({ search: q });
  return { data: { success: true, data: result.data } };
};

export const getGuestById = async (id) => {
  const guest = guestsStore.getById(id);
  return { data: { success: true, data: guest } };
};

export const createGuest = async (data) => {
  const guest = guestsStore.create(data);
  return { data: { success: true, data: guest } };
};

export const updateGuest = async (id, data) => {
  const guest = guestsStore.update(id, data);
  return { data: { success: true, data: guest } };
};

export const deleteGuest = async (id) => {
  guestsStore.delete(id);
  return { data: { success: true, message: 'Guest deleted' } };
};

export const validateNIC = async (data) => {
  const { nicNumber, nicType } = data;
  const oldRegex = /^[0-9]{9}[VXvx]$/;
  const newRegex = /^[0-9]{12}$/;
  if (nicType === 'nic-old' && oldRegex.test(nicNumber)) {
    return { data: { data: { valid: true, format: 'Old SL NIC', estimatedBirthYear: 1900 + parseInt(nicNumber.slice(0, 2), 10) } } };
  } else if (nicType === 'nic-new' && newRegex.test(nicNumber)) {
    return { data: { data: { valid: true, format: 'New SL NIC', estimatedBirthYear: parseInt(nicNumber.slice(0, 4), 10) } } };
  } else if (nicType === 'passport' && nicNumber.length >= 6) {
    return { data: { data: { valid: true, format: 'Passport' } } };
  }
  return { data: { data: { valid: false } } };
};
