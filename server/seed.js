const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Billing = require('./models/Billing');
const Medication = require('./models/Medication');
const LabReport = require('./models/LabReport');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Demo data
const users = [
  {
    username: 'admin',
    email: 'admin@healthsight.com',
    password: 'admin123',
    fullName: 'Admin User',
    role: 'admin',
    phone: '555-0100',
    department: 'Administration'
  },
  {
    username: 'doctor',
    email: 'doctor@healthsight.com',
    password: 'doctor123',
    fullName: 'Dr. Sarah Johnson',
    role: 'doctor',
    phone: '555-0101',
    department: 'Cardiology'
  },
  {
    username: 'staff',
    email: 'staff@healthsight.com',
    password: 'staff123',
    fullName: 'Staff Member',
    role: 'staff',
    phone: '555-0102',
    department: 'Reception'
  }
];

const doctors = [
  {
    doctorId: 'DR000001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    specialization: 'Cardiology',
    department: 'Cardiology',
    phone: '555-0101',
    email: 'sarah.johnson@healthsight.com',
    qualifications: ['MD', 'FACC'],
    experience: 15,
    consultationFee: 200,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableHours: { start: '09:00', end: '17:00' },
    status: 'Available'
  },
  {
    doctorId: 'DR000002',
    firstName: 'Michael',
    lastName: 'Chen',
    specialization: 'Neurology',
    department: 'Neurology',
    phone: '555-0103',
    email: 'michael.chen@healthsight.com',
    qualifications: ['MD', 'PhD'],
    experience: 12,
    consultationFee: 250,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableHours: { start: '10:00', end: '18:00' },
    status: 'Available'
  },
  {
    doctorId: 'DR000003',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    specialization: 'Pediatrics',
    department: 'Pediatrics',
    phone: '555-0104',
    email: 'emily.rodriguez@healthsight.com',
    qualifications: ['MD', 'FAAP'],
    experience: 8,
    consultationFee: 150,
    availableDays: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
    availableHours: { start: '08:00', end: '16:00' },
    status: 'Available'
  }
];

const patients = [
  {
    patientId: 'PT000001',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1985-05-15'),
    gender: 'Male',
    phone: '555-1001',
    email: 'john.doe@email.com',
    address: {
      street: '123 Main St',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101'
    },
    bloodType: 'O+',
    allergies: ['Penicillin'],
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '555-1002'
    },
    status: 'Active'
  },
  {
    patientId: 'PT000002',
    firstName: 'Maria',
    lastName: 'Garcia',
    dateOfBirth: new Date('1992-08-22'),
    gender: 'Female',
    phone: '555-1003',
    email: 'maria.garcia@email.com',
    address: {
      street: '456 Oak Ave',
      city: 'Boston',
      state: 'MA',
      zipCode: '02102'
    },
    bloodType: 'A+',
    allergies: [],
    emergencyContact: {
      name: 'Carlos Garcia',
      relationship: 'Brother',
      phone: '555-1004'
    },
    status: 'Active'
  }
];

const medications = [
  {
    medicationId: 'MED000001',
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    category: 'Pain Relief',
    manufacturer: 'PharmaCorp',
    dosageForm: 'Tablet',
    strength: '100mg',
    price: 5.99,
    stockQuantity: 500,
    reorderLevel: 100,
    expiryDate: new Date('2026-12-31'),
    status: 'In Stock'
  },
  {
    medicationId: 'MED000002',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    category: 'Antibiotic',
    manufacturer: 'MediPharm',
    dosageForm: 'Capsule',
    strength: '500mg',
    price: 12.99,
    stockQuantity: 8,
    reorderLevel: 50,
    expiryDate: new Date('2025-06-30'),
    status: 'Low Stock'
  }
];

// Seed function
async function seedDatabase() {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Billing.deleteMany({});
    await Medication.deleteMany({});
    await LabReport.deleteMany({});

    // Insert users one by one so pre-save hook runs
    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }

    // Insert doctors
    console.log('Creating doctors...');
    const createdDoctors = await Doctor.insertMany(doctors);

    // Insert patients
    console.log('Creating patients...');
    const createdPatients = await Patient.insertMany(patients);

    // Insert medications
    console.log('Creating medications...');
    await Medication.insertMany(medications);

    // Create sample appointments
    console.log('Creating appointments...');
    const appointments = [
      {
        appointmentId: 'AP000001',
        patient: createdPatients[0]._id,
        doctor: createdDoctors[0]._id,
        appointmentDate: new Date(),
        appointmentTime: '10:00 AM',
        type: 'Consultation',
        status: 'Scheduled',
        reasonForVisit: 'Regular checkup'
      },
      {
        appointmentId: 'AP000002',
        patient: createdPatients[1]._id,
        doctor: createdDoctors[1]._id,
        appointmentDate: new Date(Date.now() + 86400000),
        appointmentTime: '02:00 PM',
        type: 'Follow-up',
        status: 'Confirmed',
        reasonForVisit: 'Follow-up consultation'
      }
    ];
    await Appointment.insertMany(appointments);

    // Create sample billing
    console.log('Creating billing records...');
    const billing = [
      {
        invoiceId: 'INV000001',
        patient: createdPatients[0]._id,
        items: [
          { description: 'Consultation Fee', quantity: 1, unitPrice: 200, total: 200 },
          { description: 'Lab Tests', quantity: 2, unitPrice: 50, total: 100 }
        ],
        subtotal: 300,
        tax: 30,
        discount: 0,
        totalAmount: 330,
        paymentStatus: 'Paid',
        paymentMethod: 'Card',
        paidDate: new Date()
      },
      {
        invoiceId: 'INV000002',
        patient: createdPatients[1]._id,
        items: [
          { description: 'Consultation Fee', quantity: 1, unitPrice: 250, total: 250 }
        ],
        subtotal: 250,
        tax: 25,
        discount: 25,
        totalAmount: 250,
        paymentStatus: 'Pending',
        dueDate: new Date(Date.now() + 7 * 86400000)
      }
    ];
    await Billing.insertMany(billing);

    // Create sample lab reports
    console.log('Creating lab reports...');
    const labReports = [
      {
        reportId: 'LAB000001',
        patient: createdPatients[0]._id,
        doctor: createdDoctors[0]._id,
        testType: 'Complete Blood Count',
        category: 'Blood Test',
        testDate: new Date(),
        results: 'All values within normal range',
        status: 'Completed'
      }
    ];
    await LabReport.insertMany(labReports);

    console.log('✅ Database seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Doctor: doctor / doctor123');
    console.log('Staff: staff / staff123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
