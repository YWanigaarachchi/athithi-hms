const Room    = require('../models/Room');
const Booking = require('../models/Booking');
const { ROOM_TYPES } = require('../constants/sriLanka');

// ─── GET /api/rooms ────────────────────────────────────────────────────────
exports.getAllRooms = async (req, res, next) => {
  try {
    const { type, status, minPrice, maxPrice } = req.query;
    const filter = { isActive: true };
    if (type)    filter.type   = type;
    if (status)  filter.status = status;
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    const rooms = await Room.find(filter).sort({ number: 1 });
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (err) { next(err); }
};

// ─── GET /api/rooms/:id ────────────────────────────────────────────────────
exports.getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    res.json({ success: true, data: room });
  } catch (err) { next(err); }
};

// ─── GET /api/rooms/:id/availability ──────────────────────────────────────
exports.checkAvailability = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'checkIn and checkOut dates are required.' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const conflict = await Booking.hasConflict(room._id, checkIn, checkOut);
    res.json({
      success: true,
      available: !conflict,
      message: conflict ? 'Room is not available for the selected dates.' : 'Room is available.',
    });
  } catch (err) { next(err); }
};

// ─── POST /api/rooms ───────────────────────────────────────────────────────
exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create({ ...req.body, createdBy: req.user?.id });
    res.status(201).json({ success: true, data: room, message: 'Room created successfully.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: `Room number ${req.body.number} already exists.` });
    }
    next(err);
  }
};

// ─── PUT /api/rooms/:id ────────────────────────────────────────────────────
exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    res.json({ success: true, data: room, message: 'Room updated successfully.' });
  } catch (err) { next(err); }
};

// ─── DELETE /api/rooms/:id ─────────────────────────────────────────────────
exports.deleteRoom = async (req, res, next) => {
  try {
    // Soft delete — check for active bookings first
    const activeBooking = await Booking.findOne({
      roomId: req.params.id,
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    });
    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete room with active bookings. Cancel bookings first.',
      });
    }
    await Room.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Room deactivated successfully.' });
  } catch (err) { next(err); }
};
