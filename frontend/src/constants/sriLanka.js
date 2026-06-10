// Sri Lankan Seasons & Pricing Constants
export const SL_SEASONS = [
  {
    name: 'Christmas & New Year Peak',
    emoji: '🎄',
    startMonth: 12, startDay: 20,
    endMonth: 1,   endDay: 5,
    multiplier: 1.6,
    type: 'peak',
    description: 'High demand from foreign tourists',
  },
  {
    name: "Sinhala & Tamil New Year",
    emoji: '🎊',
    startMonth: 4, startDay: 10,
    endMonth: 4,   endDay: 16,
    multiplier: 1.5,
    type: 'peak',
    description: 'Local national holiday season',
  },
  {
    name: 'Esala Perahera (Kandy)',
    emoji: '🐘',
    startMonth: 7, startDay: 25,
    endMonth: 8,   endDay: 10,
    multiplier: 1.4,
    type: 'peak',
    description: 'Famous Buddhist pageant in Kandy',
  },
  {
    name: 'April Tourist Peak',
    emoji: '🌺',
    startMonth: 4, startDay: 1,
    endMonth: 4,   endDay: 30,
    multiplier: 1.35,
    type: 'moderate',
    description: 'General April peak season',
  },
  {
    name: 'Down South Season',
    emoji: '🌊',
    startMonth: 11, startDay: 1,
    endMonth: 1,    endDay: 31,
    multiplier: 1.3,
    type: 'moderate',
    description: 'Southern coast beach season',
  },
];

export const TAX_RATES = {
  VAT: 0.18,           // 18% — Sri Lanka 2024
  SSCL: 0.025,         // 2.5% Social Security Contribution Levy
  SERVICE_CHARGE: 0.10, // 10% Service Charge
};

export const CURRENCIES = { LKR: 'LKR', USD: 'USD' };

export const ROOM_TYPES = [
  { value: 'standard',    label: 'Standard Room',  emoji: '🛏️' },
  { value: 'deluxe',      label: 'Deluxe Room',    emoji: '✨' },
  { value: 'ocean-view',  label: 'Ocean View',     emoji: '🌊' },
  { value: 'eco-cabana',  label: 'Eco Cabana',     emoji: '🌿' },
  { value: 'suite',       label: 'Suite',           emoji: '👑' },
  { value: 'villa',       label: 'Private Villa',  emoji: '🏡' },
];

export const BOOKING_STATUSES = [
  { value: 'pending',      label: 'Pending',      class: 'badge-pending'     },
  { value: 'confirmed',    label: 'Confirmed',    class: 'badge-confirmed'   },
  { value: 'checked-in',   label: 'Checked In',   class: 'badge-checked-in'  },
  { value: 'checked-out',  label: 'Checked Out',  class: 'badge-checked-out' },
  { value: 'cancelled',    label: 'Cancelled',    class: 'badge-cancelled'   },
];

export const SPICE_LEVELS = [
  { value: 'none',              label: '🚫 None — No spice' },
  { value: 'mild',              label: '🌿 Mild' },
  { value: 'medium',            label: '🌶️ Medium' },
  { value: 'hot',               label: '🔥 Hot' },
  { value: 'sri-lankan-hot',    label: '💥 Sri Lankan Hot' },
];

export const BREAKFAST_PREFERENCES = [
  { value: 'traditional-sl',   label: '🍛 Traditional Sri Lankan (Hoppers, Kiribath)' },
  { value: 'continental',      label: '🥐 Continental' },
  { value: 'english',          label: '🍳 Full English' },
  { value: 'vegetarian',       label: '🥗 Vegetarian' },
  { value: 'vegan',            label: '🌱 Vegan' },
  { value: 'none',             label: '❌ No Breakfast' },
];

export const NIC_TYPES = [
  { value: 'nic-old',   label: '🇱🇰 NIC (Old — 9 digit + V/X)' },
  { value: 'nic-new',   label: '🇱🇰 NIC (New — 12 digit)' },
  { value: 'passport',  label: '🛂 Passport' },
];
