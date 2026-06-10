const express  = require('express');
const router   = express.Router();
const bookCtrl = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/today',   bookCtrl.getTodayBookings);
router.get('/',        bookCtrl.getAllBookings);
router.get('/:id',     bookCtrl.getBookingById);
router.post('/',       bookCtrl.createBooking);
router.put('/:id',     bookCtrl.updateBooking);

router.patch('/:id/confirm',  restrictTo('admin', 'manager', 'receptionist'), bookCtrl.confirmBooking);
router.patch('/:id/checkin',  restrictTo('admin', 'manager', 'receptionist'), bookCtrl.checkIn);
router.patch('/:id/checkout', restrictTo('admin', 'manager', 'receptionist'), bookCtrl.checkOut);
router.patch('/:id/cancel',   restrictTo('admin', 'manager'),                 bookCtrl.cancelBooking);

module.exports = router;
