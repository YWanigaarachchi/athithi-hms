const Guest = require('../models/Guest');
const { validateNIC } = require('../services/nicValidationService');

// ─── GET /api/guests ───────────────────────────────────────────────────────
exports.getAllGuests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, country, nicType } = req.query;
    const filter = {};
    if (country) filter.country = new RegExp(country, 'i');
    if (nicType) filter.nicType = nicType;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Guest.countDocuments(filter);
    const guests = await Guest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: guests.length, total, data: guests });
  } catch (err) { next(err); }
};

// ─── GET /api/guests/search ────────────────────────────────────────────────
exports.searchGuests = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query parameter q is required.' });

    const guests = await Guest.find({
      $or: [
        { firstName:  new RegExp(q, 'i') },
        { lastName:   new RegExp(q, 'i') },
        { nicNumber:  new RegExp(q, 'i') },
        { email:      new RegExp(q, 'i') },
        { phone:      new RegExp(q, 'i') },
      ],
    }).limit(10);

    res.json({ success: true, count: guests.length, data: guests });
  } catch (err) { next(err); }
};

// ─── GET /api/guests/:id ───────────────────────────────────────────────────
exports.getGuestById = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found.' });
    res.json({ success: true, data: guest });
  } catch (err) { next(err); }
};

// ─── POST /api/guests ──────────────────────────────────────────────────────
exports.createGuest = async (req, res, next) => {
  try {
    const { nicNumber, nicType } = req.body;

    // ── NIC Validation ─────────────────────────────────────────────────────
    const nicCheck = validateNIC(nicNumber, nicType);
    if (!nicCheck.valid) {
      return res.status(400).json({
        success: false,
        message: `NIC validation failed: ${nicCheck.message}`,
        field: 'nicNumber',
      });
    }

    const guest = await Guest.create({ ...req.body, createdBy: req.user?.id });

    res.status(201).json({
      success: true,
      data: guest,
      nicValidation: nicCheck,
      message: `Guest ${guest.firstName} ${guest.lastName} created successfully.`,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A guest with this NIC number already exists.',
        code: 'DUPLICATE_NIC',
      });
    }
    next(err);
  }
};

// ─── PUT /api/guests/:id ───────────────────────────────────────────────────
exports.updateGuest = async (req, res, next) => {
  try {
    // Re-validate NIC if it's being updated
    if (req.body.nicNumber && req.body.nicType) {
      const nicCheck = validateNIC(req.body.nicNumber, req.body.nicType);
      if (!nicCheck.valid) {
        return res.status(400).json({
          success: false,
          message: `NIC validation failed: ${nicCheck.message}`,
        });
      }
    }

    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found.' });
    res.json({ success: true, data: guest, message: 'Guest updated successfully.' });
  } catch (err) { next(err); }
};

// ─── DELETE /api/guests/:id ────────────────────────────────────────────────
exports.deleteGuest = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const activeBooking = await Booking.findOne({
      guestId: req.params.id,
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    });
    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete guest with active bookings.',
      });
    }
    await Guest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Guest deleted.' });
  } catch (err) { next(err); }
};

// ─── POST /api/guests/validate-nic ────────────────────────────────────────
exports.validateNICEndpoint = async (req, res) => {
  const { nicNumber, nicType } = req.body;
  const result = validateNIC(nicNumber, nicType);
  res.json({ success: true, ...result });
};
