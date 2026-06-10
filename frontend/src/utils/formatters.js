// ── Currency Formatter ────────────────────────────────────────────────────
export const fmtLKR = (amount) =>
  new Intl.NumberFormat('si-LK', {
    style:    'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

export const fmtUSD = (amount) =>
  new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount || 0);

export const fmtNumber = (n) =>
  new Intl.NumberFormat('en-US').format(n || 0);

// ── Date Formatter ────────────────────────────────────────────────────────
export const fmtDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(date));
};

export const fmtDateTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
};

export const fmtDateInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// ── Status Helpers ─────────────────────────────────────────────────────────
export const bookingStatusBadge = (status) => {
  const map = {
    pending:      'badge-warning',
    confirmed:    'badge-info',
    'checked-in': 'badge-success',
    'checked-out':'badge-neutral',
    cancelled:    'badge-danger',
    'no-show':    'badge-danger',
  };
  return map[status] || 'badge-neutral';
};

export const roomStatusBadge = (status) => {
  const map = {
    available:   'badge-success',
    occupied:    'badge-danger',
    reserved:    'badge-warning',
    maintenance: 'badge-neutral',
  };
  return map[status] || 'badge-neutral';
};

export const paymentStatusBadge = (status) => {
  const map = {
    pending:         'badge-warning',
    paid:            'badge-success',
    'partially-paid':'badge-info',
    refunded:        'badge-neutral',
  };
  return map[status] || 'badge-neutral';
};

// ── Room Type Labels ───────────────────────────────────────────────────────
export const roomTypeLabel = (type) => {
  const map = {
    standard:    'Standard',
    deluxe:      'Deluxe',
    'ocean-view':'Ocean View',
    'eco-cabana':'Eco-Cabana',
    suite:       'Suite',
    villa:       'Villa',
  };
  return map[type] || type;
};

// ── NIC Type Labels ────────────────────────────────────────────────────────
export const nicTypeLabel = (type) => {
  const map = {
    'nic-old': 'NIC (Old)',
    'nic-new': 'NIC (New)',
    passport:  'Passport',
  };
  return map[type] || type;
};

// ── Initials ──────────────────────────────────────────────────────────────
export const getInitials = (first, last) => {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
};

// ── Nights calc ───────────────────────────────────────────────────────────
export const calcNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
};
