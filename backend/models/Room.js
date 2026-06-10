const mongoose = require('mongoose');
const { ROOM_TYPES } = require('../constants/sriLanka');

const RoomSchema = new mongoose.Schema(
  {
    number:    { type: String, required: true, unique: true, trim: true },
    name:      { type: String, required: true, trim: true },
    type:      { type: String, required: true, enum: ROOM_TYPES },
    basePrice: { type: Number, required: true, min: 0 },   // LKR per night
    capacity:  { type: Number, required: true, min: 1, max: 20 },
    floor:     { type: Number, required: true, min: 1 },
    view:      { type: String, trim: true, default: 'Standard' },
    amenities: [{ type: String, trim: true }],
    status:    {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'reserved'],
      default: 'available',
    },
    isActive: { type: Boolean, default: true },
    images:   [{ type: String }], // URLs
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes
RoomSchema.index({ status: 1, type: 1 });
RoomSchema.index({ basePrice: 1 });

module.exports = mongoose.model('Room', RoomSchema);
