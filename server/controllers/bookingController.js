const Booking = require('../models/bookings');
const TimeSlot = require('../models/timeslots');
const Court = require('../models/courts');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { courtId, timeSlotId, notes } = req.body;

    // Validate required fields
    if (!courtId || !timeSlotId) {
      return res.status(400).json({ message: 'Court ID and Time Slot ID are required' });
    }

    // Check if time slot exists and is available
    const timeSlot = await TimeSlot.findById(timeSlotId).populate('court');
    
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    if (!timeSlot.isAvailable) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    // Check if court matches
    if (timeSlot.court._id.toString() !== courtId) {
      return res.status(400).json({ message: 'Time slot does not belong to this court' });
    }

    // Check if booking is for future date
    const slotDate = new Date(timeSlot.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (slotDate < today) {
      return res.status(400).json({ message: 'Cannot book past dates' });
    }

    // Prevent owner from booking their own court
    if (timeSlot.court.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Court owners cannot book their own courts' });
    }

    // Create booking
    const newBooking = new Booking({
      user: req.user._id,
      court: courtId,
      timeSlot: timeSlotId,
      playDate: timeSlot.date,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      totalAmount: timeSlot.price,
      status: 'pending',
      paymentStatus: 'pending',
      notes: notes || ''
    });

    await newBooking.save();

    // Mark time slot as unavailable (reserved during payment)
    timeSlot.isAvailable = false;
    await timeSlot.save();

    // Populate booking details
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('user', 'name email phone')
      .populate('court', 'name location pricePerHour')
      .populate('timeSlot');

    res.status(201).json({
      message: 'Booking created successfully. Please proceed with payment.',
      booking: populatedBooking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Confirm payment and finalize booking
const confirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentId, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('timeSlot')
      .populate('court', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify booking belongs to user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if already confirmed
    if (booking.status === 'confirmed') {
      return res.status(400).json({ message: 'Booking already confirmed' });
    }

    // Update booking status
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentId = paymentId;
    booking.paymentMethod = paymentMethod;

    await booking.save();

    const confirmedBooking = await Booking.findById(bookingId)
      .populate('user', 'name email phone')
      .populate('court', 'name location')
      .populate('timeSlot');

    res.json({
      message: 'Payment confirmed! Booking successful.',
      booking: confirmedBooking
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    // Build filter
    const filter = { user: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (upcoming === 'true') {
      filter.playDate = { $gte: new Date() };
    }

    const bookings = await Booking.find(filter)
      .populate('court', 'name location pricePerHour')
      .populate('timeSlot')
      .sort({ playDate: -1, startTime: -1 });

    res.json({
      totalBookings: bookings.length,
      bookings
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email phone')
      .populate('court', 'name location pricePerHour amenities')
      .populate('timeSlot');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization (user or court owner)
    const isOwner = await Court.findOne({ 
      _id: booking.court._id, 
      owner: req.user._id 
    });

    if (booking.user._id.toString() !== req.user._id.toString() && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json({ booking });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId).populate('timeSlot');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify booking belongs to user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking is already cancelled or completed
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    // Check cancellation policy (e.g., at least 2 hours before)
    const bookingDateTime = new Date(booking.playDate);
    const [hours, minutes] = booking.startTime.split(':');
    bookingDateTime.setHours(hours, minutes);

    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilBooking < 2) {
      return res.status(400).json({ 
        message: 'Cannot cancel booking less than 2 hours before start time' 
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'User cancelled';
    booking.cancelledAt = new Date();

    // If payment was made, mark for refund
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }

    await booking.save();

    // Make time slot available again
    if (booking.timeSlot) {
      await TimeSlot.findByIdAndUpdate(booking.timeSlot._id, { isAvailable: true });
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get bookings for court owner
const getCourtBookings = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { status, date } = req.query;

    // Verify court ownership
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    if (court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these bookings' });
    }

    // Build filter
    const filter = { court: courtId };

    if (status) {
      filter.status = status;
    }

    if (date) {
      const queryDate = new Date(date);
      filter.playDate = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lte: new Date(queryDate.setHours(23, 59, 59, 999))
      };
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('timeSlot')
      .sort({ playDate: 1, startTime: 1 });

    res.json({
      courtId,
      totalBookings: bookings.length,
      bookings
    });

  } catch (error) {
    console.error('Get court bookings error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Mark booking as completed (after play date)
const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate('court');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify court ownership
    if (booking.court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if booking date has passed
    const playDateTime = new Date(booking.playDate);
    const [hours, minutes] = booking.endTime.split(':');
    playDateTime.setHours(hours, minutes);

    if (playDateTime > new Date()) {
      return res.status(400).json({ message: 'Cannot complete booking before play time ends' });
    }

    booking.status = 'completed';
    await booking.save();

    res.json({
      message: 'Booking marked as completed',
      booking
    });

  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createBooking,
  confirmPayment,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getCourtBookings,
  completeBooking
};
