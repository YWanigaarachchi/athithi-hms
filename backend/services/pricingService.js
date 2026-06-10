const { SL_SEASONS, DEFAULT_TAX_RATES } = require('../constants/sriLanka');

// ─── Seasonal Pricing ─────────────────────────────────────────────────────────

/**
 * Returns the active season for a given date.
 * @param {Date} date
 * @returns {Object|null} season or null for off-peak
 */
function getSeasonForDate(date) {
  const d = new Date(date);
  const month = d.getMonth() + 1; // 1-indexed
  const day   = d.getDate();

  for (const season of SL_SEASONS) {
    const { startMonth, startDay, endMonth, endDay } = season;

    // Handle year-wrapping (e.g., Dec 20 – Jan 5)
    if (startMonth > endMonth) {
      const inEnd   = month < endMonth || (month === endMonth && day <= endDay);
      const inStart = month > startMonth || (month === startMonth && day >= startDay);
      if (inStart || inEnd) return season;
    } else {
      const afterStart = month > startMonth || (month === startMonth && day >= startDay);
      const beforeEnd  = month < endMonth   || (month === endMonth   && day <= endDay);
      if (afterStart && beforeEnd) return season;
    }
  }
  return null; // off-peak
}

/**
 * Returns the highest-multiplier season active during a date range.
 * @param {Date|string} checkIn
 * @param {Date|string} checkOut
 * @returns {{ multiplier: number, season: Object|null }}
 */
function getPriceMultiplier(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end   = new Date(checkOut);
  let maxMultiplier = 1.0;
  let activeSeason  = null;

  const cur = new Date(start);
  while (cur < end) {
    const season = getSeasonForDate(cur);
    if (season && season.multiplier > maxMultiplier) {
      maxMultiplier = season.multiplier;
      activeSeason  = season;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return { multiplier: maxMultiplier, season: activeSeason };
}

/**
 * Calculates number of nights between dates.
 */
function calcNights(checkIn, checkOut) {
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Computes room price with seasonal multiplier.
 * @param {number} basePrice - LKR per night
 * @param {Date|string} checkIn
 * @param {Date|string} checkOut
 * @returns {{ nights, multiplier, season, pricePerNight, subtotal }}
 */
function calcRoomPrice(basePrice, checkIn, checkOut) {
  const nights = calcNights(checkIn, checkOut);
  const { multiplier, season } = getPriceMultiplier(checkIn, checkOut);
  const pricePerNight = parseFloat((basePrice * multiplier).toFixed(2));
  const subtotal      = parseFloat((pricePerNight * nights).toFixed(2));
  return { nights, multiplier, season: season?.name || 'Off-Peak', pricePerNight, subtotal };
}

// ─── Tax Calculator ───────────────────────────────────────────────────────────

/**
 * Sri Lankan statutory tax calculator.
 * Formula:
 *   Service Charge = subtotal × 10%
 *   VAT            = (subtotal + SC) × 18%
 *   SSCL           = subtotal × 2.5%
 *   Total          = subtotal + SC + VAT + SSCL
 *
 * @param {number} subtotal - pre-tax amount in LKR
 * @param {Object} rates - override rates (optional)
 * @returns {{ serviceCharge, vat, sscl, total }}
 */
function calcTaxes(subtotal, rates = {}) {
  const { VAT, SSCL, SERVICE_CHARGE } = { ...DEFAULT_TAX_RATES, ...rates };
  const serviceCharge = parseFloat((subtotal * SERVICE_CHARGE).toFixed(2));
  const vat           = parseFloat(((subtotal + serviceCharge) * VAT).toFixed(2));
  const sscl          = parseFloat((subtotal * SSCL).toFixed(2));
  const total         = parseFloat((subtotal + serviceCharge + vat + sscl).toFixed(2));
  return { serviceCharge, vat, sscl, total };
}

module.exports = { getSeasonForDate, getPriceMultiplier, calcNights, calcRoomPrice, calcTaxes };
