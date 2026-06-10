const express = require('express');
const router  = express.Router();
const roomCtrl = require('../controllers/roomController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect); // All room routes require auth

router.get('/',                      roomCtrl.getAllRooms);
router.get('/:id',                   roomCtrl.getRoomById);
router.get('/:id/availability',      roomCtrl.checkAvailability);

router.post('/',  restrictTo('admin', 'manager'), roomCtrl.createRoom);
router.put('/:id', restrictTo('admin', 'manager'), roomCtrl.updateRoom);
router.delete('/:id', restrictTo('admin'),          roomCtrl.deleteRoom);

module.exports = router;
