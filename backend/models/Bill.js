const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  type:        { type: String, enum: ['room', 'fb', 'extra'], required: true },
  amount:      { type: Number, required: true, min: 0 },
  quantity:    { type: Number, default: 1 },
  unitPrice:   { type: Number },
}, { _id: false });

const BillSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    guestId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Guest',   required: true },

    // ─── Line Items ──────────────────────────────────────────────────────
    lineItems: [LineItemSchema],

    // ─── Financial Summary (computed) ───────────────────────────────────
    subtotal:      { type: Number, required: true, default: 0 },
    serviceCharge: { type: Number, default: 0 },   // 10% SC
    vat:           { type: Number, default: 0 },   // 18% VAT on (sub + SC)
    sscl:          { type: Number, default: 0 },   // 2.5% SSCL
    totalLKR:      { type: Number, required: true, default: 0 },
    totalUSD:      { type: Number, default: 0 },

    // ─── Currency ──────────────────────────────────────────────────────
    currency:     { type: String, enum: ['LKR', 'USD'], default: 'LKR' },
    exchangeRate: { type: Number, default: 320 },

    // ─── Tax Rates Applied ─────────────────────────────────────────────
    taxRates: {
      VAT:            { type: Number, default: 0.18 },
      SSCL:           { type: Number, default: 0.025 },
      SERVICE_CHARGE: { type: Number, default: 0.10 },
    },

    // ─── Payment ───────────────────────────────────────────────────────
    paymentStatus: { type: String, enum: ['pending', 'paid', 'partially-paid', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'bank-transfer', 'online', 'mixed'] },
    paidAt:        { type: Date },
    paidAmount:    { type: Number, default: 0 },

    issuedAt:  { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ─── Recompute totals before saving ────────────────────────────────────────
BillSchema.pre('save', function (next) {
  const { VAT, SSCL, SERVICE_CHARGE } = this.taxRates;
  this.subtotal      = this.lineItems.reduce((s, i) => s + i.amount, 0);
  this.serviceCharge = parseFloat((this.subtotal * SERVICE_CHARGE).toFixed(2));
  this.vat           = parseFloat(((this.subtotal + this.serviceCharge) * VAT).toFixed(2));
  this.sscl          = parseFloat((this.subtotal * SSCL).toFixed(2));
  this.totalLKR      = parseFloat((this.subtotal + this.serviceCharge + this.vat + this.sscl).toFixed(2));
  this.totalUSD      = parseFloat((this.totalLKR / (this.exchangeRate || 320)).toFixed(2));
  next();
});

BillSchema.index({ guestId: 1 });
BillSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Bill', BillSchema);
