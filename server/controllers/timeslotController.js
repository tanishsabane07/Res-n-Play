const TimeSlot = require('../models/timeslots');
const Court = require('../models/courts');
const Booking = require('../models/bookings');

// Generate time slots for a court for a specific date range
const generateTimeSlots = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { startDate, endDate, slotDuration = 60 } = req.body;

    console.log('Generate slots request:', { courtId, startDate, endDate, slotDuration });

    // Validate court ownership
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    console.log('Court operating hours:', court.operatingHours);

    if (court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage this court' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const generatedSlots = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      console.log('Processing day:', dayName, 'for date:', currentDate.toISOString().split('T')[0]);
      
      // Handle both day-specific and general operating hours formats
      let operatingHours = null;
      
      if (court.operatingHours && court.operatingHours[dayName]) {
        // Day-specific format: { monday: { start: "09:00", end: "22:00" } }
        operatingHours = court.operatingHours[dayName];
        console.log('Using day-specific hours:', operatingHours);
      } else if (court.operatingHours && court.operatingHours.start && court.operatingHours.end) {
        // General format: { start: "09:00", end: "22:00" }
        operatingHours = court.operatingHours;
        console.log('Using general hours:', operatingHours);
      }

      if (operatingHours && operatingHours.start && operatingHours.end) {
        const daySlots = await generateDaySlots(court, currentDate, operatingHours, slotDuration);
        generatedSlots.push(...daySlots);
        console.log(`Generated ${daySlots.length} slots for ${dayName}`);
      } else {
        console.log(`No operating hours for ${dayName}`);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Total generated slots: ${generatedSlots.length}`);

    res.status(201).json({
      message: `Generated ${generatedSlots.length} time slots`,
      generatedSlots: generatedSlots.length,
      slots: generatedSlots
    });

  } catch (error) {
    console.error('Generate slots error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Helper function to generate slots for a single day
const generateDaySlots = async (court, date, operatingHours, slotDuration = 60) => {
  const slots = [];
  const startHour = parseInt(operatingHours.start.split(':')[0]);
  const startMinute = parseInt(operatingHours.start.split(':')[1]);
  const endHour = parseInt(operatingHours.end.split(':')[0]);
  const endMinute = parseInt(operatingHours.end.split(':')[1]);

  let currentHour = startHour;
  let currentMinute = startMinute;

  console.log(`Generating slots from ${startHour}:${startMinute} to ${endHour}:${endMinute} with ${slotDuration} minute duration`);

  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Calculate end time based on slot duration
    let nextMinutes = currentHour * 60 + currentMinute + slotDuration;
    let nextHour = Math.floor(nextMinutes / 60);
    let nextMinute = nextMinutes % 60;
    
    // Check if slot would exceed operating hours
    if (nextHour > endHour || (nextHour === endHour && nextMinute > endMinute)) {
      console.log(`Slot would exceed operating hours: ${nextHour}:${nextMinute}`);
      break;
    }

    const endTime = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;

    console.log(`Creating slot: ${startTime} - ${endTime}`);

    // Check if slot already exists
    const existingSlot = await TimeSlot.findOne({
      court: court._id,
      date: date,
      startTime: startTime
    });

    if (!existingSlot) {
      const newSlot = new TimeSlot({
        court: court._id,
        date: new Date(date),
        startTime: startTime,
        endTime: endTime,
        price: court.pricePerHour,
        isAvailable: true
      });

      await newSlot.save();
      slots.push(newSlot);
      console.log(`Created slot: ${startTime} - ${endTime}`);
    } else {
      console.log(`Slot already exists: ${startTime} - ${endTime}`);
    }

    // Move to next slot
    currentHour = nextHour;
    currentMinute = nextMinute;
  }

  return slots;
};

// Get available slots for a court for a specific date range
const getAvailableSlots = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { startDate, endDate, date } = req.query;

    let start, end;

    if (date) {
      // If single date is provided, get slots for that day only
      start = new Date(date);
      end = new Date(date);
      end.setHours(23, 59, 59, 999); // End of the day
    } else {
      // Default to date range if startDate/endDate provided, or next 7 days
      start = startDate ? new Date(startDate) : new Date();
      end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    console.log('Fetching available slots for court:', courtId, 'from', start, 'to', end);

    const slots = await TimeSlot.find({
      court: courtId,
      date: { $gte: start, $lte: end },
      isAvailable: true
    })
    .populate('court', 'name pricePerHour location')
    .sort({ date: 1, startTime: 1 });

    console.log('Found slots:', slots.length);

    res.json({
      courtId,
      dateRange: { startDate: start, endDate: end },
      totalSlots: slots.length,
      timeSlots: slots // Changed from slotsByDate to timeSlots to match frontend expectation
    });

  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all slots for a court (for owners to manage)
const getCourtSlots = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { startDate, endDate, status } = req.query;

    console.log('Getting court slots for:', { courtId, startDate, endDate, status });

    // Verify court ownership
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    if (court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this court\'s slots' });
    }

    // Build filter
    const filter = { court: courtId };
    
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (status === 'available') {
      filter.isAvailable = true;
    } else if (status === 'booked') {
      filter.isAvailable = false;
    }

    console.log('Filter for slots:', filter);

    const slots = await TimeSlot.find(filter)
      .populate({
        path: 'court',
        select: 'name pricePerHour'
      })
      .sort({ date: 1, startTime: 1 });

    console.log('Found slots:', slots.length);

    // If slot is booked, get booking details
    const slotsWithBookings = await Promise.all(
      slots.map(async (slot) => {
        if (!slot.isAvailable) {
          const booking = await Booking.findOne({ timeSlot: slot._id })
            .populate('user', 'name email phone');
          return { ...slot.toObject(), booking, isBooked: true };
        }
        return { ...slot.toObject(), isBooked: false };
      })
    );

    const response = {
      courtId,
      totalSlots: slots.length,
      timeSlots: slotsWithBookings  // Changed from 'slots' to 'timeSlots'
    };

    console.log('Sending response:', response);

    res.json(response);

  } catch (error) {
    console.error('Get court slots error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update slot availability (for maintenance, etc.)
const updateSlotAvailability = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { isAvailable, reason } = req.body;

    const slot = await TimeSlot.findById(slotId).populate('court');
    
    if (!slot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    // Verify court ownership
    if (slot.court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this slot' });
    }

    // Don't allow making booked slots available
    if (!slot.isAvailable && isAvailable) {
      const booking = await Booking.findOne({ timeSlot: slotId, status: { $ne: 'cancelled' } });
      if (booking) {
        return res.status(400).json({ message: 'Cannot make booked slot available' });
      }
    }

    slot.isAvailable = isAvailable;
    if (reason) {
      slot.unavailabilityReason = reason;
    }

    await slot.save();

    res.json({
      message: 'Slot availability updated successfully',
      slot
    });

  } catch (error) {
    console.error('Update slot availability error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete time slots (bulk delete for date range)
const deleteTimeSlots = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { startDate, endDate } = req.query; // Changed from req.body to req.query

    console.log('Deleting slots for court:', courtId, 'from', startDate, 'to', endDate);

    // Verify court ownership
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    if (court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete slots for this court' });
    }

    // Find slots to delete (only available ones)
    const filter = {
      court: courtId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      isAvailable: true
    };

    console.log('Delete filter:', filter);

    const deletedSlots = await TimeSlot.deleteMany(filter);

    console.log('Deleted slots result:', deletedSlots);

    res.json({
      message: `Deleted ${deletedSlots.deletedCount} available time slots`,
      deletedSlots: deletedSlots.deletedCount
    });

  } catch (error) {
    console.error('Delete time slots error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  generateTimeSlots,
  getAvailableSlots,
  getCourtSlots,
  updateSlotAvailability,
  deleteTimeSlots
};
