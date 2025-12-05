const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  testType: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG', 'Other'],
    required: true
  },
  testDate: {
    type: Date,
    required: true
  },
  results: {
    type: String,
    required: true
  },
  normalRange: String,
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Abnormal', 'Normal'],
    default: 'Pending'
  },
  technician: String,
  notes: String,
  attachments: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LabReport', labReportSchema);
