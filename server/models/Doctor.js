const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  department: String,
  phone: String,
  email: String,
  qualifications: [String],
  experience: Number,
  consultationFee: Number,
  availableDays: [String],
  availableHours: {
    start: String,
    end: String
  },
  status: {
    type: String,
    enum: ['Available', 'On Leave', 'Busy'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
