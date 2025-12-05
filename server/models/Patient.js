const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
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
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  bloodType: String,
  allergies: [String],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String
  },
  medicalHistory: String,
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Discharged'],
    default: 'Active'
  },
  admissionDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patient', patientSchema);
