import React, { createContext, useContext, useState, useEffect } from 'react';
import { TAX_RATES, SL_SEASONS } from '../constants/sriLanka';
import { getSeasonForDate, calcRoomPrice, calcTaxes } from '../utils/hotelUtils';
import toast from 'react-hot-toast';

const HotelContext = createContext();

export const INITIAL_ROOMS = [
  {
    id: 'R101',
    number: '101',
    name: 'Sigiriya Deluxe Suite',
    type: 'suite',
    capacity: 2,
    basePrice: 38000,
    status: 'occupied',
    amenities: ['AC', 'King Bed', 'Balcony', 'Mini Bar', 'Ocean View', 'Free Wi-Fi', 'Bathtub'],
    floor: '1st Floor - Ocean Wing',
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
    floor: 'Ground Floor - Beachfront',
  },
  {
    id: 'R103',
    number: '103',
    name: 'Ella Mountain Eco Cabana',
    type: 'eco-cabana',
    capacity: 4,
    basePrice: 45000,
    status: 'occupied',
    amenities: ['Natural Ventilation', 'Private Plunge Pool', 'Mountain View', 'Tea Station', 'Balcony'],
    floor: 'Garden Wing - Top View',
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
    amenities: ['AC', 'Dutch Antique Furnishing', 'Garden Patio', 'Bathtub', 'Free Wi-Fi'],
    floor: '1st Floor - Heritage Court',
  },
  {
    id: 'R105',
    number: '105',
    name: 'Bentota Luxury Royal Villa',
    type: 'villa',
    capacity: 6,
    basePrice: 75000,
    status: 'reserved',
    amenities: ['Private Chef', 'Infinity Pool', 'Butler Service', 'Beach Access', 'Jacuzzi', '3 Bedrooms'],
    floor: 'Beachfront - Villa 1',
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
    amenities: ['AC', 'Double Bed', 'Work Desk', 'En-suite Bathroom', 'TV'],
    floor: '2nd Floor - Hill View',
  },
  {
    id: 'R107',
    number: '107',
    name: 'Yala Safari Standard',
    type: 'standard',
    capacity: 2,
    basePrice: 18000,
    status: 'available',
    amenities: ['AC', 'Twin Beds', 'Garden View', 'Tea Station', 'Free Wi-Fi'],
    floor: 'Ground Floor - Jungle Path',
  },
  {
    id: 'R108',
    number: '108',
    name: 'Trinco Coral Deluxe',
    type: 'deluxe',
    capacity: 3,
    basePrice: 26000,
    status: 'available',
    amenities: ['AC', 'Balcony', 'Beach View', 'Mini Fridge', 'King Bed'],
    floor: '2nd Floor - Ocean Wing',
  },
  {
    id: 'R109',
    number: '109',
    name: 'Nuwara Eliya Tea Garden Suite',
    type: 'suite',
    capacity: 4,
    basePrice: 42000,
    status: 'occupied',
    amenities: ['Fireplace', 'Heated Bedding', 'Panoramic Tea Plantation View', 'Living Room', 'Bathtub'],
    floor: 'Top Floor - Highland Wing',
    currentGuest: 'Ayesha Jayawardena',
    checkOutDate: '2026-08-21',
  },
  {
    id: 'R110',
    number: '110',
    name: 'Arugam Bay Surf Cabana',
    type: 'ocean-view',
    capacity: 2,
    basePrice: 22000,
    status: 'available',
    amenities: ['Ceiling Fan', 'Direct Sand Access', 'Hammock Deck', 'Outdoor Shower'],
    floor: 'Beachfront - Surf Point',
  }
];

export const INITIAL_GUESTS = [
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
    notes: 'Frequent VIP guest. Prefers extra spicy Pol Sambol and hot Ginger Tea in the morning.',
    totalVisits: 5,
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
    notes: 'Honeymoon couple. Requested king coconut welcome drinks and quiet sunset terrace.',
    totalVisits: 2,
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
    notes: 'Family vacation (4 guests). Inquiring about Whale Watching in Mirissa.',
    totalVisits: 3,
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
    notes: 'Loves Egg Hoppers (Biththara Appa) and Kithul Pani with Buffalo Curd.',
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
    notes: 'Gluten sensitive. Prefers soy milk and fresh tropical fruit platter (Papaya & Pineapple).',
    totalVisits: 1,
  },
  {
    id: 'G006',
    name: 'Ayesha Jayawardena',
    phone: '+94 76 555 7890',
    email: 'ayesha.j@colombo.lk',
    idType: 'nic-new',
    idNumber: '199581400234',
    nationality: 'Sri Lankan',
    spicePreference: 'sri-lankan-hot',
    breakfastPreference: 'traditional-sl',
    notes: 'Corporate retreat organizer. High priority booking.',
    totalVisits: 6,
  },
  {
    id: 'G007',
    name: 'Yuki Tanaka',
    phone: '+81 90 1234 5678',
    email: 'yuki.tanaka@tokyo.jp',
    idType: 'passport',
    idNumber: 'TZ7788990',
    nationality: 'Japanese',
    spicePreference: 'mild',
    breakfastPreference: 'vegetarian',
    notes: 'Interested in Ceylon Cinnamon and Ayurvedic herbal spa treatments.',
    totalVisits: 2,
  }
];

export const INITIAL_BOOKINGS = [
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
    roomName: 'Ella Mountain Eco Cabana',
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
  },
  {
    id: 'BK-2026-005',
    guestId: 'G006',
    guestName: 'Ayesha Jayawardena',
    guestPhone: '+94 76 555 7890',
    roomId: 'R109',
    roomNumber: '109',
    roomName: 'Nuwara Eliya Tea Garden Suite',
    checkIn: '2026-08-18',
    checkOut: '2026-08-21',
    nights: 3,
    guestsCount: 3,
    baseRate: 42000,
    multiplier: 1.0,
    subtotal: 126000,
    taxTotal: 38430,
    grandTotal: 164430,
    status: 'checked-in',
    paymentStatus: 'paid',
    spicePreference: 'sri-lankan-hot',
    breakfastPreference: 'traditional-sl',
    createdAt: '2026-08-17',
  },
  {
    id: 'BK-2026-006',
    guestId: 'G007',
    guestName: 'Yuki Tanaka',
    guestPhone: '+81 90 1234 5678',
    roomId: 'R104',
    roomNumber: '104',
    roomName: 'Galle Heritage Deluxe',
    checkIn: '2026-08-20',
    checkOut: '2026-08-24',
    nights: 4,
    guestsCount: 2,
    baseRate: 24000,
    multiplier: 1.0,
    subtotal: 96000,
    taxTotal: 29280,
    grandTotal: 125280,
    status: 'confirmed',
    paymentStatus: 'pending',
    spicePreference: 'mild',
    breakfastPreference: 'vegetarian',
    createdAt: '2026-08-18',
  }
];

export const INITIAL_BILLS = [
  {
    id: 'INV-2026-001',
    bookingId: 'BK-2026-001',
    guestName: 'Kasun Perera',
    roomNumber: '101',
    date: '2026-08-16',
    items: [
      { description: 'Sigiriya Deluxe Suite (3 Nights)', amount: 114000 },
      { description: 'Traditional Sri Lankan Kiribath & Hoppers Buffet', amount: 6500 },
      { description: 'Fresh King Coconut Bar & Tropical Juices', amount: 2200 },
      { description: 'Ayurvedic Herbal Full Body Massage', amount: 12000 },
    ],
    subtotal: 134700,
    serviceCharge: 13470,
    vat: 26670.6,
    sscl: 3367.5,
    grandTotal: 178208.1,
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
      { description: 'Ella Mountain Eco Cabana (3 Nights)', amount: 135000 },
      { description: 'Ceylon Artisan Tea Tasting Experience', amount: 8000 },
      { description: 'Airport Luxury Transfer (Bandaranaike Intl)', amount: 18000 },
      { description: 'Galle Fort Heritage Guided Tour', amount: 15000 },
    ],
    subtotal: 176000,
    serviceCharge: 17600,
    vat: 34848,
    sscl: 4400,
    grandTotal: 232848,
    status: 'pending',
    paymentMethod: 'Unpaid',
  },
  {
    id: 'INV-2026-003',
    bookingId: 'BK-2026-004',
    guestName: 'Dilini Samarasinghe',
    roomNumber: '102',
    date: '2026-08-14',
    items: [
      { description: 'Mirissa Ocean Cabana (3 Nights)', amount: 84000 },
      { description: 'Southern Ocean Seafood BBQ Feast (Jumbo Prawns & Lobster)', amount: 18500 },
      { description: 'Kithul Treacle Curd & Dessert Bar', amount: 3500 },
    ],
    subtotal: 106000,
    serviceCharge: 10600,
    vat: 20988,
    sscl: 2650,
    grandTotal: 140238,
    status: 'paid',
    paymentMethod: 'Cash (LKR)',
  },
  {
    id: 'INV-2026-004',
    bookingId: 'BK-2026-005',
    guestName: 'Ayesha Jayawardena',
    roomNumber: '109',
    date: '2026-08-18',
    items: [
      { description: 'Nuwara Eliya Tea Garden Suite (3 Nights)', amount: 126000 },
      { description: 'Highland Fireplace Logs & Hot Chocolate Bar', amount: 4500 },
      { description: 'Private Dinner with Executive Chef', amount: 22000 },
    ],
    subtotal: 152500,
    serviceCharge: 15250,
    vat: 30195,
    sscl: 3812.5,
    grandTotal: 201757.5,
    status: 'paid',
    paymentMethod: 'Bank Transfer (Commercial Bank LK)',
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

  // Reset & Populate Demo Data
  const resetDemoData = () => {
    setRooms(INITIAL_ROOMS);
    setGuests(INITIAL_GUESTS);
    setBookings(INITIAL_BOOKINGS);
    setBills(INITIAL_BILLS);
    setTaxRates(TAX_RATES);
    localStorage.setItem('athithi_rooms', JSON.stringify(INITIAL_ROOMS));
    localStorage.setItem('athithi_guests', JSON.stringify(INITIAL_GUESTS));
    localStorage.setItem('athithi_bookings', JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem('athithi_bills', JSON.stringify(INITIAL_BILLS));
    localStorage.setItem('athithi_tax_rates', JSON.stringify(TAX_RATES));
    toast.success('✨ Fresh Demo Dataset Loaded Successfully!');
  };

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

    setRooms((prev) =>
      prev.map((r) =>
        r.id === bookingData.roomId
          ? { ...r, status: 'reserved', currentGuest: bookingData.guestName }
          : r
      )
    );

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
        resetDemoData,
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
