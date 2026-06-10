const Booking = require('../models/Booking');
const Room    = require('../models/Room');
const Guest   = require('../models/Guest');
const { calcRoomPrice, calcTaxes } = require('../services/pricingService');
const { DEFAULT_TAX_RATES } = require('../constants/sriLanka');

// ─── GET /api/bookings ─────────────────────────────────────────────────────
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, guestId, roomId, from, to, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status)  filter.status  = status;
    if (guestId) filter.guestId = guestId;
    if (roomId)  filter.roomId  = roomId;
    if (from || to) {
      filter.checkIn = {};
      if (from) filter.checkIn.$gte = new Date(from);
      if (to)   filter.checkIn.$lte = new Date(to);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('guestId', 'firstName lastName phone nicNumber nicType')
      .populate('roomId',  'number name type basePrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: bookings,
    });
  } catch (err) { next(err); }
};

// ─── GET /api/bookings/today ───────────────────────────────────────────────
exports.getTodayBookings = async (req, res, next) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    const [checkIns, checkOuts] = await Promise.all([
      Booking.find({ checkIn: { $gte: start, $lte: end }, status: { $in: ['confirmed', 'pending'] } })
        .populate('guestId', 'firstName lastName phone')
        .populate('roomId',  'number name type'),
      Booking.find({ checkOut: { $gte: start, $lte: end }, status: 'checked-in' })
        .populate('guestId', 'firstName lastName phone')
        .populate('roomId',  'number name type'),
    ]);

    res.json({ success: true, data: { checkIns, checkOuts } });
  } catch (err) { next(err); }
};

// ─── GET /api/bookings/:id ─────────────────────────────────────────────────
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guestId')
      .populate('roomId');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// ─── POST /api/bookings ────────────────────────────────────────────────────
exports.createBooking = async (req, res, next) => {
  try {
    const { guestId, roomId, checkIn, checkOut, adults, children, currency, exchangeRate, specialNotes, source } = req.body;

    // 1. Validate Room exists and is active
    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      return res.status(404).json({ success: false, message: 'Room not found or inactive.' });
    }

    // 2. Validate Guest exists
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found.' });
    }

    // 3. ── CONFLICT DETECTION ──────────────────────────────────────────
    const conflict = await Booking.hasConflict(roomId, checkIn, checkOut);
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Room #${room.number} is already booked for the selected dates. Please choose different dates or a different room.`,
        code: 'BOOKING_CONFLICT',
      });
    }

    // 4. ── SEASONAL PRICING CALCULATION ───────────────────────────────
    const pricing = calcRoomPrice(room.basePrice, checkIn, checkOut);
    const taxes   = calcTaxes(pricing.subtotal, DEFAULT_TAX_RATES);

    // 5. Create booking
    const booking = await Booking.create({
      guestId,
      roomId,
      checkIn:   new Date(checkIn),
      checkOut:  new Date(checkOut),
      nights:    pricing.nights,
      adults:    adults || 1,
      children:  children || 0,
      basePricePerNight: room.basePrice,
      seasonMultiplier:  pricing.multiplier,
      seasonName:        pricing.season,
      pricePerNight:     pricing.pricePerNight,
      roomSubtotal:      pricing.subtotal,
      finalPrice:        taxes.total,
      currency:          currency || 'LKR',
      exchangeRate:      exchangeRate || 320,
      specialNotes,
      source:            source || 'phone',
      status:            'pending',
      createdBy:         req.user?.id,
    });

    // 6. Update room status
    await Room.findByIdAndUpdate(roomId, { status: 'reserved' });

    // 7. Update guest booking count
    await Guest.findByIdAndUpdate(guestId, { $inc: { totalBookings: 1 } });

    const populated = await booking.populate([
      { path: 'guestId', select: 'firstName lastName phone' },
      { path: 'roomId',  select: 'number name type' },
    ]);

    res.status(201).json({
      success: true,
      data: populated,
      pricing: { ...pricing, taxes },
      message: `Booking created for ${guest.firstName} ${guest.lastName} in Room #${room.number}.`,
    });
  } catch (err) { next(err); }
};

// ─── PATCH /api/bookings/:id/confirm ──────────────────────────────────────
exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { status: 'confirmed', confirmedAt: new Date() },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Pending booking not found.' });
    res.json({ success: true, data: booking, message: 'Booking confirmed.' });
  } catch (err) { next(err); }
};

// ─── PATCH /api/bookings/:id/checkin ──────────────────────────────────────
exports.checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ['pending', 'confirmed'] } },
      { status: 'checked-in', checkedInAt: new Date() },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found or cannot check-in.' });
    await Room.findByIdAndUpdate(booking.roomId, { status: 'occupied' });
    res.json({ success: true, data: booking, message: 'Guest checked in successfully.' });
  } catch (err) { next(err); }
};

// ─── PATCH /api/bookings/:id/checkout ─────────────────────────────────────
exports.checkOut = async (req, res, next) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, status: 'checked-in' },
      { status: 'checked-out', checkedOutAt: new Date() },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found or guest is not checked in.' });
    await Room.findByIdAndUpdate(booking.roomId, { status: 'available' });
    res.json({ success: true, data: booking, message: 'Guest checked out successfully.' });
  } catch (err) { next(err); }
};

// ─── PATCH /api/bookings/:id/cancel ───────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ['pending', 'confirmed'] } },
      { status: 'cancelled', cancelledAt: new Date(), cancellationReason: reason || 'No reason provided' },
      { new: true }
    );
    if (!booking) {
      return res.status(409).json({
        success: false,
        message: 'Cannot cancel — booking is not in pending or confirmed state.',
      });
    }
    await Room.findByIdAndUpdate(booking.roomId, { status: 'available' });
    res.json({ success: true, data: booking, message: 'Booking cancelled.' });
  } catch (err) { next(err); }
};

// ─── PUT /api/bookings/:id ─────────────────────────────────────────────────
exports.updateBooking = async (req, res, next) => {
  try {
    const { checkIn, checkOut, adults, children, specialNotes, source } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (['checked-out', 'cancelled'].includes(booking.status)) {
      return res.status(409).json({ success: false, message: 'Cannot modify a completed or cancelled booking.' });
    }

    // Re-check conflict if dates changed
    if (checkIn || checkOut) {
      const newCheckIn  = checkIn  ? new Date(checkIn)  : booking.checkIn;
      const newCheckOut = checkOut ? new Date(checkOut) : booking.checkOut;
      const conflict = await Booking.hasConflict(booking.roomId, newCheckIn, newCheckOut, booking._id);
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'Updated dates conflict with an existing booking.',
          code: 'BOOKING_CONFLICT',
        });
      }

      // Recalculate pricing
      const room    = await Room.findById(booking.roomId);
      const pricing = calcRoomPrice(room.basePrice, newCheckIn, newCheckOut);
      const taxes   = calcTaxes(pricing.subtotal, DEFAULT_TAX_RATES);

      Object.assign(booking, {
        checkIn: newCheckIn, checkOut: newCheckOut,
        nights: pricing.nights,
        seasonMultiplier: pricing.multiplier,
        seasonName: pricing.season,
        pricePerNight: pricing.pricePerNight,
        roomSubtotal: pricing.subtotal,
        finalPrice: taxes.total,
      });
    }

    if (adults !== undefined) booking.adults = adults;
    if (children !== undefined) booking.children = children;
    if (specialNotes !== undefined) booking.specialNotes = specialNotes;
    if (source !== undefined) booking.source = source;

    await booking.save();
    res.json({ success: true, data: booking, message: 'Booking updated.' });
  } catch (err) { next(err); }
};
