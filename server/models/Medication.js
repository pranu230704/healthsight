const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  medicationId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  genericName: String,
  category: {
    type: String,
    required: true
  },
  manufacturer: String,
  dosageForm: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Other']
  },
  strength: String,
  price: {
    type: Number,
    required: true
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  reorderLevel: {
    type: Number,
    default: 10
  },
  expiryDate: Date,
  description: String,
  sideEffects: [String],
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Medication', medicationSchema);
