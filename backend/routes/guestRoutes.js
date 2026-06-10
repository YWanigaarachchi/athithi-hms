const express    = require('express');
const router     = express.Router();
const guestCtrl  = require('../controllers/guestController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/search',        guestCtrl.searchGuests);
router.get('/',              guestCtrl.getAllGuests);
router.get('/:id',           guestCtrl.getGuestById);
router.post('/',             guestCtrl.createGuest);
router.post('/validate-nic', guestCtrl.validateNICEndpoint);
router.put('/:id',           guestCtrl.updateGuest);
router.delete('/:id', restrictTo('admin', 'manager'), guestCtrl.deleteGuest);

module.exports = router;
