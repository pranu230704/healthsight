const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const Medication = require('../models/Medication');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Get counts
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });
    
    // Get active patients
    const activePatients = await Patient.countDocuments({ status: 'Active' });
    
    // Get revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenueData = await Billing.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: 'Paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const revenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    // Get pending bills
    const pendingBills = await Billing.countDocuments({ paymentStatus: 'Pending' });
    
    // Get low stock medications
    const lowStockMeds = await Medication.countDocuments({
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] }
    });
    
    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        activePatients,
        revenue,
        pendingBills,
        lowStockMeds,
        recentAppointments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
