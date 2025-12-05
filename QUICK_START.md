# HealthSight - Quick Reference

## 🚀 Quick Start

1. **Install MongoDB** → https://www.mongodb.com/try/download/community
2. **Seed Database** → Run `seed.bat` or `npm run seed`
3. **Start Server** → Run `start.bat` or `npm start`
4. **Open Browser** → http://localhost:3000

## 🔐 Demo Login Credentials

| Role   | Username | Password   |
|--------|----------|------------|
| Admin  | admin    | admin123   |
| Doctor | doctor   | doctor123  |
| Staff  | staff    | staff123   |

## 📁 Project Structure

```
healthsight/
├── server/          # Backend (Node.js + Express)
│   ├── models/      # Database schemas
│   ├── routes/      # API endpoints
│   └── middleware/  # Auth & validation
├── assets/          # CSS & JavaScript
├── pages/           # HTML pages
├── login.html       # Login page
└── index.html       # Entry point
```

## 🔧 Commands

```powershell
# Install dependencies
npm install

# Seed database
npm run seed

# Start server
npm start

# Start with auto-reload
npm run dev

# Start MongoDB
net start MongoDB
```

## 🌐 API Endpoints

**Base URL:** http://localhost:3000/api

### Authentication
- POST `/auth/login` - Login
- POST `/auth/register` - Register
- GET `/auth/me` - Get current user

### Resources (all require authentication)
- `/patients` - Patient management
- `/doctors` - Doctor management
- `/appointments` - Appointment scheduling
- `/billing` - Billing & invoices
- `/pharmacy` - Medication inventory
- `/lab-reports` - Lab test reports
- `/dashboard/stats` - Dashboard statistics

## 📊 Features

✅ User authentication & authorization
✅ Patient records management
✅ Doctor scheduling
✅ Appointment booking
✅ Billing system
✅ Pharmacy inventory
✅ Lab reports
✅ Dashboard analytics
✅ Role-based access control

## 🔒 Security

- JWT token authentication
- Password hashing (bcrypt)
- Protected routes
- Role-based permissions
- Session management

## 🐛 Troubleshooting

**Can't connect to database?**
→ Check if MongoDB is running: `net start MongoDB`

**Port already in use?**
→ Change PORT in `.env` file

**Can't login?**
→ Run `npm run seed` to create users

**Backend not responding?**
→ Make sure server is running: `npm start`

## 📝 Environment Variables (.env)

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/healthsight
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=development
```

## 🎯 Default Ports

- Backend API: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

## 📚 Documentation

- Full README: `README.md`
- Setup Guide: `SETUP.md`
- API Docs: Inside README.md

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

**Frontend:**
- HTML5, CSS3, JavaScript
- Responsive Design
- Modern UI/UX

---

For detailed information, see README.md
For setup instructions, see SETUP.md
