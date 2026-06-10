const mongoose = require('mongoose');
const { NIC_TYPES, SPICE_LEVELS, BREAKFAST_PREFS } = require('../constants/sriLanka');

const NIC_TYPE_VALS = ['nic-old', 'nic-new', 'passport'];

const GuestSchema = new mongoose.Schema(
  {
    // ─── Personal Info ─────────────────────────────────────────────────
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    email:       { type: String, trim: true, lowercase: true, sparse: true },
    phone:       { type: String, required: true, trim: true },
    nationality: { type: String, trim: true, default: 'Sri Lankan' },
    country:     { type: String, trim: true, default: 'Sri Lanka' },
    address:     { type: String, trim: true },

    // ─── Identity Verification ─────────────────────────────────────────
    nicType:   { type: String, required: true, enum: NIC_TYPE_VALS },
    nicNumber: { type: String, required: true, trim: true, uppercase: true },

    // ─── Driver / Tour Guide Info ──────────────────────────────────────
    // A uniquely Sri Lankan tourism feature — track the tour driver
    driver: {
      name:              { type: String, trim: true },
      contactNumber:     { type: String, trim: true },
      vehiclePlateNumber:{ type: String, trim: true, uppercase: true },
      requiresAccommodation: { type: Boolean, default: false },
      requiresMealPlan:  { type: Boolean, default: false },
    },

    // ─── Preferences ───────────────────────────────────────────────────
    spiceTolerance:      { type: String, enum: SPICE_LEVELS, default: 'medium' },
    breakfastPreference: { type: String, enum: BREAKFAST_PREFS, default: 'continental' },
    dietaryRestrictions: [{ type: String, trim: true }],
    specialNotes:        { type: String, trim: true },

    // ─── Internal ──────────────────────────────────────────────────────
    totalBookings: { type: Number, default: 0 },
    isBlacklisted: { type: Boolean, default: false },
    vipLevel:      { type: String, enum: ['none', 'silver', 'gold', 'platinum'], default: 'none' },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────
GuestSchema.index({ nicNumber: 1, nicType: 1 }, { unique: true });
GuestSchema.index({ lastName: 1, firstName: 1 });
GuestSchema.index({ phone: 1 });

// ─── Virtual: Full Name ────────────────────────────────────────────────────
GuestSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ─── Instance method: Has Driver ──────────────────────────────────────────
GuestSchema.methods.hasDriver = function () {
  return !!(this.driver?.name);
};

module.exports = mongoose.model('Guest', GuestSchema);
