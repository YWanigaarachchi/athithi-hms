const mongoose = require('mongoose');
const { BOOKING_STATUSES } = require('../constants/sriLanka');

const BookingSchema = new mongoose.Schema(
  {
    // ─── References ────────────────────────────────────────────────────
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
    roomId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Room',  required: true },

    // ─── Dates ─────────────────────────────────────────────────────────
    checkIn:  { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights:   { type: Number, required: true, min: 1 },

    // ─── Guests ────────────────────────────────────────────────────────
    adults:   { type: Number, required: true, min: 1, default: 1 },
    children: { type: Number, default: 0, min: 0 },

    // ─── Status ────────────────────────────────────────────────────────
    status: { type: String, enum: BOOKING_STATUSES, default: 'pending' },

    // ─── Pricing (computed on creation) ───────────────────────────────
    basePricePerNight:   { type: Number, required: true },
    seasonMultiplier:    { type: Number, default: 1.0 },
    seasonName:          { type: String, default: 'Off-Peak' },
    pricePerNight:       { type: Number, required: true },   // base × multiplier
    roomSubtotal:        { type: Number, required: true },   // pricePerNight × nights
    finalPrice:          { type: Number, required: true },   // after taxes

    // ─── Currency ──────────────────────────────────────────────────────
    currency:     { type: String, enum: ['LKR', 'USD'], default: 'LKR' },
    exchangeRate: { type: Number, default: 320 },            // LKR per USD at booking time

    // ─── Meta ──────────────────────────────────────────────────────────
    source:      { type: String, enum: ['walk-in', 'phone', 'online', 'agent'], default: 'phone' },
    specialNotes:{ type: String, trim: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ─── Timestamps for status changes ─────────────────────────────────
    confirmedAt: Date,
    checkedInAt: Date,
    checkedOutAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
  },
  { timestamps: true }
);

// ─── Indexes for conflict detection queries ────────────────────────────────
BookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1 });
BookingSchema.index({ guestId: 1, status: 1 });
BookingSchema.index({ status: 1, checkIn: 1 });

// ─── Pre-validate: ensure checkout > checkin ───────────────────────────────
BookingSchema.pre('validate', function (next) {
  if (this.checkOut <= this.checkIn) {
    return next(new Error('Check-out date must be after check-in date.'));
  }
  next();
});

/**
 * Static: Check for overlapping bookings on the same room.
 * Excludes cancelled/checked-out statuses.
 * @param {ObjectId} roomId
 * @param {Date}     checkIn
 * @param {Date}     checkOut
 * @param {ObjectId} excludeId - current booking ID to exclude (for updates)
 * @returns {Boolean} true if conflict exists
 */
BookingSchema.statics.hasConflict = async function (roomId, checkIn, checkOut, excludeId = null) {
  const query = {
    roomId,
    status: { $in: ['pending', 'confirmed', 'checked-in'] },
    $or: [
      // New booking starts during an existing one
      { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } },
    ],
  };
  if (excludeId) query._id = { $ne: excludeId };

  const conflict = await this.findOne(query).lean();
  return !!conflict;
};

module.exports = mongoose.model('Booking', BookingSchema);
