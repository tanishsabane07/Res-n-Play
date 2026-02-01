const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // "09:00"
    required: true
  },
  endTime: {
    type: String, // "10:00"
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    required: true
  },
  unavailabilityReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate slots
timeSlotSchema.index({ court: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);