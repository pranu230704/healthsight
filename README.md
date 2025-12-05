# HealthSight - Hospital Management System

A comprehensive hospital management system built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

✅ **User Authentication & Authorization**
- Secure login system with JWT tokens
- Role-based access control (Admin, Doctor, Nurse, Staff)
- Session management with remember me functionality

✅ **Patient Management**
- Complete patient records with medical history
- Emergency contact information
- Insurance details and blood type tracking
- Patient status monitoring

✅ **Doctor Management**
- Doctor profiles with specializations
- Availability scheduling
- Consultation fee management
- Department assignments

✅ **Appointment Scheduling**
- Book and manage appointments
- Track appointment status
- Patient-doctor associations
- Appointment history

✅ **Billing System**
- Invoice generation and management
- Payment status tracking
- Insurance claim processing
- Multiple payment methods

✅ **Pharmacy Management**
- Medication inventory tracking
- Stock level monitoring
- Low stock alerts
- Expiry date management

✅ **Lab Reports**
- Test result management
- Multiple test categories
- Report status tracking
- Doctor associations

✅ **Dashboard Analytics**
- Real-time statistics
- Revenue tracking
- Appointment overview
- Quick access to key metrics

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**
- HTML5, CSS3, JavaScript
- Responsive design
- Modern UI/UX

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## Installation

### 1. Install MongoDB

If you don't have MongoDB installed:

**Windows:**
```powershell
# Download and install from: https://www.mongodb.com/try/download/community
# Or use chocolatey:
choco install mongodb
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
```

### 2. Start MongoDB

```powershell
# Windows (PowerShell)
mongod

# Or start as a service
net start MongoDB
```

### 3. Install Dependencies

```powershell
cd c:\Users\vutuk\Desktop\healthsight
npm install
```

### 4. Configure Environment Variables

The `.env` file is already created. Update if needed:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/healthsight
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

### 5. Seed the Database

Populate the database with demo data:

```powershell
npm run seed
```

This creates:
- 3 demo users (admin, doctor, staff)
- 3 doctors with different specializations
- 2 patients
- Sample appointments, billing records, medications, and lab reports

## Running the Application

### Start the Backend Server

```powershell
npm start
```

Or for development with auto-reload:

```powershell
npm run dev
```

The server will start at `http://localhost:3000`

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You'll be redirected to the login page.

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Doctor | `doctor` | `doctor123` |
| Staff | `staff` | `staff123` |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/logout` - Logout user

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get single doctor
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get single appointment
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Billing
- `GET /api/billing` - Get all billing records
- `GET /api/billing/:id` - Get single billing record
- `POST /api/billing` - Create billing record
- `PUT /api/billing/:id` - Update billing record
- `DELETE /api/billing/:id` - Delete billing record

### Pharmacy
- `GET /api/pharmacy` - Get all medications
- `GET /api/pharmacy/:id` - Get single medication
- `POST /api/pharmacy` - Create medication
- `PUT /api/pharmacy/:id` - Update medication
- `DELETE /api/pharmacy/:id` - Delete medication

### Lab Reports
- `GET /api/lab-reports` - Get all lab reports
- `GET /api/lab-reports/:id` - Get single lab report
- `POST /api/lab-reports` - Create lab report
- `PUT /api/lab-reports/:id` - Update lab report
- `DELETE /api/lab-reports/:id` - Delete lab report

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Project Structure

```
healthsight/
├── assets/
│   ├── css/              # Stylesheets
│   │   ├── base.css
│   │   ├── sidebar.css
│   │   ├── dashboard.css
│   │   └── ...
│   └── js/               # Client-side JavaScript
│       ├── auth.js       # Authentication utilities
│       ├── api.js
│       ├── dashboard.js
│       └── ...
├── pages/                # HTML pages
│   ├── dashboard.html
│   ├── appointments.html
│   ├── patients.html
│   └── ...
├── server/
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   └── ...
│   ├── routes/          # Express routes
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── doctors.js
│   │   └── ...
│   ├── middleware/      # Custom middleware
│   │   └── auth.js
│   ├── server.js        # Express server
│   └── seed.js          # Database seeder
├── .env                 # Environment variables
├── .gitignore
├── package.json
├── index.html           # Entry point
├── login.html           # Login page
└── README.md
```

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes with middleware
- Role-based authorization
- Session management
- CORS enabled

## Development

### Adding New Features

1. Create model in `server/models/`
2. Create routes in `server/routes/`
3. Add routes to `server/server.js`
4. Create frontend page in `pages/`
5. Add JavaScript functionality in `assets/js/`

### Database Schema

Models use Mongoose ODM with schema validation. Check individual model files in `server/models/` for detailed schemas.

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod` or `net start MongoDB`
- Check connection string in `.env`

**Port Already in Use:**
- Change PORT in `.env` file
- Or stop the process using port 3000

**Cannot Login:**
- Make sure you ran `npm run seed` to create demo users
- Check MongoDB is running and connected

**Frontend Not Loading:**
- Clear browser cache
- Check console for errors
- Ensure backend server is running

## Future Enhancements

- [ ] Email notifications
- [ ] SMS alerts
- [ ] Report generation (PDF)
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Prescription management
- [ ] Bed management
- [ ] Staff scheduling
- [ ] Multi-language support
- [ ] Dark mode

## License

MIT License - Feel free to use this project for learning or commercial purposes.

## Support

For issues or questions, please check the console logs or contact the development team.

---

Built with ❤️ for better healthcare management
