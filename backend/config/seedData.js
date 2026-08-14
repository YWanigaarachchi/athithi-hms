const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Booking = require('../models/Booking');
const Bill = require('../models/Bill');
const { calcRoomPrice } = require('../services/pricingService');

async function seedDatabase() {
  try {
    console.log('🌱 Checking seed data...');

    // 1. Seed Staff User
    let staffUser = await User.findOne({ email: 'staff@hotel.lk' });
    if (!staffUser) {
      staffUser = await User.create({
        name: 'Athithi Staff',
        email: 'staff@hotel.lk',
        password: 'password123',
        role: 'admin',
      });
      console.log('✅ Admin user created: staff@hotel.lk / password123');
    }

    // 2. Seed Rooms if empty
    const roomCount = await Room.countDocuments();
    let rooms = [];
    if (roomCount === 0) {
      rooms = await Room.insertMany([
        {
          number: '101',
          name: 'Mirissa Ocean Suite',
          type: 'ocean-view',
          basePrice: 38000,
          capacity: 2,
          floor: 1,
          view: 'Mirissa Sunset Ocean View',
          amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Ocean View', 'Balcony', 'Bathtub'],
          status: 'occupied',
          description: 'Spacious ocean-facing luxury suite with panoramic Indian Ocean balcony view.',
        },
        {
          number: '102',
          name: 'Sigiriya Garden Cabana',
          type: 'eco-cabana',
          basePrice: 24000,
          capacity: 2,
          floor: 1,
          view: 'Lush Tropical Botanical Garden',
          amenities: ['WiFi', 'Air Conditioning', 'Plunge Pool', 'Balcony'],
          status: 'available',
          description: 'Eco-friendly sustainable cabana nestled in spice trees with private plunge pool.',
        },
        {
          number: '201',
          name: 'Ella Mountain Haven',
          type: 'deluxe',
          basePrice: 28000,
          capacity: 3,
          floor: 2,
          view: 'Ella Rock & Tea Valley',
          amenities: ['WiFi', 'Air Conditioning', 'Balcony', 'Room Service'],
          status: 'reserved',
          description: 'Cool mountain breeze room with breathtaking view of mist-covered tea plantations.',
        },
        {
          number: '202',
          name: 'Ceylon Heritage Standard',
          type: 'standard',
          basePrice: 16000,
          capacity: 2,
          floor: 2,
          view: 'Courtyard View',
          amenities: ['WiFi', 'Air Conditioning'],
          status: 'available',
          description: 'Comfortable air-conditioned classic room with traditional timber furnishing.',
        },
        {
          number: '301',
          name: 'Royal Sri Lankan Villa',
          type: 'villa',
          basePrice: 95000,
          capacity: 6,
          floor: 3,
          view: '360 Panoramic Ocean & Mountains',
          amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Ocean View', 'Balcony', 'Room Service', 'Bathtub', 'Plunge Pool'],
          status: 'available',
          description: 'Private 3-bedroom luxury villa with dedicated butler service and private infinity pool.',
        },
        {
          number: '302',
          name: 'Kandy Lake Deluxe Suite',
          type: 'suite',
          basePrice: 45000,
          capacity: 4,
          floor: 3,
          view: 'Lake & Temple Vista',
          amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Bathtub'],
          status: 'available',
          description: 'Refined suite featuring hand-carved Kandyan brass decor and luxury jacuzzi bath.',
        },
      ]);
      console.log(`✅ Seeded ${rooms.length} Sri Lankan styled rooms.`);
    } else {
      rooms = await Room.find();
    }

    // 3. Seed Guests if empty
    const guestCount = await Guest.countDocuments();
    let guests = [];
    if (guestCount === 0) {
      guests = await Guest.insertMany([
        {
          firstName: 'Kasun',
          lastName: 'Perera',
          email: 'kasun.perera@gmail.com',
          phone: '+94 77 123 4567',
          nationality: 'Sri Lankan',
          country: 'Sri Lanka',
          address: '45 Havelock Road, Colombo 05',
          nicType: 'nic-old',
          nicNumber: '881234567V',
          spiceTolerance: 'sri-lankan-hot',
          breakfastPreference: 'traditional-sl',
          dietaryRestrictions: ['Spicy food lover'],
          driver: {
            name: 'Sunil Shantha',
            contactNumber: '+94 71 987 6543',
            vehiclePlateNumber: 'WP CAB-4521',
            requiresAccommodation: true,
            requiresMealPlan: true,
          },
          vipLevel: 'gold',
          createdBy: staffUser._id,
        },
        {
          firstName: 'Amanda',
          lastName: 'Silva',
          email: 'amanda.s@outlook.com',
          phone: '+94 76 555 1234',
          nationality: 'Sri Lankan',
          country: 'Sri Lanka',
          address: '12 Beach Road, Mount Lavinia',
          nicType: 'nic-new',
          nicNumber: '199556789012',
          spiceTolerance: 'medium',
          breakfastPreference: 'traditional-sl',
          dietaryRestrictions: ['Vegetarian on Poya days'],
          driver: {
            name: '',
            contactNumber: '',
            vehiclePlateNumber: '',
            requiresAccommodation: false,
            requiresMealPlan: false,
          },
          vipLevel: 'silver',
          createdBy: staffUser._id,
        },
        {
          firstName: 'Liam',
          lastName: 'Smith',
          email: 'liam.smith@uktravel.co.uk',
          phone: '+44 7911 123456',
          nationality: 'British',
          country: 'United Kingdom',
          address: '14 Baker Street, London',
          nicType: 'passport',
          nicNumber: 'GB98765432',
          spiceTolerance: 'mild',
          breakfastPreference: 'english',
          dietaryRestrictions: ['Gluten-free'],
          driver: {
            name: 'Mahesh Kumara',
            contactNumber: '+94 77 222 3344',
            vehiclePlateNumber: 'WP CAR-8899',
            requiresAccommodation: true,
            requiresMealPlan: false,
          },
          vipLevel: 'platinum',
          createdBy: staffUser._id,
        },
        {
          firstName: 'Nimalka',
          lastName: 'Jayawardena',
          email: 'nimalka.j@yahoo.com',
          phone: '+94 70 333 4455',
          nationality: 'Sri Lankan',
          country: 'Sri Lanka',
          address: '89 Peradeniya Road, Kandy',
          nicType: 'nic-old',
          nicNumber: '927891234V',
          spiceTolerance: 'hot',
          breakfastPreference: 'vegetarian',
          vipLevel: 'none',
          createdBy: staffUser._id,
        },
      ]);
      console.log(`✅ Seeded ${guests.length} guest profiles with SL preferences & driver info.`);
    } else {
      guests = await Guest.find();
    }

    // 4. Seed Bookings & Bills if empty
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0 && rooms.length > 0 && guests.length > 0) {
      const today = new Date();
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const in3Days = new Date(today); in3Days.setDate(in3Days.getDate() + 3);
      const in5Days = new Date(today); in5Days.setDate(in5Days.getDate() + 5);

      // Booking 1: Checked-in currently in Room 101
      const price1 = calcRoomPrice(rooms[0].basePrice, yesterday, tomorrow);
      const booking1 = await Booking.create({
        guestId: guests[0]._id,
        roomId: rooms[0]._id,
        checkIn: yesterday,
        checkOut: tomorrow,
        nights: price1.nights,
        adults: 2,
        children: 0,
        status: 'checked-in',
        basePricePerNight: rooms[0].basePrice,
        seasonMultiplier: price1.multiplier,
        seasonName: price1.season,
        pricePerNight: price1.pricePerNight,
        roomSubtotal: price1.subtotal,
        finalPrice: price1.subtotal * 1.305, // approximate with taxes
        currency: 'LKR',
        source: 'online',
        specialNotes: 'Prefers extra spicy pol sambol with breakfast.',
        checkedInAt: yesterday,
        createdBy: staffUser._id,
      });

      // Bill for Booking 1
      const bill1 = new Bill({
        bookingId: booking1._id,
        guestId: guests[0]._id,
        lineItems: [
          { description: `Room Stay: ${rooms[0].name} (${price1.nights} nights)`, type: 'room', amount: price1.subtotal, quantity: price1.nights, unitPrice: price1.pricePerNight },
          { description: 'Traditional Sri Lankan Breakfast & Fresh King Coconuts', type: 'fb', amount: 4800, quantity: 2, unitPrice: 2400 },
          { description: 'Mirissa Sunset Whale Watching Excursion', type: 'extra', amount: 18000, quantity: 2, unitPrice: 9000 },
        ],
        paymentStatus: 'pending',
        currency: 'LKR',
        createdBy: staffUser._id,
      });
      await bill1.save();

      // Booking 2: Confirmed upcoming in Room 201
      const price2 = calcRoomPrice(rooms[2].basePrice, tomorrow, in3Days);
      const booking2 = await Booking.create({
        guestId: guests[1]._id,
        roomId: rooms[2]._id,
        checkIn: tomorrow,
        checkOut: in3Days,
        nights: price2.nights,
        adults: 2,
        children: 1,
        status: 'confirmed',
        basePricePerNight: rooms[2].basePrice,
        seasonMultiplier: price2.multiplier,
        seasonName: price2.season,
        pricePerNight: price2.pricePerNight,
        roomSubtotal: price2.subtotal,
        finalPrice: price2.subtotal * 1.305,
        currency: 'LKR',
        source: 'phone',
        confirmedAt: today,
        createdBy: staffUser._id,
      });

      // Bill for Booking 2
      const bill2 = new Bill({
        bookingId: booking2._id,
        guestId: guests[1]._id,
        lineItems: [
          { description: `Room Stay: ${rooms[2].name} (${price2.nights} nights)`, type: 'room', amount: price2.subtotal, quantity: price2.nights, unitPrice: price2.pricePerNight },
        ],
        paymentStatus: 'pending',
        currency: 'LKR',
        createdBy: staffUser._id,
      });
      await bill2.save();

      // Booking 3: Checked-out past in Room 102 (Paid bill)
      const pastStart = new Date(today); pastStart.setDate(pastStart.getDate() - 5);
      const pastEnd = new Date(today); pastEnd.setDate(pastEnd.getDate() - 2);
      const price3 = calcRoomPrice(rooms[1].basePrice, pastStart, pastEnd);
      const booking3 = await Booking.create({
        guestId: guests[2]._id,
        roomId: rooms[1]._id,
        checkIn: pastStart,
        checkOut: pastEnd,
        nights: price3.nights,
        adults: 2,
        children: 0,
        status: 'checked-out',
        basePricePerNight: rooms[1].basePrice,
        seasonMultiplier: price3.multiplier,
        seasonName: price3.season,
        pricePerNight: price3.pricePerNight,
        roomSubtotal: price3.subtotal,
        finalPrice: price3.subtotal * 1.305,
        currency: 'USD',
        exchangeRate: 320,
        source: 'agent',
        checkedInAt: pastStart,
        checkedOutAt: pastEnd,
        createdBy: staffUser._id,
      });

      // Bill for Booking 3 (Paid)
      const bill3 = new Bill({
        bookingId: booking3._id,
        guestId: guests[2]._id,
        lineItems: [
          { description: `Room Stay: ${rooms[1].name} (${price3.nights} nights)`, type: 'room', amount: price3.subtotal, quantity: price3.nights, unitPrice: price3.pricePerNight },
          { description: 'Ceylon Tea Tasting & Organic Garden Tour', type: 'extra', amount: 8000, quantity: 2, unitPrice: 4000 },
          { description: 'Dinner: Fresh Ocean Fish Curry & Lion Lager', type: 'fb', amount: 9500, quantity: 1, unitPrice: 9500 },
        ],
        paymentStatus: 'paid',
        paymentMethod: 'card',
        paidAt: pastEnd,
        paidAmount: 98000,
        currency: 'LKR',
        createdBy: staffUser._id,
      });
      await bill3.save();

      console.log('✅ Seeded 3 reservations with statutory invoices & billing lines.');
    }
  } catch (error) {
    console.error('⚠️ Error seeding database:', error.message);
  }
}

module.exports = { seedDatabase };
