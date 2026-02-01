const express = require('express');
const {
  createBooking,
  confirmPayment,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getCourtBookings,
  completeBooking
} = require('../controllers/bookingController');

const { auth, requireOwner } = require('../middlewares/auth');

const router = express.Router();

// All booking routes require authentication
router.use(auth);

// Player routes
router.post('/', createBooking);                           // Create booking
router.post('/:bookingId/confirm-payment', confirmPayment); // Confirm payment
router.get('/my-bookings', getUserBookings);                // Get user's bookings
router.get('/:bookingId', getBookingById);                  // Get booking details
router.put('/:bookingId/cancel', cancelBooking);            // Cancel booking

// Owner routes
router.get('/court/:courtId/bookings', requireOwner, getCourtBookings); // Get court bookings
router.patch('/:bookingId/complete', requireOwner, completeBooking);     // Mark as completed

module.exports = router;
