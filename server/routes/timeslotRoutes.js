const express = require('express');
const {
  generateTimeSlots,
  getAvailableSlots,
  getCourtSlots,
  updateSlotAvailability,
  deleteTimeSlots
} = require('../controllers/timeslotController');

const { auth, requireOwner } = require('../middlewares/auth');

const router = express.Router();

// Public routes - get available slots
router.get('/court/:courtId/available', getAvailableSlots);

// Protected routes
router.use(auth);

// Owner only routes
router.post('/court/:courtId/generate', requireOwner, generateTimeSlots);
router.get('/court/:courtId/manage', requireOwner, getCourtSlots);
router.patch('/:slotId/availability', requireOwner, updateSlotAvailability);
router.delete('/court/:courtId/bulk-delete', requireOwner, deleteTimeSlots);

module.exports = router;
