const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: true
  },
  timeSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  playDate: {
    type: Date,
    required: true
  },
  startTime: String,
  endTime: String,
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String, // For payment gateway integration
  paymentMethod: String, // 'card', 'upi', 'netbanking', etc.
  notes: String,
  cancellationReason: String,
  cancelledAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);