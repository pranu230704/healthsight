const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const { protect } = require('../middleware/auth');

// Get all medications
router.get('/', protect, async (req, res) => {
  try {
    const medications = await Medication.find().sort({ createdAt: -1 });
    res.json({ success: true, count: medications.length, data: medications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single medication
router.get('/:id', protect, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    res.json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new medication
router.post('/', protect, async (req, res) => {
  try {
    const count = await Medication.countDocuments();
    const medicationId = `MED${String(count + 1).padStart(6, '0')}`;
    
    const medication = await Medication.create({ ...req.body, medicationId });
    res.status(201).json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update medication
router.put('/:id', protect, async (req, res) => {
  try {
    const medication = await Medication.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    
    res.json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete medication
router.delete('/:id', protect, async (req, res) => {
  try {
    const medication = await Medication.findByIdAndDelete(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    
    res.json({ success: true, message: 'Medication deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
