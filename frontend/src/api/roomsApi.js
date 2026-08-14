import { roomsStore } from '../mock/demoStore';

export const getRooms = async (params = {}) => {
  const result = roomsStore.getAll(params);
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

export const getRoomById = async (id) => {
  const room = roomsStore.getById(id);
  return { data: { success: true, data: room } };
};

export const createRoom = async (data) => {
  const room = roomsStore.create(data);
  return { data: { success: true, data: room } };
};

export const updateRoom = async (id, data) => {
  const room = roomsStore.update(id, data);
  return { data: { success: true, data: room } };
};

export const deleteRoom = async (id) => {
  roomsStore.delete(id);
  return { data: { success: true, message: 'Room deleted' } };
};

export const checkRoomAvail = async () => {
  return { data: { success: true, available: true } };
};
