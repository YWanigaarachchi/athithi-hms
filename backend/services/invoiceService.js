const { calcTaxes } = require('./pricingService');

/**
 * Builds a structured invoice object from a bill document.
 *
 * @param {Object} bill        - Mongoose Bill document (populated)
 * @param {Object} booking     - Mongoose Booking document (populated)
 * @param {Object} guest       - Mongoose Guest document
 * @param {Object} rates       - Tax rates to apply
 * @returns {Object}           - Structured invoice payload
 */
function buildInvoice(bill, booking, guest, rates = {}) {
  const subtotal     = bill.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxes        = calcTaxes(subtotal, rates);
  const exchangeRate = bill.exchangeRate || 320;
  const totalLKR     = taxes.total;
  const totalUSD     = parseFloat((totalLKR / exchangeRate).toFixed(2));

  const lineItemGroups = {
    room:  bill.lineItems.filter(i => i.type === 'room'),
    fb:    bill.lineItems.filter(i => i.type === 'fb'),
    extra: bill.lineItems.filter(i => i.type === 'extra'),
  };

  return {
    invoiceNumber:  bill._id.toString(),
    issuedAt:       bill.issuedAt || new Date(),
    paymentStatus:  bill.paymentStatus,

    hotel: {
      name:    'Athithi HMS',
      tagline: 'Hotel Management System · Sri Lanka',
      vatReg:  'VAT-REG-XXXXXXXXXX',
      ssclReg: 'SSCL-REG-XXXXXXXXXX',
    },

    guest: {
      name:    `${guest.firstName} ${guest.lastName}`,
      email:   guest.email,
      phone:   guest.phone,
      nicType: guest.nicType,
      nicNumber: guest.nicNumber,
      country: guest.country,
    },

    booking: {
      bookingId:    booking._id.toString(),
      roomNumber:   booking.roomId?.number,
      roomName:     booking.roomId?.name,
      checkIn:      booking.checkIn,
      checkOut:     booking.checkOut,
      nights:       booking.nights,
      seasonName:   booking.seasonName,
      multiplier:   booking.seasonMultiplier,
    },

    lineItems: {
      room:  lineItemGroups.room,
      fb:    lineItemGroups.fb,
      extra: lineItemGroups.extra,
      all:   bill.lineItems,
    },

    financials: {
      currency:      bill.currency || 'LKR',
      exchangeRate,
      subtotal,
      serviceCharge: taxes.serviceCharge,
      vat:           taxes.vat,
      sscl:          taxes.sscl,
      totalLKR,
      totalUSD,
      rates: {
        VAT:    `${(rates.VAT || 0.18) * 100}%`,
        SSCL:   `${(rates.SSCL || 0.025) * 100}%`,
        SC:     `${(rates.SERVICE_CHARGE || 0.10) * 100}%`,
      },
    },
  };
}

module.exports = { buildInvoice };
