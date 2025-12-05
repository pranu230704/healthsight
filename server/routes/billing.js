const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const { protect } = require('../middleware/auth');

// Get all billing records
router.get('/', protect, async (req, res) => {
  try {
    const billings = await Billing.find()
      .populate('patient', 'firstName lastName patientId')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: billings.length, data: billings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single billing record
router.get('/:id', protect, async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id).populate('patient');
    if (!billing) {
      return res.status(404).json({ success: false, message: 'Billing record not found' });
    }
    res.json({ success: true, data: billing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new billing record
router.post('/', protect, async (req, res) => {
  try {
    const count = await Billing.countDocuments();
    const invoiceId = `INV${String(count + 1).padStart(6, '0')}`;
    
    const billing = await Billing.create({ ...req.body, invoiceId });
    res.status(201).json({ success: true, data: billing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update billing record
router.put('/:id', protect, async (req, res) => {
  try {
    const billing = await Billing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!billing) {
      return res.status(404).json({ success: false, message: 'Billing record not found' });
    }
    
    res.json({ success: true, data: billing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete billing record
router.delete('/:id', protect, async (req, res) => {
  try {
    const billing = await Billing.findByIdAndDelete(req.params.id);
    
    if (!billing) {
      return res.status(404).json({ success: false, message: 'Billing record not found' });
    }
    
    res.json({ success: true, message: 'Billing record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
