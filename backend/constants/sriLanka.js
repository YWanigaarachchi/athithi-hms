// ────────────────────────────────────────────────────────────────────
// Sri Lankan Hospitality Industry Constants
// ────────────────────────────────────────────────────────────────────

/**
 * Sri Lankan seasonal pricing rules.
 * Dates are month/day (1-indexed). Year-spanning seasons handled separately.
 */
const SL_SEASONS = [
  {
    name: 'Christmas & New Year Peak',
    startMonth: 12, startDay: 20,
    endMonth: 1,   endDay: 5,
    multiplier: 1.6,
    type: 'peak',
  },
  {
    name: "Sinhala & Tamil New Year",
    startMonth: 4, startDay: 10,
    endMonth: 4,   endDay: 16,
    multiplier: 1.5,
    type: 'peak',
  },
  {
    name: 'Esala Perahera (Kandy)',
    startMonth: 7, startDay: 25,
    endMonth: 8,   endDay: 10,
    multiplier: 1.4,
    type: 'peak',
  },
  {
    name: 'April Tourist Peak',
    startMonth: 4, startDay: 1,
    endMonth: 4,   endDay: 30,
    multiplier: 1.35,
    type: 'moderate',
  },
  {
    name: 'Down South Season',
    startMonth: 11, startDay: 1,
    endMonth: 1,    endDay: 31,
    multiplier: 1.3,
    type: 'moderate',
  },
];

/**
 * Default Sri Lankan statutory tax rates.
 * These are parameterized — override via DB settings.
 */
const DEFAULT_TAX_RATES = {
  VAT: 0.18,             // Value Added Tax — 18%
  SSCL: 0.025,           // Social Security Contribution Levy — 2.5%
  SERVICE_CHARGE: 0.10,  // Standard hotel service charge — 10%
};

/**
 * NIC regex patterns for Sri Lankan National Identity Cards.
 */
const NIC_PATTERNS = {
  OLD: /^[0-9]{9}[VXvx]$/,    // 9 digits + V or X
  NEW: /^[0-9]{12}$/,          // 12 numeric digits
};

/**
 * Passport number — basic alphanumeric, 6–12 chars.
 */
const PASSPORT_PATTERN = /^[A-Z0-9]{6,12}$/i;

/**
 * Valid room types.
 */
const ROOM_TYPES = ['standard', 'deluxe', 'ocean-view', 'eco-cabana', 'suite', 'villa'];

/**
 * Booking statuses.
 */
const BOOKING_STATUSES = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'];

/**
 * Spice tolerance levels.
 */
const SPICE_LEVELS = ['none', 'mild', 'medium', 'hot', 'sri-lankan-hot'];

/**
 * Breakfast preferences.
 */
const BREAKFAST_PREFS = [
  'traditional-sl', 'continental', 'english', 'vegetarian', 'vegan', 'none',
];

module.exports = {
  SL_SEASONS,
  DEFAULT_TAX_RATES,
  NIC_PATTERNS,
  PASSPORT_PATTERN,
  ROOM_TYPES,
  BOOKING_STATUSES,
  SPICE_LEVELS,
  BREAKFAST_PREFS,
};
