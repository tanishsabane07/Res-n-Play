const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  description: String,
  amenities: [String], // ['parking', 'restroom', 'water', 'equipment']
  pricePerHour: {
    type: Number,
    required: true,
    min: 0
  },
  images: [String], // URLs to court images
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    monday: { start: String, end: String }, // "09:00", "22:00"
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Court', courtSchema);