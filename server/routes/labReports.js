const express = require('express');
const router = express.Router();
const LabReport = require('../models/LabReport');
const { protect } = require('../middleware/auth');

// Get all lab reports
router.get('/', protect, async (req, res) => {
  try {
    const labReports = await LabReport.find()
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .sort({ testDate: -1 });
    res.json({ success: true, count: labReports.length, data: labReports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single lab report
router.get('/:id', protect, async (req, res) => {
  try {
    const labReport = await LabReport.findById(req.params.id)
      .populate('patient')
      .populate('doctor');
    if (!labReport) {
      return res.status(404).json({ success: false, message: 'Lab report not found' });
    }
    res.json({ success: true, data: labReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new lab report
router.post('/', protect, async (req, res) => {
  try {
    const count = await LabReport.countDocuments();
    const reportId = `LAB${String(count + 1).padStart(6, '0')}`;
    
    const labReport = await LabReport.create({ ...req.body, reportId });
    res.status(201).json({ success: true, data: labReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update lab report
router.put('/:id', protect, async (req, res) => {
  try {
    const labReport = await LabReport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!labReport) {
      return res.status(404).json({ success: false, message: 'Lab report not found' });
    }
    
    res.json({ success: true, data: labReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete lab report
router.delete('/:id', protect, async (req, res) => {
  try {
    const labReport = await LabReport.findByIdAndDelete(req.params.id);
    
    if (!labReport) {
      return res.status(404).json({ success: false, message: 'Lab report not found' });
    }
    
    res.json({ success: true, message: 'Lab report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
