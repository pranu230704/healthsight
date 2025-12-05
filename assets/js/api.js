// js/api.js
// Simple in-browser "API" for your HealthSight medical admin app.
// You can call these from any page: HealthSightAPI.getDashboardSnapshot(), listAppointments(), etc.

/* ─────────────────────────────
   Helpers
───────────────────────────── */

const fakeDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEY = "healthsight-db-v1";

/**
 * Generate simple IDs (not perfect, but fine for demo).
 */
const generateId = (prefix = "ID") =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;

/* ─────────────────────────────
   Initial in-memory "database"
───────────────────────────── */

const initialDb = {
  doctors: [
    {
      id: "DOC-001",
      name: "Dr. Meera Nair",
      department: "Cardiology",
      slotsToday: 18,
      slotsBooked: 14,
      status: "ON_DUTY",
    },
    {
      id: "DOC-002",
      name: "Dr. Karthik Rao",
      department: "Orthopedics",
      slotsToday: 20,
      slotsBooked: 17,
      status: "ON_DUTY",
    },
    {
      id: "DOC-003",
      name: "Dr. Anjali Sharma",
      department: "Pediatrics",
      slotsToday: 16,
      slotsBooked: 15,
      status: "IN_OT",
    },
    {
      id: "DOC-004",
      name: "Dr. Joseph Menon",
      department: "ICU / Critical Care",
      slotsToday: 10,
      slotsBooked: 9,
      status: "ICU_ROUNDS",
    },
  ],

  patients: [
    {
      id: "UHID-20261",
      name: "Rahul Verma",
      type: "OPD",
      department: "Cardiology",
      doctorId: "DOC-001",
      status: "IN_CONSULT",
      lastEvent: "10:08 AM · Entered room",
    },
    {
      id: "UHID-20262",
      name: "Anita Sharma",
      type: "OPD",
      department: "Orthopedics",
      doctorId: "DOC-002",
      status: "WAITING",
      lastEvent: "09:56 AM · Checked-in",
    },
    {
      id: "UHID-20237",
      name: "Vikram Desai",
      type: "IPD",
      department: "ICU",
      doctorId: "DOC-004",
      status: "ICU_HIGH_RISK",
      lastEvent: "10:02 AM · ABG sample sent",
    },
    {
      id: "UHID-20177",
      name: "Rohan Gupta",
      type: "ER",
      department: "Emergency",
      doctorId: "DOC-004",
      status: "TRIAGE",
      lastEvent: "10:11 AM · Triage started",
    },
  ],

  appointments: [
    {
      id: "APT-1001",
      token: "A-01",
      patientName: "Rahul Verma",
      patientId: "UHID-20261",
      doctorId: "DOC-001",
      doctorName: "Dr. Meera",
      department: "Cardiology",
      type: "OPD",
      time: "10:00 AM",
      status: "CONFIRMED", // CONFIRMED, PENDING, CHECKED_IN, CANCELLED, NO_SHOW
    },
    {
      id: "APT-1002",
      token: "A-02",
      patientName: "Anita Sharma",
      patientId: "UHID-20262",
      doctorId: "DOC-002",
      doctorName: "Dr. Karthik",
      department: "Orthopedics",
      type: "OPD",
      time: "10:15 AM",
      status: "PENDING",
    },
    {
      id: "APT-1003",
      token: "C-01",
      patientName: "Vikram Desai",
      patientId: "UHID-20237",
      doctorId: "DOC-004",
      doctorName: "Dr. Menon",
      department: "ICU",
      type: "IPD_REVIEW",
      time: "Ongoing",
      status: "CHECKED_IN",
    },
  ],

  pharmacyItems: [
    {
      id: "DRG-001",
      name: "Inj. Adrenaline 1mg/ml",
      code: "DRG-001",
      form: "Ampoule",
      stock: 18,
      unit: "amp",
      status: "CRITICAL", // OK, LOW, CRITICAL, OUT
      lastMovement: "Today · Issued to ER",
    },
    {
      id: "DRG-050",
      name: "Tab. Paracetamol 500mg",
      code: "DRG-050",
      form: "Tablet",
      stock: 9420,
      unit: "tab",
      status: "OK",
      lastMovement: "Today · Multiple wards",
    },
    {
      id: "CON-200",
      name: "N95 mask",
      code: "CON-200",
      form: "Consumable",
      stock: 0,
      unit: "pcs",
      status: "OUT",
      lastMovement: "Yesterday · Last lot issued",
    },
  ],

  labReports: [
    {
      id: "LAB-0001",
      testName: "CBC",
      patientName: "Rahul Verma",
      patientId: "UHID-20261",
      department: "Pathology",
      status: "COMPLETED", // COMPLETED, IN_PROGRESS, SAMPLE_COLLECTED, CANCELLED
      tatMinutes: 35,
      collectedAt: "09:20 AM",
      verifiedAt: "09:55 AM",
    },
    {
      id: "LAB-0002",
      testName: "Troponin I",
      patientName: "Rohan Gupta",
      patientId: "UHID-20177",
      department: "Biochemistry",
      status: "IN_PROGRESS",
      tatMinutes: null,
      collectedAt: "10:05 AM",
      verifiedAt: null,
    },
  ],

  billing: {
    todayRevenue: 195500,
    todayBillsCount: 73,
    averageBillValue: 2680,
    pendingClearance: 5,
    lastSync: "10:10 AM",
  },

  // dashboard snapshot data (for your summary tiles & charts)
  dashboardSnapshot: {
    dailyConsultations: 182,
    revenueToday: 195500,
    bedOccupancyPercent: 76,
    emergencyCases: 14,
    staffOnDuty: 89,
    lastUpdated: "10:12 AM",
  },
};

/* ─────────────────────────────
   Local storage wrapper
───────────────────────────── */

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(initialDb);
    const parsed = JSON.parse(raw);
    // merge with defaults in case you add more fields later
    return { ...structuredClone(initialDb), ...parsed };
  } catch (e) {
    console.warn("Failed to load DB from localStorage, using defaults.", e);
    return structuredClone(initialDb);
  }
}

function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn("Failed to save DB to localStorage.", e);
  }
}

// The "live" DB in memory
let db = loadDb();

/* ─────────────────────────────
   API: Dashboard
───────────────────────────── */

async function getDashboardSnapshot() {
  await fakeDelay(200);
  return {
    ...db.dashboardSnapshot,
    // derive some counts fresh from other tables
    totalDoctors: db.doctors.length,
    totalPatientsToday: db.patients.length,
    totalAppointmentsToday: db.appointments.length,
    lowStockCount: db.pharmacyItems.filter((i) =>
      ["LOW", "CRITICAL", "OUT"].includes(i.status)
    ).length,
  };
}

/* ─────────────────────────────
   API: Doctors
───────────────────────────── */

async function listDoctors() {
  await fakeDelay(150);
  return [...db.doctors];
}

async function getDoctorById(id) {
  await fakeDelay(150);
  return db.doctors.find((d) => d.id === id) || null;
}

/* ─────────────────────────────
   API: Patients
───────────────────────────── */

async function listPatients({ query = "", type = "ALL" } = {}) {
  await fakeDelay(200);
  const q = query.trim().toLowerCase();

  return db.patients.filter((p) => {
    if (type !== "ALL" && p.type !== type) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.department && p.department.toLowerCase().includes(q))
    );
  });
}

async function getPatientById(id) {
  await fakeDelay(150);
  return db.patients.find((p) => p.id === id) || null;
}

/* ─────────────────────────────
   API: Appointments
───────────────────────────── */

/**
 * List appointments with optional filters.
 * Example:
 *   HealthSightAPI.listAppointments({ status: 'CONFIRMED', doctorId: 'DOC-001' })
 */
async function listAppointments({
  status = "ALL", // ALL, CONFIRMED, PENDING, CHECKED_IN, CANCELLED, NO_SHOW
  doctorId = "ALL",
  type = "ALL", // OPD, IPD_REVIEW, TELE, etc.
  search = "",
} = {}) {
  await fakeDelay(250);
  const q = search.trim().toLowerCase();

  return db.appointments.filter((apt) => {
    if (status !== "ALL" && apt.status !== status) return false;
    if (doctorId !== "ALL" && apt.doctorId !== doctorId) return false;
    if (type !== "ALL" && apt.type !== type) return false;
    if (!q) return true;

    return (
      apt.patientName.toLowerCase().includes(q) ||
      apt.patientId?.toLowerCase().includes(q) ||
      apt.doctorName.toLowerCase().includes(q) ||
      apt.department.toLowerCase().includes(q) ||
      apt.token.toLowerCase().includes(q)
    );
  });
}

async function getAppointmentById(id) {
  await fakeDelay(150);
  return db.appointments.find((a) => a.id === id) || null;
}

async function createAppointment(payload) {
  // payload: { patientName, patientId?, doctorId, doctorName, department, type, time }
  await fakeDelay(300);

  const newApt = {
    id: generateId("APT"),
    token: payload.token || `T-${db.appointments.length + 1}`,
    patientName: payload.patientName,
    patientId: payload.patientId || null,
    doctorId: payload.doctorId,
    doctorName: payload.doctorName || "Unknown doctor",
    department: payload.department || "General",
    type: payload.type || "OPD",
    time: payload.time || "To be decided",
    status: "PENDING",
  };

  db.appointments.push(newApt);
  saveDb(db);
  return newApt;
}

async function updateAppointmentStatus(id, newStatus) {
  await fakeDelay(250);
  const apt = db.appointments.find((a) => a.id === id);
  if (!apt) throw new Error("Appointment not found");
  apt.status = newStatus;
  saveDb(db);
  return apt;
}

/* ─────────────────────────────
   API: Pharmacy
───────────────────────────── */

async function listPharmacyItems({ stockStatus = "ALL" } = {}) {
  await fakeDelay(250);
  return db.pharmacyItems.filter((item) => {
    if (stockStatus === "ALL") return true;
    return item.status === stockStatus;
  });
}

async function getLowStockSummary() {
  await fakeDelay(200);
  const low = db.pharmacyItems.filter((i) =>
    ["LOW", "CRITICAL", "OUT"].includes(i.status)
  );
  return {
    totalTracked: db.pharmacyItems.length,
    lowCount: low.length,
    criticalCount: low.filter((i) => i.status === "CRITICAL").length,
    outOfStockCount: low.filter((i) => i.status === "OUT").length,
    items: low,
  };
}

/* ─────────────────────────────
   API: Lab Reports
───────────────────────────── */

async function listLabReports({ status = "ALL" } = {}) {
  await fakeDelay(250);
  return db.labReports.filter((r) => {
    if (status === "ALL") return true;
    return r.status === status;
  });
}

/* ─────────────────────────────
   API: Billing
───────────────────────────── */

async function getBillingSummary() {
  await fakeDelay(200);
  return { ...db.billing };
}

/* ─────────────────────────────
   Reset / Dev helpers
───────────────────────────── */

async function resetDemoData() {
  await fakeDelay(200);
  db = structuredClone(initialDb);
  saveDb(db);
  return db;
}

/* ─────────────────────────────
   Export on window
───────────────────────────── */

window.HealthSightAPI = {
  // dashboard
  getDashboardSnapshot,

  // doctors
  listDoctors,
  getDoctorById,

  // patients
  listPatients,
  getPatientById,

  // appointments
  listAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,

  // pharmacy
  listPharmacyItems,
  getLowStockSummary,

  // lab
  listLabReports,

  // billing
  getBillingSummary,

  // dev
  resetDemoData,
};

console.log("%cHealthSight API ready", "color:#22c55e;font-weight:bold;");
