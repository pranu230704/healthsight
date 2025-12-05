# HealthSight Setup Guide

## Quick Start (Step by Step)

Follow these steps to get your HealthSight application running:

### Step 1: Install MongoDB

MongoDB is required for the database. Choose one of these methods:

#### Option A: Download Installer (Recommended)
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0.x (or latest)
   - Platform: Windows
   - Package: MSI
3. Download and run the installer
4. During installation:
   - Choose "Complete" installation
   - Install MongoDB as a Service (check the box)
   - Install MongoDB Compass (optional but helpful)

#### Option B: Using Chocolatey (if you have it)
```powershell
choco install mongodb
```

### Step 2: Verify MongoDB Installation

Open a new PowerShell window and run:
```powershell
mongod --version
```

If you see version information, MongoDB is installed correctly.

### Step 3: Start MongoDB Service

```powershell
# Start MongoDB service
net start MongoDB
```

Or if installed manually, run:
```powershell
mongod
```

### Step 4: Seed the Database

Open PowerShell in the healthsight folder and run:
```powershell
npm run seed
```

You should see:
```
✅ Database seeded successfully!

Demo Credentials:
Admin: admin / admin123
Doctor: doctor / doctor123
Staff: staff / staff123
```

### Step 5: Start the Backend Server

```powershell
npm start
```

Or for development mode with auto-reload:
```powershell
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
✅ MongoDB Connected
```

### Step 6: Open the Application

Open your web browser and go to:
```
http://localhost:3000
```

You'll be redirected to the login page. Use any of the demo credentials:
- **Admin:** username: `admin`, password: `admin123`
- **Doctor:** username: `doctor`, password: `doctor123`
- **Staff:** username: `staff`, password: `staff123`

## Troubleshooting

### "MongoDB is not recognized"
- MongoDB is not installed or not in PATH
- Follow Step 1 to install MongoDB
- After installation, restart PowerShell

### "Cannot connect to MongoDB"
- MongoDB service is not running
- Run: `net start MongoDB` in PowerShell (as Administrator)
- Or start manually: `mongod`

### "Port 3000 already in use"
- Another application is using port 3000
- Stop the other application or change the port in `.env` file

### "Cannot login"
- Make sure you ran `npm run seed` first
- Check that MongoDB is running
- Check backend server is running

### Backend errors
- Make sure all dependencies are installed: `npm install`
- Check MongoDB connection in `.env` file
- Look at server console for error messages

## What Was Created

Your HealthSight application now has:

✅ **Complete Backend API:**
- User authentication with JWT tokens
- Patient management endpoints
- Doctor management endpoints  
- Appointment scheduling
- Billing system
- Pharmacy inventory
- Lab reports
- Dashboard statistics

✅ **Secure Login System:**
- Role-based access (Admin, Doctor, Staff)
- Password encryption
- Session management
- Protected routes

✅ **Database Models:**
- Users (with roles and permissions)
- Patients (with medical history)
- Doctors (with specializations)
- Appointments (with scheduling)
- Billing (with invoices)
- Medications (with inventory)
- Lab Reports (with test results)

✅ **Frontend Integration:**
- Login page with authentication
- Protected dashboard and pages
- Auth utility functions
- API communication setup

## Development Commands

```powershell
# Install dependencies
npm install

# Seed database with demo data
npm run seed

# Start server (production mode)
npm start

# Start server with auto-reload (development mode)
npm run dev
```

## Next Steps

1. Install MongoDB (Step 1)
2. Start MongoDB service (Step 3)
3. Seed the database (Step 4)
4. Start the backend (Step 5)
5. Login and explore! (Step 6)

## Need Help?

- Check the main README.md for detailed API documentation
- Look at server console for backend errors
- Check browser console for frontend errors
- Make sure both MongoDB and the backend server are running

---

Happy coding! 🏥
