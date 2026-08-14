import { INITIAL_ROOMS, INITIAL_GUESTS, INITIAL_BOOKINGS, INITIAL_BILLS } from './demoData';

const STORAGE_KEYS = {
  ROOMS: 'athithi_demo_rooms',
  GUESTS: 'athithi_demo_guests',
  BOOKINGS: 'athithi_demo_bookings',
  BILLS: 'athithi_demo_bills',
};

function getStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

// ─── Rooms Store ─────────────────────────────────────────────────────────────
export const roomsStore = {
  getAll: (params = {}) => {
    let rooms = getStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    if (params.type) rooms = rooms.filter(r => r.type === params.type);
    if (params.status) rooms = rooms.filter(r => r.status === params.status);
    if (params.search) {
      const q = params.search.toLowerCase();
      rooms = rooms.filter(r => r.name.toLowerCase().includes(q) || r.number.includes(q));
    }
    return { data: rooms, total: rooms.length };
  },

  getById: (id) => {
    const rooms = getStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    return rooms.find(r => r._id === id);
  },

  create: (data) => {
    const rooms = getStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    const newRoom = {
      ...data,
      _id: `room-${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    rooms.unshift(newRoom);
    setStorage(STORAGE_KEYS.ROOMS, rooms);
    return newRoom;
  },

  update: (id, data) => {
    const rooms = getStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    const idx = rooms.findIndex(r => r._id === id);
    if (idx !== -1) {
      rooms[idx] = { ...rooms[idx], ...data };
      setStorage(STORAGE_KEYS.ROOMS, rooms);
      return rooms[idx];
    }
    return null;
  },

  delete: (id) => {
    let rooms = getStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    rooms = rooms.filter(r => r._id !== id);
    setStorage(STORAGE_KEYS.ROOMS, rooms);
    return true;
  },
};

// ─── Guests Store ────────────────────────────────────────────────────────────
export const guestsStore = {
  getAll: (params = {}) => {
    let guests = getStorage(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
    if (params.search) {
      const q = params.search.toLowerCase();
      guests = guests.filter(g =>
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
        (g.nicNumber && g.nicNumber.toLowerCase().includes(q)) ||
        (g.email && g.email.toLowerCase().includes(q)) ||
        (g.phone && g.phone.includes(q))
      );
    }
    return { data: guests, total: guests.length };
  },

  getById: (id) => {
    const guests = getStorage(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
    return guests.find(g => g._id === id);
  },

  create: (data) => {
    const guests = getStorage(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
    const newGuest = {
      ...data,
      _id: `guest-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    guests.unshift(newGuest);
    setStorage(STORAGE_KEYS.GUESTS, guests);
    return newGuest;
  },

  update: (id, data) => {
    const guests = getStorage(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
    const idx = guests.findIndex(g => g._id === id);
    if (idx !== -1) {
      guests[idx] = { ...guests[idx], ...data };
      setStorage(STORAGE_KEYS.GUESTS, guests);
      return guests[idx];
    }
    return null;
  },

  delete: (id) => {
    let guests = getStorage(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
    guests = guests.filter(g => g._id !== id);
    setStorage(STORAGE_KEYS.GUESTS, guests);
    return true;
  },
};

// ─── Bookings Store ──────────────────────────────────────────────────────────
export const bookingsStore = {
  getAll: (params = {}) => {
    let bookings = getStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    if (params.status) bookings = bookings.filter(b => b.status === params.status);
    if (params.search) {
      const q = params.search.toLowerCase();
      bookings = bookings.filter(b =>
        (b.bookingReference && b.bookingReference.toLowerCase().includes(q)) ||
        `${b.guestId?.firstName} ${b.guestId?.lastName}`.toLowerCase().includes(q)
      );
    }
    return { data: bookings, total: bookings.length };
  },

  getToday: () => {
    const bookings = getStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const checkIns = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
    const checkOuts = bookings.filter(b => b.status === 'checked-in');
    return { checkIns, checkOuts };
  },

  getById: (id) => {
    const bookings = getStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    return bookings.find(b => b._id === id);
  },

  create: (data) => {
    const bookings = getStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const guests = getStorage(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
    const rooms = getStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);

    const guest = guests.find(g => g._id === data.guestId) || { firstName: 'Guest', lastName: 'Member' };
    const room = rooms.find(r => r._id === data.roomId) || { number: '101', name: 'Room', basePrice: 25000 };

    const nights = Math.max(1, Math.round((new Date(data.checkOut) - new Date(data.checkIn)) / (1000 * 60 * 60 * 24)));
    const roomSubtotal = room.basePrice * nights;
    const finalPrice = roomSubtotal * 1.305;

    const refNum = `ATH-${new Date().getFullYear()}-${String(bookings.length + 1).padStart(3, '0')}`;

    const newBooking = {
      _id: `bk-${Date.now()}`,
      bookingReference: refNum,
      guestId: guest,
      roomId: room,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      nights,
      adults: data.adults || 2,
      children: data.children || 0,
      status: 'confirmed',
      basePricePerNight: room.basePrice,
      seasonMultiplier: 1.0,
      seasonName: 'Standard Season',
      pricePerNight: room.basePrice,
      roomSubtotal,
      finalPrice,
      currency: data.currency || 'LKR',
      source: data.source || 'phone',
      specialNotes: data.specialNotes || '',
      createdAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);
    setStorage(STORAGE_KEYS.BOOKINGS, bookings);

    // Auto-generate Bill
    billsStore.createForBooking(newBooking, guest, room);

    return newBooking;
  },

  updateStatus: (id, newStatus) => {
    const bookings = getStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const idx = bookings.findIndex(b => b._id === id);
    if (idx !== -1) {
      bookings[idx].status = newStatus;
      setStorage(STORAGE_KEYS.BOOKINGS, bookings);
      return bookings[idx];
    }
    return null;
  },
};

// ─── Bills Store ─────────────────────────────────────────────────────────────
export const billsStore = {
  getAll: (params = {}) => {
    let bills = getStorage(STORAGE_KEYS.BILLS, INITIAL_BILLS);
    if (params.status) bills = bills.filter(b => b.paymentStatus === params.status);
    if (params.search) {
      const q = params.search.toLowerCase();
      bills = bills.filter(b =>
        (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(q)) ||
        `${b.guestId?.firstName} ${b.guestId?.lastName}`.toLowerCase().includes(q)
      );
    }
    return { data: bills, total: bills.length };
  },

  getById: (id) => {
    const bills = getStorage(STORAGE_KEYS.BILLS, INITIAL_BILLS);
    return bills.find(b => b._id === id);
  },

  createForBooking: (booking, guest, room) => {
    const bills = getStorage(STORAGE_KEYS.BILLS, INITIAL_BILLS);
    const subtotal = booking.roomSubtotal;
    const serviceCharge = parseFloat((subtotal * 0.10).toFixed(2));
    const vat = parseFloat(((subtotal + serviceCharge) * 0.18).toFixed(2));
    const sscl = parseFloat((subtotal * 0.025).toFixed(2));
    const totalLKR = parseFloat((subtotal + serviceCharge + vat + sscl).toFixed(2));

    const newBill = {
      _id: `bill-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(3, '0')}`,
      bookingId: booking,
      guestId: guest,
      lineItems: [
        {
          description: `Room Stay: ${room.name || 'Room'} (${booking.nights} nights)`,
          type: 'room',
          amount: booking.roomSubtotal,
          quantity: booking.nights,
          unitPrice: booking.basePricePerNight,
        },
      ],
      subtotal,
      serviceCharge,
      vat,
      sscl,
      totalLKR,
      totalUSD: parseFloat((totalLKR / 320).toFixed(2)),
      currency: booking.currency || 'LKR',
      exchangeRate: 320,
      paymentStatus: 'pending',
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    bills.unshift(newBill);
    setStorage(STORAGE_KEYS.BILLS, bills);
    return newBill;
  },

  addItem: (billId, item) => {
    const bills = getStorage(STORAGE_KEYS.BILLS, INITIAL_BILLS);
    const idx = bills.findIndex(b => b._id === billId);
    if (idx !== -1) {
      const b = bills[idx];
      b.lineItems.push(item);
      b.subtotal = b.lineItems.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
      b.serviceCharge = parseFloat((b.subtotal * 0.10).toFixed(2));
      b.vat = parseFloat(((b.subtotal + b.serviceCharge) * 0.18).toFixed(2));
      b.sscl = parseFloat((b.subtotal * 0.025).toFixed(2));
      b.totalLKR = parseFloat((b.subtotal + b.serviceCharge + b.vat + b.sscl).toFixed(2));
      b.totalUSD = parseFloat((b.totalLKR / 320).toFixed(2));
      setStorage(STORAGE_KEYS.BILLS, bills);
      return b;
    }
    return null;
  },

  markPaid: (billId, paymentDetails = {}) => {
    const bills = getStorage(STORAGE_KEYS.BILLS, INITIAL_BILLS);
    const idx = bills.findIndex(b => b._id === billId);
    if (idx !== -1) {
      bills[idx].paymentStatus = 'paid';
      bills[idx].paymentMethod = paymentDetails.method || 'card';
      bills[idx].paidAt = new Date().toISOString();
      bills[idx].paidAmount = bills[idx].totalLKR;
      setStorage(STORAGE_KEYS.BILLS, bills);
      return bills[idx];
    }
    return null;
  },
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export const dashboardStore = {
  getStats: () => {
    const rooms = getStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    const guests = getStorage(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
    const bookings = getStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const bills = getStorage(STORAGE_KEYS.BILLS, INITIAL_BILLS);

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const activeBookings = bookings.filter(b => b.status === 'checked-in' || b.status === 'confirmed').length;
    const checkInsToday = bookings.filter(b => b.status === 'confirmed').length;
    const checkOutsToday = bookings.filter(b => b.status === 'checked-in').length;

    const todayRevenue = bills
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalLKR || 0), 0);

    return {
      rooms: { total: totalRooms, occupied: occupiedRooms, available: availableRooms },
      guests: { total: guests.length },
      bookings: { active: activeBookings, checkInsToday, checkOutsToday, total: bookings.length },
      revenue: { today: todayRevenue || 150160.5 },
      occupancyRate,
    };
  },
};
