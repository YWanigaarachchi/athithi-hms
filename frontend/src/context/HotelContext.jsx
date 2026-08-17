import React, { createContext, useContext, useState, useEffect } from 'react';
import { TAX_RATES, SL_SEASONS } from '../constants/sriLanka';
import { getSeasonForDate, calcRoomPrice, calcTaxes } from '../utils/hotelUtils';

const HotelContext = createContext();

const INITIAL_ROOMS = [
  {
    id: 'R101',
    number: '101',
    name: 'Sigiriya Deluxe Suite',
    type: 'suite',
    capacity: 2,
    basePrice: 38000,
    status: 'occupied',
    amenities: ['AC', 'King Bed', 'Balcony', 'Mini Bar', 'Ocean View', 'Free Wi-Fi'],
    floor: '1st Floor',
    currentGuest: 'Kasun Perera',
    checkOutDate: '2026-08-19',
  },
  {
    id: 'R102',
    number: '102',
    name: 'Mirissa Ocean Cabana',
    type: 'ocean-view',
    capacity: 2,
    basePrice: 28000,
    status: 'available',
    amenities: ['AC', 'Queen Bed', 'Sea View Deck', 'Rain Shower', 'Free Wi-Fi'],
    floor: 'Ground Floor',
  },
  {
    id: 'R103',
    number: '103',
    name: 'Ella Mountain Eco Villa',
    type: 'eco-cabana',
    capacity: 4,
    basePrice: 45000,
    status: 'occupied',
    amenities: ['Natural Ventilation', 'Private Plunge Pool', 'Mountain View', 'Tea Station'],
    floor: 'Garden Wing',
    currentGuest: 'Liam & Emma Watson',
    checkOutDate: '2026-08-20',
  },
  {
    id: 'R104',
    number: '104',
    name: 'Galle Heritage Deluxe',
    type: 'deluxe',
    capacity: 3,
    basePrice: 24000,
    status: 'available',
    amenities: ['AC', 'Dutch Antique Furnishing', 'Garden Patio', 'Bathtub'],
    floor: '1st Floor',
  },
  {
    id: 'R105',
    number: '105',
    name: 'Bentota Luxury Royal Villa',
    type: 'villa',
    capacity: 6,
    basePrice: 75000,
    status: 'reserved',
    amenities: ['Private Chef', 'Infinity Pool', 'Butler Service', 'Beach Access'],
    floor: 'Beachfront',
    currentGuest: 'David Miller',
    checkInDate: '2026-08-19',
  },
  {
    id: 'R106',
    number: '106',
    name: 'Kandy Royal Standard',
    type: 'standard',
    capacity: 2,
    basePrice: 16000,
    status: 'maintenance',
    amenities: ['AC', 'Double Bed', 'Work Desk', 'En-suite Bathroom'],
    floor: '2nd Floor',
  },
  {
    id: 'R107',
    number: '107',
    name: 'Yala Safari Standard',
    type: 'standard',
    capacity: 2,
    basePrice: 18000,
    status: 'available',
    amenities: ['AC', 'Twin Beds', 'Garden View', 'Tea Station'],
    floor: 'Ground Floor',
  },
  {
    id: 'R108',
    number: '108',
    name: 'Trinco Coral Deluxe',
    type: 'deluxe',
    capacity: 3,
    basePrice: 26000,
    status: 'available',
    amenities: ['AC', 'Balcony', 'Beach View', 'Mini Fridge'],
    floor: '2nd Floor',
  }
];

const INITIAL_GUESTS = [
  {
    id: 'G001',
    name: 'Kasun Perera',
    phone: '+94 77 123 4567',
    email: 'kasun.perera@gmail.com',
    idType: 'nic-old',
    idNumber: '921543890V',
    nationality: 'Sri Lankan',
    spicePreference: 'sri-lankan-hot',
    breakfastPreference: 'traditional-sl',
    notes: 'Likes extra coconut sambol and milk tea in the morning.',
    totalVisits: 3,
  },
  {
    id: 'G002',
    name: 'Liam Watson',
    phone: '+44 7911 123456',
    email: 'liam.watson@ukmail.co.uk',
    idType: 'passport',
    idNumber: 'PA9876543',
    nationality: 'British',
    spicePreference: 'mild',
    breakfastPreference: 'english',
    notes: 'Honeymoon couple. Welcome drinks requested.',
    totalVisits: 1,
  },
  {
    id: 'G003',
    name: 'David Miller',
    phone: '+61 412 345 678',
    email: 'david.m@ozemail.com.au',
    idType: 'passport',
    idNumber: 'AUS5544332',
    nationality: 'Australian',
    spicePreference: 'medium',
    breakfastPreference: 'continental',
    notes: 'Arriving late evening around 8 PM.',
    totalVisits: 2,
  },
  {
    id: 'G004',
    name: 'Dilini Samarasinghe',
    phone: '+94 71 987 6543',
    email: 'dilini.samara@yahoo.com',
    idType: 'nic-new',
    idNumber: '199854201132',
    nationality: 'Sri Lankan',
    spicePreference: 'hot',
    breakfastPreference: 'traditional-sl',
    notes: 'Prefers quiet top-floor room.',
    totalVisits: 4,
  },
  {
    id: 'G005',
    name: 'Hans Becker',
    phone: '+49 170 1234567',
    email: 'hans.becker@berlin.de',
    idType: 'passport',
    idNumber: 'C48912388',
    nationality: 'German',
    spicePreference: 'none',
    breakfastPreference: 'vegan',
    notes: 'Gluten sensitive. Prefers soy milk.',
    totalVisits: 1,
  }
];

const INITIAL_BOOKINGS = [
  {
    id: 'BK-2026-001',
    guestId: 'G001',
    guestName: 'Kasun Perera',
    guestPhone: '+94 77 123 4567',
    roomId: 'R101',
    roomNumber: '101',
    roomName: 'Sigiriya Deluxe Suite',
    checkIn: '2026-08-16',
    checkOut: '2026-08-19',
    nights: 3,
    guestsCount: 2,
    baseRate: 38000,
    multiplier: 1.0,
    subtotal: 114000,
    taxTotal: 34770,
    grandTotal: 148770,
    status: 'checked-in',
    paymentStatus: 'paid',
    spicePreference: 'sri-lankan-hot',
    breakfastPreference: 'traditional-sl',
    createdAt: '2026-08-15',
  },
  {
    id: 'BK-2026-002',
    guestId: 'G002',
    guestName: 'Liam Watson',
    guestPhone: '+44 7911 123456',
    roomId: 'R103',
    roomNumber: '103',
    roomName: 'Ella Mountain Eco Villa',
    checkIn: '2026-08-17',
    checkOut: '2026-08-20',
    nights: 3,
    guestsCount: 2,
    baseRate: 45000,
    multiplier: 1.0,
    subtotal: 135000,
    taxTotal: 41175,
    grandTotal: 176175,
    status: 'checked-in',
    paymentStatus: 'partial',
    spicePreference: 'mild',
    breakfastPreference: 'english',
    createdAt: '2026-08-16',
  },
  {
    id: 'BK-2026-003',
    guestId: 'G003',
    guestName: 'David Miller',
    guestPhone: '+61 412 345 678',
    roomId: 'R105',
    roomNumber: '105',
    roomName: 'Bentota Luxury Royal Villa',
    checkIn: '2026-08-19',
    checkOut: '2026-08-23',
    nights: 4,
    guestsCount: 4,
    baseRate: 75000,
    multiplier: 1.0,
    subtotal: 300000,
    taxTotal: 91500,
    grandTotal: 391500,
    status: 'confirmed',
    paymentStatus: 'pending',
    spicePreference: 'medium',
    breakfastPreference: 'continental',
    createdAt: '2026-08-17',
  },
  {
    id: 'BK-2026-004',
    guestId: 'G004',
    guestName: 'Dilini Samarasinghe',
    guestPhone: '+94 71 987 6543',
    roomId: 'R102',
    roomNumber: '102',
    roomName: 'Mirissa Ocean Cabana',
    checkIn: '2026-08-14',
    checkOut: '2026-08-17',
    nights: 3,
    guestsCount: 2,
    baseRate: 28000,
    multiplier: 1.0,
    subtotal: 84000,
    taxTotal: 25620,
    grandTotal: 109620,
    status: 'checked-out',
    paymentStatus: 'paid',
    spicePreference: 'hot',
    breakfastPreference: 'traditional-sl',
    createdAt: '2026-08-12',
  }
];

const INITIAL_BILLS = [
  {
    id: 'INV-2026-001',
    bookingId: 'BK-2026-001',
    guestName: 'Kasun Perera',
    roomNumber: '101',
    date: '2026-08-16',
    items: [
      { description: 'Sigiriya Deluxe Suite (3 Nights)', amount: 114000 },
      { description: 'Traditional Sri Lankan Buffet (Breakfast)', amount: 6500 },
      { description: 'King Coconut & Fresh Juice Bar', amount: 2200 },
    ],
    subtotal: 122700,
    serviceCharge: 12270,
    vat: 24294.6,
    sscl: 3067.5,
    grandTotal: 162332.1,
    status: 'paid',
    paymentMethod: 'Credit Card (Visa)',
  },
  {
    id: 'INV-2026-002',
    bookingId: 'BK-2026-002',
    guestName: 'Liam Watson',
    roomNumber: '103',
    date: '2026-08-17',
    items: [
      { description: 'Ella Mountain Eco Villa (3 Nights)', amount: 135000 },
      { description: 'Ceylon Tea Tasting Experience', amount: 8000 },
      { description: 'Airport Luxury Transfer (Bandaranaike Intl)', amount: 18000 },
    ],
    subtotal: 161000,
    serviceCharge: 16100,
    vat: 31878,
    sscl: 4025,
    grandTotal: 213003,
    status: 'pending',
    paymentMethod: 'Unpaid',
  }
];

export function HotelProvider({ children }) {
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('athithi_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [guests, setGuests] = useState(() => {
    const saved = localStorage.getItem('athithi_guests');
    return saved ? JSON.parse(saved) : INITIAL_GUESTS;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('athithi_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem('athithi_bills');
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [taxRates, setTaxRates] = useState(() => {
    const saved = localStorage.getItem('athithi_tax_rates');
    return saved ? JSON.parse(saved) : TAX_RATES;
  });

  const [currency, setCurrency] = useState('LKR');
  const [usdRate, setUsdRate] = useState(305.50); // 1 USD = 305.50 LKR

  const [hotelInfo, setHotelInfo] = useState({
    name: 'Athithi Beach & Mountain Resort',
    tagline: 'Authentic Sri Lankan Hospitality • අමුත්තා',
    address: 'No. 45, Galle Road, Unawatuna, Southern Province, Sri Lanka',
    phone: '+94 91 223 8899 / +94 77 123 4567',
    email: 'reservations@athithihotels.lk',
    taxRegNo: 'VAT-987654321-7000 / SSCL-2024-LK',
    vatRate: 18,
    ssclRate: 2.5,
    serviceRate: 10,
  });

  useEffect(() => {
    localStorage.setItem('athithi_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('athithi_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('athithi_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('athithi_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('athithi_tax_rates', JSON.stringify(taxRates));
  }, [taxRates]);

  // Actions
  const addBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: `BK-2026-${String(bookings.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      paymentStatus: 'pending',
    };

    setBookings([newBooking, ...bookings]);

    // Update Room status to reserved
    setRooms((prev) =>
      prev.map((r) =>
        r.id === bookingData.roomId
          ? { ...r, status: 'reserved', currentGuest: bookingData.guestName }
          : r
      )
    );

    // Auto-generate initial bill
    const billSubtotal = newBooking.subtotal;
    const taxes = calcTaxes(billSubtotal, taxRates);
    const newBill = {
      id: `INV-2026-${String(bills.length + 1).padStart(3, '0')}`,
      bookingId: newBooking.id,
      guestName: newBooking.guestName,
      roomNumber: newBooking.roomNumber,
      date: newBooking.createdAt,
      items: [
        {
          description: `${newBooking.roomName} (${newBooking.nights} Night${newBooking.nights > 1 ? 's' : ''})`,
          amount: billSubtotal,
        },
      ],
      subtotal: billSubtotal,
      serviceCharge: taxes.serviceCharge,
      vat: taxes.vat,
      sscl: taxes.sscl,
      grandTotal: taxes.total,
      status: 'pending',
      paymentMethod: 'Unpaid',
    };

    setBills([newBill, ...bills]);
    return newBooking;
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          // Sync room status
          if (newStatus === 'checked-in') {
            setRooms((roomsPrev) =>
              roomsPrev.map((r) =>
                r.id === b.roomId ? { ...r, status: 'occupied', currentGuest: b.guestName, checkOutDate: b.checkOut } : r
              )
            );
          } else if (newStatus === 'checked-out') {
            setRooms((roomsPrev) =>
              roomsPrev.map((r) =>
                r.id === b.roomId ? { ...r, status: 'available', currentGuest: null, checkOutDate: null } : r
              )
            );
          } else if (newStatus === 'cancelled') {
            setRooms((roomsPrev) =>
              roomsPrev.map((r) =>
                r.id === b.roomId ? { ...r, status: 'available', currentGuest: null } : r
              )
            );
          }
          return { ...b, status: newStatus };
        }
        return b;
      })
    );
  };

  const addRoom = (roomData) => {
    const newRoom = {
      ...roomData,
      id: `R${roomData.number}`,
      status: 'available',
    };
    setRooms((prev) => [...prev, newRoom]);
    return newRoom;
  };

  const updateRoom = (id, roomData) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...roomData } : r)));
  };

  const addGuest = (guestData) => {
    const newGuest = {
      ...guestData,
      id: `G${String(guests.length + 1).padStart(3, '0')}`,
      totalVisits: 1,
    };
    setGuests((prev) => [newGuest, ...prev]);
    return newGuest;
  };

  const updateGuest = (id, guestData) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...guestData } : g)));
  };

  const markBillPaid = (billId, paymentMethod = 'Cash (LKR)') => {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id === billId) {
          // Also update booking paymentStatus
          setBookings((bPrev) =>
            bPrev.map((b) => (b.id === bill.bookingId ? { ...b, paymentStatus: 'paid' } : b))
          );
          return { ...bill, status: 'paid', paymentMethod };
        }
        return bill;
      })
    );
  };

  const addBillItem = (billId, item) => {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id === billId) {
          const newItems = [...bill.items, item];
          const newSubtotal = newItems.reduce((sum, i) => sum + Number(i.amount), 0);
          const taxes = calcTaxes(newSubtotal, taxRates);
          return {
            ...bill,
            items: newItems,
            subtotal: newSubtotal,
            serviceCharge: taxes.serviceCharge,
            vat: taxes.vat,
            sscl: taxes.sscl,
            grandTotal: taxes.total,
          };
        }
        return bill;
      })
    );
  };

  return (
    <HotelContext.Provider
      value={{
        rooms,
        guests,
        bookings,
        bills,
        taxRates,
        setTaxRates,
        currency,
        setCurrency,
        usdRate,
        setUsdRate,
        hotelInfo,
        setHotelInfo,
        addBooking,
        updateBookingStatus,
        addRoom,
        updateRoom,
        addGuest,
        updateGuest,
        markBillPaid,
        addBillItem,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}
