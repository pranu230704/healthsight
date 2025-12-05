const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');

// Get all doctors
router.get('/', protect, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single doctor
router.get('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new doctor
router.post('/', protect, async (req, res) => {
  try {
    const count = await Doctor.countDocuments();
    const doctorId = `DR${String(count + 1).padStart(6, '0')}`;
    
    const doctor = await Doctor.create({ ...req.body, doctorId });
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update doctor
router.put('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete doctor
router.delete('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
