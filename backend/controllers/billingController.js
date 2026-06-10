const Bill    = require('../models/Bill');
const Booking = require('../models/Booking');
const Guest   = require('../models/Guest');
const { buildInvoice } = require('../services/invoiceService');
const { DEFAULT_TAX_RATES } = require('../constants/sriLanka');
const { calcRoomPrice, calcTaxes } = require('../services/pricingService');

// ─── GET /api/billing/booking/:bookingId ───────────────────────────────────
exports.getBillForBooking = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ bookingId: req.params.bookingId })
      .populate('guestId')
      .populate({ path: 'bookingId', populate: { path: 'roomId', select: 'number name type' } });

    if (!bill) return res.status(404).json({ success: false, message: 'No bill found for this booking.' });
    res.json({ success: true, data: bill });
  } catch (err) { next(err); }
};

// ─── POST /api/billing/generate/:bookingId ────────────────────────────────
/**
 * Auto-generates or regenerates a bill from a booking.
 * Creates a Room charge line item automatically from booking data.
 */
exports.generateBill = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('roomId')
      .populate('guestId');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Check if bill already exists
    let bill = await Bill.findOne({ bookingId: booking._id });

    if (bill) {
      return res.status(409).json({
        success: false,
        message: 'A bill already exists for this booking.',
        data: bill,
      });
    }

    // Auto-generate room charge line item
    const roomLineItem = {
      description: `${booking.roomId.name} — Room Charge × ${booking.nights} nights (×${booking.seasonMultiplier} ${booking.seasonName})`,
      type: 'room',
      amount: booking.roomSubtotal,
      quantity: booking.nights,
      unitPrice: booking.pricePerNight,
    };

    bill = await Bill.create({
      bookingId:    booking._id,
      guestId:      booking.guestId._id,
      lineItems:    [roomLineItem],
      currency:     booking.currency,
      exchangeRate: booking.exchangeRate,
      taxRates:     DEFAULT_TAX_RATES,
      createdBy:    req.user?.id,
    });

    res.status(201).json({ success: true, data: bill, message: 'Bill generated successfully.' });
  } catch (err) { next(err); }
};

// ─── POST /api/billing/:billId/items ──────────────────────────────────────
exports.addLineItem = async (req, res, next) => {
  try {
    const { description, type, amount, quantity, unitPrice } = req.body;
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });

    if (bill.paymentStatus === 'paid') {
      return res.status(409).json({ success: false, message: 'Cannot modify a paid bill.' });
    }

    bill.lineItems.push({ description, type, amount, quantity, unitPrice });
    await bill.save(); // pre-save hook recalculates totals

    res.json({ success: true, data: bill, message: 'Line item added.' });
  } catch (err) { next(err); }
};

// ─── DELETE /api/billing/:billId/items/:index ──────────────────────────────
exports.removeLineItem = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });
    if (bill.paymentStatus === 'paid') {
      return res.status(409).json({ success: false, message: 'Cannot modify a paid bill.' });
    }

    const idx = parseInt(req.params.index, 10);
    if (idx < 0 || idx >= bill.lineItems.length) {
      return res.status(400).json({ success: false, message: 'Invalid line item index.' });
    }
    bill.lineItems.splice(idx, 1);
    await bill.save();
    res.json({ success: true, data: bill, message: 'Line item removed.' });
  } catch (err) { next(err); }
};

// ─── PATCH /api/billing/:billId/pay ───────────────────────────────────────
exports.markPaid = async (req, res, next) => {
  try {
    const { paymentMethod = 'cash', paidAmount } = req.body;
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });

    bill.paymentStatus = 'paid';
    bill.paymentMethod = paymentMethod;
    bill.paidAt        = new Date();
    bill.paidAmount    = paidAmount || bill.totalLKR;
    await bill.save();

    res.json({ success: true, data: bill, message: 'Bill marked as paid.' });
  } catch (err) { next(err); }
};

// ─── GET /api/billing/:billId/invoice ─────────────────────────────────────
exports.getInvoice = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });

    const booking = await Booking.findById(bill.bookingId).populate('roomId');
    const guest   = await Guest.findById(bill.guestId);

    const invoice = buildInvoice(bill, booking, guest, bill.taxRates);
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};
