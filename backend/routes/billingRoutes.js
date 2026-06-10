const express     = require('express');
const router      = express.Router();
const billCtrl    = require('../controllers/billingController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/booking/:bookingId',  billCtrl.getBillForBooking);
router.post('/generate/:bookingId', billCtrl.generateBill);

router.post('/:billId/items',        billCtrl.addLineItem);
router.delete('/:billId/items/:index', restrictTo('admin', 'manager'), billCtrl.removeLineItem);

router.patch('/:billId/pay',         billCtrl.markPaid);
router.get('/:billId/invoice',       billCtrl.getInvoice);

module.exports = router;
