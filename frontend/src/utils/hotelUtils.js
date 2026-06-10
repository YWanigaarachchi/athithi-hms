import { SL_SEASONS } from '../constants/sriLanka';

/**
 * Detects active Sri Lankan season for a given date.
 * Returns the season object + computed multiplier.
 */
export function getSeasonForDate(date = new Date()) {
  const d = new Date(date);
  const month = d.getMonth() + 1; // 1-indexed
  const day   = d.getDate();

  for (const season of SL_SEASONS) {
    const { startMonth, startDay, endMonth, endDay } = season;

    // Handle year wrap (e.g., Dec 20 – Jan 5)
    if (startMonth > endMonth) {
      if (
        (month === startMonth && day >= startDay) ||
        (month > startMonth) ||
        (month < endMonth) ||
        (month === endMonth && day <= endDay)
      ) return season;
    } else {
      if (
        (month > startMonth || (month === startMonth && day >= startDay)) &&
        (month < endMonth   || (month === endMonth   && day <= endDay))
      ) return season;
    }
  }
  return null; // off-peak
}

/**
 * Returns the price multiplier for a date range.
 * Uses the highest applicable multiplier if dates span multiple seasons.
 */
export function getPriceMultiplier(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end   = new Date(checkOut);
  let maxMultiplier = 1.0;
  let activeSeason = null;

  const cur = new Date(start);
  while (cur < end) {
    const season = getSeasonForDate(cur);
    if (season && season.multiplier > maxMultiplier) {
      maxMultiplier = season.multiplier;
      activeSeason = season;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return { multiplier: maxMultiplier, season: activeSeason };
}

/**
 * Calculates number of nights between check-in and check-out.
 */
export function calcNights(checkIn, checkOut) {
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Computes final room price with seasonal pricing.
 */
export function calcRoomPrice(basePrice, checkIn, checkOut) {
  const nights = calcNights(checkIn, checkOut);
  const { multiplier, season } = getPriceMultiplier(checkIn, checkOut);
  const subtotal = basePrice * multiplier * nights;
  return { nights, multiplier, season, subtotal, pricePerNight: basePrice * multiplier };
}

/**
 * Sri Lankan Tax Calculator
 */
export function calcTaxes(subtotal, rates) {
  const { VAT = 0.18, SSCL = 0.025, SERVICE_CHARGE = 0.10 } = rates;
  const serviceCharge = subtotal * SERVICE_CHARGE;
  const vat           = (subtotal + serviceCharge) * VAT;
  const sscl          = subtotal * SSCL;
  const total         = subtotal + serviceCharge + vat + sscl;
  return { serviceCharge, vat, sscl, total };
}

/**
 * NIC Validator — supports old (9-digit + V/X) and new (12-digit) formats.
 */
export function validateNIC(nic, type) {
  if (!nic) return { valid: false, message: 'NIC is required' };

  if (type === 'nic-old') {
    const oldNIC = /^[0-9]{9}[VXvx]$/;
    if (!oldNIC.test(nic)) return { valid: false, message: 'Invalid old NIC — expected 9 digits + V or X (e.g., 123456789V)' };
    return { valid: true, message: 'Valid old-format NIC ✓' };
  }

  if (type === 'nic-new') {
    const newNIC = /^[0-9]{12}$/;
    if (!newNIC.test(nic)) return { valid: false, message: 'Invalid new NIC — expected 12 numeric digits' };
    return { valid: true, message: 'Valid new-format NIC ✓' };
  }

  if (type === 'passport') {
    const passport = /^[A-Z0-9]{6,12}$/i;
    if (!passport.test(nic)) return { valid: false, message: 'Invalid passport number' };
    return { valid: true, message: 'Valid passport ✓' };
  }

  return { valid: false, message: 'Unknown ID type' };
}

/**
 * Format currency in LKR or USD.
 */
export function formatCurrency(amount, currency = 'LKR') {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
  }
  return `LKR ${new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2 }).format(amount)}`;
}

/**
 * Format date in Sri Lankan format (dd/MM/yyyy).
 */
export function formatDateSL(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' });
}
