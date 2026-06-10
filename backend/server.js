require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Routes
const authRoutes    = require('./routes/authRoutes');
const roomRoutes    = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const guestRoutes   = require('./routes/guestRoutes');
const billingRoutes = require('./routes/billingRoutes');

// ── Connect Database
connectDB();

const app = express();

// ── Security & Parsing Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🏨 Athithi HMS API is running.',
    env:     process.env.NODE_ENV || 'development',
    version: '1.0.0',
    time:    new Date().toISOString(),
  });
});

// ── Dashboard Stats (quick summary)
app.get('/api/dashboard/stats', require('./middleware/auth').protect, async (req, res, next) => {
  try {
    const Booking = require('./models/Booking');
    const Room    = require('./models/Room');
    const Guest   = require('./models/Guest');
    const Bill    = require('./models/Bill');

    const today = new Date();
    const start = new Date(today); start.setHours(0, 0, 0, 0);
    const end   = new Date(today); end.setHours(23, 59, 59, 999);

    const [
      totalRooms, availableRooms, occupiedRooms,
      totalGuests, totalBookings, activeBookings,
      checkInsToday, checkOutsToday,
      todayRevenue,
    ] = await Promise.all([
      Room.countDocuments({ isActive: true }),
      Room.countDocuments({ status: 'available', isActive: true }),
      Room.countDocuments({ status: 'occupied',  isActive: true }),
      Guest.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['checked-in', 'confirmed'] } }),
      Booking.countDocuments({ checkIn: { $gte: start, $lte: end } }),
      Booking.countDocuments({ checkOut: { $gte: start, $lte: end }, status: 'checked-out' }),
      Bill.aggregate([
        { $match: { issuedAt: { $gte: start, $lte: end }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalLKR' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        rooms:    { total: totalRooms, available: availableRooms, occupied: occupiedRooms },
        guests:   { total: totalGuests },
        bookings: { total: totalBookings, active: activeBookings, checkInsToday, checkOutsToday },
        revenue:  { today: todayRevenue[0]?.total || 0 },
        occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      },
    });
  } catch (err) { next(err); }
});

// ── API Routes
app.use('/api/auth',     authRoutes);
app.use('/api/rooms',    roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/guests',   guestRoutes);
app.use('/api/billing',  billingRoutes);

// ── 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ── Global Error Handler (must be last)
app.use(errorHandler);

// ── Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🏨  Athithi HMS API running on port ${PORT}`);
  console.log(`🔗  http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
