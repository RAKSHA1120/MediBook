import { initialDoctorsData, initialPatientsData, adminRecentAppointments } from "../data/adminMockData";
import defaultDoctors from "../data/doctors";
import uniqueAppts from "../data/patientAppointments";
import { INITIAL_NOTIFICATIONS } from "../data/notifications";
import { generateLoginId, generatePassword } from "./idGenerator";

const KEYS = {
  INIT: "medibook_initialized",
  USERS: "medibook_users",
  DOCTORS: "medibook_doctors",
  PATIENTS: "medibook_patients",
  APPOINTMENTS: "medibook_appointments",
  NOTIFICATIONS: "medibook_notifications",
  CURRENT_USER: "medibook_current_user",
  SETTINGS: "medibook_settings",
  HOSPITALS: "medibook_hospitals"
};

export const INITIAL_HOSPITALS = [
  {
    id: "HOS-001",
    name: "City Heart Center",
    type: "Specialty Hospital",
    category: "Super Specialty",
    location: "Bangalore",
    contact: "+91 80 2345 6789",
    email: "info@cityheart.com",
    status: "Active",
    address: "123 MG Road, Bangalore",
    doctorsCount: 5,
    specialty: "Cardiology",
    bedCount: 150,
    loginId: "cityheart",
    password: "hospital123"
  },
  {
    id: "HOS-002",
    name: "Kids Clinic",
    type: "Clinic",
    category: "Specialty Center",
    location: "Delhi",
    contact: "+91 11 4567 8901",
    email: "contact@kidsclinic.org",
    status: "Active",
    address: "45 Connaught Place, Delhi",
    doctorsCount: 3,
    specialty: "Pediatrics",
    bedCount: 80,
    loginId: "kidsclinic",
    password: "hospital123"
  },
  {
    id: "HOS-003",
    name: "Apex General Hospital",
    type: "Government",
    category: "Multi Specialty",
    location: "Mumbai",
    contact: "+91 22 9876 5432",
    email: "apex@hospitalmumbai.gov",
    status: "Active",
    address: "78 Marine Drive, Mumbai",
    doctorsCount: 8,
    specialty: "General Medicine",
    bedCount: 300,
    loginId: "apexgeneral",
    password: "hospital123"
  },
  {
    id: "HOS-004",
    name: "Skin & Aesthetic Care",
    type: "Private",
    category: "Specialty Center",
    location: "Hyderabad",
    contact: "+91 40 3344 5566",
    email: "care@skinaesthetic.com",
    status: "Active",
    address: "12 Jubilee Hills, Hyderabad",
    doctorsCount: 4,
    specialty: "Dermatology",
    bedCount: 50,
    loginId: "skincare",
    password: "hospital123"
  },
  {
    id: "HOS-005",
    name: "Neuro Care Hospital",
    type: "Private",
    category: "Super Specialty",
    location: "Pune",
    contact: "+91 20 6677 8899",
    email: "support@neurocare.com",
    status: "Active",
    address: "89 FC Road, Pune",
    doctorsCount: 4,
    specialty: "Neurology",
    bedCount: 120,
    loginId: "neurocare",
    password: "hospital123"
  },
  {
    id: "HOS-006",
    name: "Women's Health Clinic",
    type: "Clinic",
    category: "Primary Care",
    location: "Chennai",
    contact: "+91 44 2233 4455",
    email: "contact@womenshealth.in",
    status: "Active",
    address: "34 Anna Salai, Chennai",
    doctorsCount: 3,
    specialty: "Gynecology",
    bedCount: 90,
    loginId: "womenshealth",
    password: "hospital123"
  },
  {
    id: "HOS-007",
    name: "Bone & Joint Institute",
    type: "Teaching Hospital",
    category: "Super Specialty",
    location: "Bangalore",
    contact: "+91 80 5566 7788",
    email: "info@bonejointinst.edu",
    status: "Active",
    address: "56 Indiranagar, Bangalore",
    doctorsCount: 6,
    specialty: "Orthopedics",
    bedCount: 180,
    loginId: "bonejoint",
    password: "hospital123"
  },
  {
    id: "HOS-008",
    name: "MediCare Hospital",
    type: "Private",
    category: "Multi Specialty",
    location: "Chennai",
    contact: "+91 44 9900 1122",
    email: "admin@medicarehospitals.com",
    status: "Active",
    address: "90 T Nagar, Chennai",
    doctorsCount: 10,
    specialty: "Multi-Specialty",
    bedCount: 250,
    loginId: "medicare",
    password: "hospital123"
  }
];

// Generic Helpers
const getStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
};

const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
};

const getTodayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getFutureISO = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getPastISO = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const INITIAL_APPOINTMENTS = [
  // Dr. Sarah Smith (D1)
  {
    id: "APT-SS-1",
    patientId: "P1",
    patientName: "Rahul Sharma",
    patient: "Rahul Sharma",
    doctorId: "D1",
    doctorName: "Dr. Sarah Smith",
    hospitalId: "HOS-001",
    hospital: "City Heart Center",
    date: getTodayISO(),
    time: "10:00 AM",
    type: "Cardiology Checkup",
    status: "Confirmed"
  },
  {
    id: "APT-SS-2",
    patientId: "P2",
    patientName: "Priya Patel",
    patient: "Priya Patel",
    doctorId: "D1",
    doctorName: "Dr. Sarah Smith",
    hospitalId: "HOS-001",
    hospital: "City Heart Center",
    date: getFutureISO(3),
    time: "11:30 AM",
    type: "Follow-up Consultation",
    status: "Upcoming"
  },
  {
    id: "APT-SS-3",
    patientId: "P3",
    patientName: "Amit Kumar",
    patient: "Amit Kumar",
    doctorId: "D1",
    doctorName: "Dr. Sarah Smith",
    hospitalId: "HOS-001",
    hospital: "City Heart Center",
    date: getPastISO(5),
    time: "02:00 PM",
    type: "ECG Review",
    status: "Completed"
  },
  {
    id: "APT-SS-4",
    patientId: "P_1",
    patientName: "Raksha",
    patient: "Raksha",
    doctorId: "D1",
    doctorName: "Dr. Sarah Smith",
    hospitalId: "HOS-001",
    hospital: "City Heart Center",
    date: getTodayISO(),
    time: "04:15 PM",
    type: "Heart Consultation",
    status: "Pending"
  },

  // Dr. Michael Lee (2)
  {
    id: "APT-ML-1",
    patientId: "P_1",
    patientName: "Raksha",
    patient: "Raksha",
    doctorId: 2,
    doctorName: "Dr. Michael Lee",
    hospitalId: "HOS-001",
    hospital: "City Heart Center",
    date: getTodayISO(),
    time: "09:30 AM",
    type: "Routine Cardiology Checkup",
    status: "Confirmed"
  },
  {
    id: "APT-ML-2",
    patientId: "P1",
    patientName: "Rahul Sharma",
    patient: "Rahul Sharma",
    doctorId: 2,
    doctorName: "Dr. Michael Lee",
    hospitalId: "HOS-001",
    hospital: "City Heart Center",
    date: getTodayISO(),
    time: "01:30 PM",
    type: "Blood Pressure Review",
    status: "Pending"
  },
  {
    id: "APT-ML-3",
    patientId: "P2",
    patientName: "Priya Patel",
    patient: "Priya Patel",
    doctorId: 2,
    doctorName: "Dr. Michael Lee",
    hospitalId: "HOS-001",
    hospital: "City Heart Center",
    date: getFutureISO(4),
    time: "11:00 AM",
    type: "Follow-up Consultation",
    status: "Upcoming"
  },
  {
    id: "APT-ML-4",
    patientId: "P3",
    patientName: "Amit Kumar",
    patient: "Amit Kumar",
    doctorId: 2,
    doctorName: "Dr. Michael Lee",
    hospitalId: "HOS-001",
    hospital: "City Heart Center",
    date: getPastISO(3),
    time: "03:30 PM",
    type: "Cardiogram Assessment",
    status: "Completed"
  },

  // Dr. James Wilson (D2)
  {
    id: "APT-JW-1",
    patientId: "P2",
    patientName: "Priya Patel",
    patient: "Priya Patel",
    doctorId: "D2",
    doctorName: "Dr. James Wilson",
    hospitalId: "HOS-002",
    hospital: "Kids Clinic",
    date: getTodayISO(),
    time: "11:00 AM",
    type: "Pediatric Wellness Check",
    status: "Confirmed"
  },
  {
    id: "APT-JW-2",
    patientId: "P3",
    patientName: "Amit Kumar",
    patient: "Amit Kumar",
    doctorId: "D2",
    doctorName: "Dr. James Wilson",
    hospitalId: "HOS-002",
    hospital: "Kids Clinic",
    date: getFutureISO(2),
    time: "02:30 PM",
    type: "Child Vaccination",
    status: "Upcoming"
  },
  {
    id: "APT-JW-3",
    patientId: "P1",
    patientName: "Rahul Sharma",
    patient: "Rahul Sharma",
    doctorId: "D2",
    doctorName: "Dr. James Wilson",
    hospitalId: "HOS-002",
    hospital: "Kids Clinic",
    date: getPastISO(4),
    time: "10:00 AM",
    type: "Growth Assessment",
    status: "Completed"
  },

  // Dr. Emily Carter (1)
  {
    id: "APT-EC-1",
    patientId: "P2",
    patientName: "Priya Patel",
    patient: "Priya Patel",
    doctorId: 1,
    doctorName: "Dr. Emily Carter",
    hospitalId: "HOS-002",
    hospital: "Kids Clinic",
    date: getTodayISO(),
    time: "10:30 AM",
    type: "Pediatric Consultation",
    status: "Confirmed"
  },
  {
    id: "APT-EC-2",
    patientId: "P1",
    patientName: "Rahul Sharma",
    patient: "Rahul Sharma",
    doctorId: 1,
    doctorName: "Dr. Emily Carter",
    hospitalId: "HOS-002",
    hospital: "Kids Clinic",
    date: getPastISO(6),
    time: "03:00 PM",
    type: "General Consultation",
    status: "Completed"
  },

  // Dr. Arun Kumar (D3)
  {
    id: "APT-AK-1",
    patientId: "P1",
    patientName: "Rahul Sharma",
    patient: "Rahul Sharma",
    doctorId: "D3",
    doctorName: "Dr. Arun Kumar",
    hospitalId: "HOS-005",
    hospital: "Neuro Care Hospital",
    date: getTodayISO(),
    time: "03:00 PM",
    type: "Neurology Consultation",
    status: "Confirmed"
  },
  {
    id: "APT-AK-2",
    patientId: "P_1",
    patientName: "Raksha",
    patient: "Raksha",
    doctorId: "D3",
    doctorName: "Dr. Arun Kumar",
    hospitalId: "HOS-005",
    hospital: "Neuro Care Hospital",
    date: getPastISO(2),
    time: "02:30 PM",
    type: "Brain Mapping",
    status: "Completed"
  }
];

export const initializeDemoData = () => {
  // One-time wipe of old dummy appointments and notifications if needed
  if (localStorage.getItem("medibook_wiped_dummy_v2") !== "true") {
    localStorage.removeItem(KEYS.APPOINTMENTS);
    localStorage.removeItem(KEYS.INIT);
    localStorage.setItem("medibook_wiped_dummy_v2", "true");
  }

  if (localStorage.getItem(KEYS.INIT) === "true") return;

  console.log("Initializing Demo Data...");

  // Setup Admin user
  const initialUsers = [
    { id: "U_ADMIN", mobile: "admin", loginId: "admin", password: "admin123", role: "admin", name: "System Admin" }
  ];

  // Seed Hospitals into storage & users
  const hospitals = [...INITIAL_HOSPITALS];
  hospitals.forEach((hos) => {
    initialUsers.push({
      id: `U_${hos.id}`,
      loginId: hos.loginId || hos.email || hos.id.toLowerCase(),
      mobile: hos.loginId || hos.contact || hos.id.toLowerCase(),
      password: hos.password || "hospital123",
      role: "hospital",
      name: hos.name,
      refId: hos.id,
      status: hos.status || "Active"
    });
  });

  // Merge doctor mock data
  const mergedDoctors = [...defaultDoctors];
  initialDoctorsData.forEach((d) => {
    if (!mergedDoctors.some((ex) => String(ex.id) === String(d.id))) {
      mergedDoctors.push(d);
    }
  });

  // Ensure every doctor has hospital association
  mergedDoctors.forEach((doc, idx) => {
    if (!doc.hospital) doc.hospital = "MediCare Hospital";
    if (!doc.loginId || doc.loginId.startsWith("doctor")) {
        const loginId = generateLoginId(doc.name, "1980", initialUsers);
        const password = generatePassword(doc.name, "1980");
        doc.loginId = loginId;
        doc.password = password;
        initialUsers.push({ id: `U_DOC_${doc.id}`, loginId, mobile: loginId, password, role: "doctor", name: doc.name, refId: doc.id });
    }
  });

  // Patient Mock Data
  const patients = [...initialPatientsData];
  // Add a default patient user
  patients.push({ id: "P_1", name: "Raksha", contact: "9876543210", gender: "Female", age: 25, status: "Active" });
  initialUsers.push({ id: "U_PAT_1", mobile: "9876543210", loginId: "9876543210", password: "123456", role: "patient", name: "Raksha", refId: "P_1" });

  // Appointments
  const appointments = [...INITIAL_APPOINTMENTS];

  setStorage(KEYS.USERS, initialUsers);
  setStorage(KEYS.HOSPITALS, hospitals);
  setStorage(KEYS.DOCTORS, mergedDoctors);
  setStorage(KEYS.PATIENTS, patients);
  setStorage(KEYS.APPOINTMENTS, appointments);
  setStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);

  localStorage.setItem(KEYS.INIT, "true");
};

// Migration for existing users that might have old credentials
export const migrateData = () => {
   if (localStorage.getItem("medibook_migrated_credentials") === "true") return;
   
   console.log("Migrating Doctor Credentials...");
   const users = getStorage(KEYS.USERS, []);
   const doctors = getStorage(KEYS.DOCTORS, []);
   
   let updated = false;
   doctors.forEach(doc => {
       if (!doc.loginId || doc.loginId.startsWith("doctor")) {
           const loginId = generateLoginId(doc.name, "1980", users);
           const password = generatePassword(doc.name, "1980");
           doc.loginId = loginId;
           doc.password = password;
           
           const existingUser = users.find(u => u.refId === doc.id);
           if (existingUser) {
               existingUser.loginId = loginId;
               existingUser.mobile = loginId;
               existingUser.password = password;
           } else {
               users.push({ id: `U_DOC_${doc.id}`, loginId, mobile: loginId, password, role: "doctor", name: doc.name, refId: doc.id });
           }
           updated = true;
       }
   });
   
   if (updated) {
       setStorage(KEYS.DOCTORS, doctors);
       setStorage(KEYS.USERS, users);
   }
   localStorage.setItem("medibook_migrated_credentials", "true");
};

// Current User API
export const getCurrentUser = () => getStorage(KEYS.CURRENT_USER, null);
export const setCurrentUser = (user) => {
  setStorage(KEYS.CURRENT_USER, user);
  window.dispatchEvent(new Event("medibook_current_user_updated"));
};
export const clearCurrentUser = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
  window.dispatchEvent(new Event("medibook_current_user_updated"));
};

export const ensureHospitalUsers = () => {
  const users = getStorage(KEYS.USERS, []);
  let updated = false;

  INITIAL_HOSPITALS.forEach((hos) => {
    const exists = users.some(
      (u) => u.loginId === hos.loginId || u.mobile === hos.loginId || u.refId === hos.id
    );
    if (!exists) {
      users.push({
        id: `U_${hos.id}`,
        loginId: hos.loginId,
        mobile: hos.loginId,
        password: hos.password || "hospital123",
        role: "hospital",
        name: hos.name,
        refId: hos.id,
        status: hos.status || "Active"
      });
      updated = true;
    }
  });

  if (updated) {
    setStorage(KEYS.USERS, users);
  }

  const hospitals = getStorage(KEYS.HOSPITALS, []);
  if (hospitals.length === 0) {
    setStorage(KEYS.HOSPITALS, INITIAL_HOSPITALS);
  }
};

export const ensureDoctorUsers = () => {
  const users = getStorage(KEYS.USERS, []);
  let doctors = getStorage(KEYS.DOCTORS, []);
  if (!Array.isArray(doctors) || doctors.length < defaultDoctors.length) {
    const existingIds = new Set((doctors || []).map((d) => String(d.id)));
    const missing = defaultDoctors.filter((d) => !existingIds.has(String(d.id)));
    doctors = [...(doctors || []), ...missing];
  }

  let updated = false;

  doctors.forEach((doc) => {
    const docIdStr = String(doc.id).toLowerCase();
    const docNameClean = String(doc.name || "").replace(/^dr\.\s+/i, "").trim().toLowerCase();

    let existingUser = users.find((u) => {
      if ((u.role || "").toLowerCase() !== "doctor") return false;
      if (u.refId !== undefined && u.refId !== null && String(u.refId).toLowerCase() === docIdStr) return true;
      if (u.id && String(u.id).toLowerCase() === `u_doc_${docIdStr}`) return true;
      if (doc.loginId && (String(u.loginId || "").toLowerCase() === String(doc.loginId).toLowerCase() || String(u.mobile || "").toLowerCase() === String(doc.loginId).toLowerCase())) return true;
      const uNameClean = String(u.name || "").replace(/^dr\.\s+/i, "").trim().toLowerCase();
      if (uNameClean && docNameClean && uNameClean === docNameClean) return true;
      return false;
    });

    if (existingUser) {
      if (existingUser.refId !== doc.id || existingUser.name !== (doc.name.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`)) {
        existingUser.refId = doc.id;
        existingUser.name = doc.name.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`;
        updated = true;
      }
    } else {
      let loginId = doc.loginId;
      if (!loginId) {
        loginId = generateLoginId(doc.name, "1980", users);
      }

      users.push({
        id: `U_DOC_${doc.id}`,
        loginId: loginId,
        mobile: loginId,
        password: doc.password || "doctor123",
        role: "doctor",
        name: doc.name.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`,
        refId: doc.id,
        status: doc.status || "Active",
        createdDate: doc.createdDate || "2026-08-20"
      });
      updated = true;
    }
  });

  if (updated) {
    setStorage(KEYS.USERS, users);
  }
};

// Users API (For Authentication)
export const getUsers = () => {
  ensureHospitalUsers();
  ensureDoctorUsers();
  return getStorage(KEYS.USERS);
};
export const addUser = (user) => {
  const users = getUsers();
  users.push(user);
  setStorage(KEYS.USERS, users);
};
export const updateUser = (idOrKey, updates) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === idOrKey || u.mobile === idOrKey || u.loginId === idOrKey);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    setStorage(KEYS.USERS, users);
  }
};

const hospitalNameToIdMap = {
  "city heart center": "HOS-001",
  "kids clinic": "HOS-002",
  "children's care": "HOS-002",
  "apex general hospital": "HOS-003",
  "skin & aesthetic care": "HOS-004",
  "skin care clinic": "HOS-004",
  "grace skin center": "HOS-004",
  "neuro care hospital": "HOS-005",
  "neuro care": "HOS-005",
  "city hospital": "HOS-005",
  "women's health clinic": "HOS-006",
  "bone & joint institute": "HOS-007",
  "general hospital": "HOS-007",
  "medicare hospital": "HOS-008"
};

const doctorNameToHospitalMap = {
  "dr. emily carter": { hospitalId: "HOS-008", hospital: "MediCare Hospital", doctorId: 1 },
  "dr. michael lee": { hospitalId: "HOS-001", hospital: "City Heart Center", doctorId: 2 },
  "dr. priya sharma": { hospitalId: "HOS-002", hospital: "Kids Clinic", doctorId: 3 },
  "dr. rajesh kumar": { hospitalId: "HOS-003", hospital: "Apex General Hospital", doctorId: 4 },
  "dr. ananya rao": { hospitalId: "HOS-004", hospital: "Skin & Aesthetic Care", doctorId: 5 },
  "dr. sanjay gupta": { hospitalId: "HOS-005", hospital: "Neuro Care Hospital", doctorId: 6 },
  "dr. kavita joshi": { hospitalId: "HOS-006", hospital: "Women's Health Clinic", doctorId: 7 },
  "dr. vikram malhotra": { hospitalId: "HOS-007", hospital: "Bone & Joint Institute", doctorId: 8 },
  "dr. shalini sen": { hospitalId: "HOS-008", hospital: "MediCare Hospital", doctorId: 9 },
  "dr. sarah smith": { hospitalId: "HOS-001", hospital: "City Heart Center", doctorId: "D1" },
  "sarah smith": { hospitalId: "HOS-001", hospital: "City Heart Center", doctorId: "D1" },
  "dr. james wilson": { hospitalId: "HOS-002", hospital: "Kids Clinic", doctorId: "D2" },
  "james wilson": { hospitalId: "HOS-002", hospital: "Kids Clinic", doctorId: "D2" },
  "dr. arun": { hospitalId: "HOS-005", hospital: "Neuro Care Hospital", doctorId: "D3" },
  "dr. arun kumar": { hospitalId: "HOS-005", hospital: "Neuro Care Hospital", doctorId: "D3" },
  "arun": { hospitalId: "HOS-005", hospital: "Neuro Care Hospital", doctorId: "D3" }
};

export const enrichDoctors = (doctors) => {
  if (!Array.isArray(doctors)) return [];
  const hospitals = getStorage(KEYS.HOSPITALS, INITIAL_HOSPITALS);
  const nameToId = { ...hospitalNameToIdMap };
  hospitals.forEach((h) => {
    if (h.name && h.id) {
      nameToId[String(h.name).toLowerCase().trim()] = h.id;
    }
  });

  return doctors.map((doc) => {
    const rawHos = doc.hospital ? String(doc.hospital).trim() : "MediCare Hospital";
    const mappedId = doc.hospitalId || nameToId[rawHos.toLowerCase()] || "HOS-008";
    
    const rawDocName = doc.name ? String(doc.name).toLowerCase().trim() : "";
    const nameMapping = doctorNameToHospitalMap[rawDocName];
    const finalHosId = doc.hospitalId || (nameMapping ? nameMapping.hospitalId : mappedId);
    const finalHosName = doc.hospital || (nameMapping ? nameMapping.hospital : rawHos);

    const spec = doc.specialty || doc.specialization || "General Physician";
    const feeVal = doc.consultationFee !== undefined ? Number(doc.consultationFee) : (doc.fee !== undefined ? Number(doc.fee) : 800);
    const expVal = typeof doc.experience === "number" ? doc.experience : (parseInt(doc.experience) || 10);
    const ratVal = doc.rating !== undefined ? Number(doc.rating) : 4.8;
    const revVal = doc.reviewCount !== undefined ? Number(doc.reviewCount) : 124;
    const matchedHosObj = hospitals.find(
      (h) => String(h.id || "").toLowerCase() === String(finalHosId).toLowerCase() ||
             String(h.name || "").toLowerCase() === String(finalHosName).toLowerCase()
    );
    const hosLocationFallback = matchedHosObj ? matchedHosObj.location : null;
    const locVal = doc.location || hosLocationFallback || "Chennai";

    return {
      ...doc,
      specialty: spec,
      specialization: spec,
      consultationFee: feeVal,
      fee: feeVal,
      experience: expVal,
      rating: ratVal,
      reviewCount: revVal,
      location: locVal,
      hospital: finalHosName,
      hospitalId: finalHosId
    };
  });
};

export const enrichAppointments = (appointments, enrichedDocs = null) => {
  if (!Array.isArray(appointments)) return [];
  if (!enrichedDocs) {
    const doctors = getStorage(KEYS.DOCTORS, []);
    enrichedDocs = enrichDoctors(doctors);
  }

  const patients = getStorage(KEYS.PATIENTS, []);
  const users = getStorage(KEYS.USERS, []);

  return appointments.map((apt) => {
    let docId = apt.doctorId;
    let docName = apt.doctorName;
    let hosId = apt.hospitalId;
    let hosName = apt.hospital;
    let patientId = apt.patientId;
    
    // Resolve patient name from direct appointment properties
    let rawPatientName = apt.patientName || apt.patient || apt.patient_name || apt.userName || apt.user_name || apt.name;

    // If missing or generic ("Patient" or "N/A"), attempt resolution using patientId
    if ((!rawPatientName || rawPatientName === "Patient" || rawPatientName === "N/A") && (patientId !== undefined && patientId !== null)) {
      const targetPId = String(patientId).toLowerCase().trim();

      const matchedP = patients.find(
        (p) => String(p.id || "").toLowerCase().trim() === targetPId ||
               String(p.patientId || "").toLowerCase().trim() === targetPId ||
               String(p.refId || "").toLowerCase().trim() === targetPId
      );

      if (matchedP && matchedP.name) {
        rawPatientName = matchedP.name;
      } else {
        const matchedU = users.find(
          (u) => String(u.id || "").toLowerCase().trim() === targetPId ||
                 String(u.refId || "").toLowerCase().trim() === targetPId ||
                 String(u.loginId || "").toLowerCase().trim() === targetPId
        );
        if (matchedU && matchedU.name) {
          rawPatientName = matchedU.name;
        }
      }
    }

    // Default fallback for demo/seed appointments if name is still missing or generic
    if (!rawPatientName || rawPatientName === "Patient" || rawPatientName === "N/A") {
      const aptId = String(apt.id || "").toUpperCase();
      if (aptId === "APT001" || aptId === "APT-001") {
        rawPatientName = "Rahul Sharma";
      } else if (aptId === "APT002" || aptId === "APT-002") {
        rawPatientName = "Priya Patel";
      } else if (aptId === "APT003" || aptId === "APT-003") {
        rawPatientName = "Amit Kumar";
      } else {
        const activePat = getCurrentPatient();
        rawPatientName = activePat?.name || "Rahul Sharma";
      }
    }

    const cleanDocName = docName ? String(docName).toLowerCase().trim() : "";

    const matchedDoc = enrichedDocs.find((d) => {
      if (docId !== undefined && docId !== null && String(d.id).toLowerCase() === String(docId).toLowerCase()) {
        return true;
      }
      if (cleanDocName) {
        const dName = String(d.name || "").toLowerCase().trim();
        const dNameClean = dName.replace(/^dr\.\s+/i, "");
        const inputClean = cleanDocName.replace(/^dr\.\s+/i, "");
        if (dName === cleanDocName || dNameClean === inputClean) return true;
      }
      return false;
    });

    if (matchedDoc) {
      if (docId === undefined || docId === null) docId = matchedDoc.id;
      if (!docName) docName = matchedDoc.name;
      if (!hosId) hosId = matchedDoc.hospitalId;
      if (!hosName) hosName = matchedDoc.hospital;
    }

    if (cleanDocName && doctorNameToHospitalMap[cleanDocName]) {
      const map = doctorNameToHospitalMap[cleanDocName];
      if (docId === undefined || docId === null) docId = map.doctorId;
      if (!hosId) hosId = map.hospitalId;
      if (!hosName) hosName = map.hospital;
    }

    if (!hosId && hosName) {
      hosId = hospitalNameToIdMap[String(hosName).toLowerCase().trim()] || "HOS-008";
    }

    if (!hosId && !hosName) {
      hosId = "HOS-008";
      hosName = "MediCare Hospital";
    }

    return {
      ...apt,
      doctorId: docId !== undefined && docId !== null ? docId : null,
      doctorName: docName || "Doctor",
      hospitalId: hosId,
      hospital: hosName,
      patientId: patientId !== undefined && patientId !== null ? patientId : "P1",
      patientName: rawPatientName
    };
  });
};

// Doctors API
export const getDoctors = () => {
  let doctors = getStorage(KEYS.DOCTORS, []);
  if (!Array.isArray(doctors) || doctors.length < defaultDoctors.length) {
    const existingIds = new Set((doctors || []).map((d) => String(d.id)));
    const missing = defaultDoctors.filter((d) => !existingIds.has(String(d.id)));
    doctors = [...(doctors || []), ...missing];
    setStorage(KEYS.DOCTORS, doctors);
  }
  return enrichDoctors(doctors);
};
export const addDoctor = (doctor) => {
  const doctors = getDoctors();
  doctors.push(doctor);
  setStorage(KEYS.DOCTORS, doctors);
  ensureDoctorUsers();
};
export const updateDoctor = (id, updates) => {
  const doctors = getDoctors();
  const index = doctors.findIndex(d => d.id === id);
  if (index !== -1) {
    doctors[index] = { ...doctors[index], ...updates };
    setStorage(KEYS.DOCTORS, doctors);
  }
};
export const deleteDoctor = (id) => {
  const doctors = getDoctors();
  setStorage(KEYS.DOCTORS, doctors.filter(d => d.id !== id));
  
  const users = getUsers();
  setStorage(KEYS.USERS, users.filter(u => u.refId !== id));
};

// Patients API
export const getPatients = () => getStorage(KEYS.PATIENTS, []);
export const addPatient = (patient) => {
  const patients = getPatients();
  patients.push(patient);
  setStorage(KEYS.PATIENTS, patients);
};
export const updatePatient = (id, updates) => {
  const patients = getPatients();
  const index = patients.findIndex(p => p.id === id);
  if (index !== -1) {
    patients[index] = { ...patients[index], ...updates };
    setStorage(KEYS.PATIENTS, patients);
  }
};
export const deletePatient = (id) => {
  const patients = getPatients();
  setStorage(KEYS.PATIENTS, patients.filter(p => p.id !== id));
  
  const users = getUsers();
  setStorage(KEYS.USERS, users.filter(u => u.refId !== id));
};

// Appointments API
export const getAppointments = () => {
  let appointments = getStorage(KEYS.APPOINTMENTS, null);
  if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
    appointments = INITIAL_APPOINTMENTS;
    setStorage(KEYS.APPOINTMENTS, appointments);
  }
  return enrichAppointments(appointments);
};

export const getAppointmentsForDoctor = (doctorId, doctorName = "") => {
  const allAppointments = getAppointments();

  const targetIdStr = doctorId !== undefined && doctorId !== null ? String(doctorId).trim().toLowerCase() : "";
  const targetNameClean = String(doctorName || "").replace(/^dr\.\s+/i, "").trim().toLowerCase();

  return allAppointments.filter((apt) => {
    const aptDocId = apt.doctorId !== undefined && apt.doctorId !== null ? String(apt.doctorId).trim().toLowerCase() : "";
    const aptDocName = String(apt.doctorName || apt.doctor || "").replace(/^dr\.\s+/i, "").trim().toLowerCase();

    // 1. Direct ID match or standard ID variant match (2 vs d2 vs doc-2)
    if (targetIdStr && aptDocId) {
      if (aptDocId === targetIdStr) return true;
      if (aptDocId === `d${targetIdStr}` || targetIdStr === `d${aptDocId}`) return true;
      if (aptDocId === `doc-${targetIdStr}` || targetIdStr === `doc-${aptDocId}`) return true;
    }

    // 2. Doctor Name match
    if (targetNameClean && aptDocName) {
      if (aptDocName === targetNameClean || aptDocName.includes(targetNameClean) || targetNameClean.includes(aptDocName)) {
        return true;
      }
    }

    return false;
  });
};

export const addAppointment = (appt) => {
  const current = getStorage(KEYS.APPOINTMENTS, []);
  const updated = [appt, ...current];
  setStorage(KEYS.APPOINTMENTS, updated);
  
  addNotification({
     type: "appointment",
     subType: "confirmed",
     title: "Appointment Booked",
     message: `Your appointment with ${appt.doctorName} is booked for ${appt.date}.`,
     appointmentId: appt.id
  });
  
  return updated;
};

export const updateAppointmentStatus = (id, newStatus) => {
  const current = getStorage(KEYS.APPOINTMENTS, []);
  const targetId = String(id ?? "").trim().toLowerCase();
  const appt = current.find(a => String(a.id ?? "").trim().toLowerCase() === targetId);
  const updated = current.map(a => String(a.id ?? "").trim().toLowerCase() === targetId ? { ...a, status: newStatus } : a);
  setStorage(KEYS.APPOINTMENTS, updated);
  
  if (appt) {
    window.dispatchEvent(new Event("medibook_appointments_updated"));
    addNotification({
       type: "appointment",
       subType: newStatus.toLowerCase(),
       title: `Appointment ${newStatus}`,
       message: `Your appointment with ${appt.doctorName} on ${appt.date} is now ${newStatus}.`,
       appointmentId: id
    });
  }
  return updated;
};

// Notifications API
export {
  getStoredNotifications as getNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markAllDoctorNotificationsAsRead,
  getPatientNotifications,
  getDoctorNotifications,
  clearAllNotifications
} from "../data/notifications";

// Hospitals API
export const getHospitals = () => {
  ensureHospitalUsers();
  return getStorage(KEYS.HOSPITALS, INITIAL_HOSPITALS);
};

export const addHospital = (hospital) => {
  const hospitals = getHospitals();
  hospitals.unshift(hospital);
  setStorage(KEYS.HOSPITALS, hospitals);
  window.dispatchEvent(new Event("medibook_hospitals_updated"));
  return hospitals;
};

export const updateHospital = (id, updates) => {
  const hospitals = getHospitals();
  const index = hospitals.findIndex(h => h.id === id);
  if (index !== -1) {
    hospitals[index] = { ...hospitals[index], ...updates };
    setStorage(KEYS.HOSPITALS, hospitals);
    window.dispatchEvent(new Event("medibook_hospitals_updated"));
  }
  return hospitals;
};

export const deleteHospital = (id) => {
  const hospitals = getHospitals();
  const updated = hospitals.filter(h => h.id !== id);
  setStorage(KEYS.HOSPITALS, updated);
  
  const users = getUsers();
  setStorage(KEYS.USERS, users.filter(u => u.refId !== id));
  window.dispatchEvent(new Event("medibook_hospitals_updated"));
  return updated;
};

// Data Isolation Helpers for Hospitals
export const getHospitalDoctors = (hospitalIdentifier) => {
  if (!hospitalIdentifier) return [];
  const doctors = getDoctors();
  const hospitals = getHospitals();
  
  const targetStr = String(hospitalIdentifier).trim().toLowerCase();
  const matchedHos = hospitals.find(
    (h) => String(h.id || "").trim().toLowerCase() === targetStr || String(h.name || "").trim().toLowerCase() === targetStr
  );
  
  const targetId = matchedHos ? String(matchedHos.id).trim().toLowerCase() : targetStr;
  const targetName = matchedHos ? String(matchedHos.name).trim().toLowerCase() : targetStr;

  return doctors.filter((doc) => {
    const docHosId = String(doc.hospitalId || "").trim().toLowerCase();
    const docHosName = String(doc.hospital || "").trim().toLowerCase();
    return (docHosId && docHosId === targetId) || (docHosName && docHosName === targetName);
  });
};

export const getHospitalAppointments = (hospitalIdentifier) => {
  if (!hospitalIdentifier) return [];
  const appointments = getAppointments();
  const hospitalDoctors = getHospitalDoctors(hospitalIdentifier);
  
  const docIds = new Set(hospitalDoctors.map((d) => String(d.id).trim().toLowerCase()));
  const docNames = new Set(
    hospitalDoctors.map((d) => String(d.name || "").replace(/^dr\.\s+/i, "").trim().toLowerCase())
  );

  const hospitals = getHospitals();
  const targetStr = String(hospitalIdentifier).trim().toLowerCase();
  const matchedHos = hospitals.find(
    (h) => String(h.id || "").trim().toLowerCase() === targetStr || String(h.name || "").trim().toLowerCase() === targetStr
  );
  
  const targetId = matchedHos ? String(matchedHos.id).trim().toLowerCase() : targetStr;
  const targetName = matchedHos ? String(matchedHos.name).trim().toLowerCase() : targetStr;

  return appointments.filter((apt) => {
    const aptHosId = String(apt.hospitalId || "").trim().toLowerCase();
    const aptHosName = String(apt.hospital || "").trim().toLowerCase();
    if ((aptHosId && aptHosId === targetId) || (aptHosName && aptHosName === targetName)) {
      return true;
    }

    const aptDocId = apt.doctorId !== undefined && apt.doctorId !== null ? String(apt.doctorId).trim().toLowerCase() : "";
    const rawDocName = apt.doctorName ? String(apt.doctorName).replace(/^dr\.\s+/i, "").trim().toLowerCase() : "";

    return (aptDocId && docIds.has(aptDocId)) || (rawDocName && docNames.has(rawDocName));
  });
};

export const getHospitalPatients = (hospitalIdentifier) => {
  if (!hospitalIdentifier) return [];
  const hospitalAppointments = getHospitalAppointments(hospitalIdentifier);
  const allPatients = getPatients();
  
  const associatedPatientIds = new Set();
  const associatedPatientNames = new Set();

  hospitalAppointments.forEach((apt) => {
    if (apt.patientId !== undefined && apt.patientId !== null) {
      associatedPatientIds.add(String(apt.patientId).trim().toLowerCase());
    }
    if (apt.patientName) {
      associatedPatientNames.add(String(apt.patientName).trim().toLowerCase());
    }
  });

  const matchedPatients = allPatients.filter((p) => {
    const pId = p.id !== undefined && p.id !== null ? String(p.id).trim().toLowerCase() : "";
    const pName = p.name ? String(p.name).trim().toLowerCase() : "";
    return (pId && associatedPatientIds.has(pId)) || (pName && associatedPatientNames.has(pName));
  });

  const uniquePatients = [];
  const seenKeys = new Set();

  matchedPatients.forEach((p) => {
    const key = String(p.id || p.name).trim().toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniquePatients.push(p);
    }
  });

  hospitalAppointments.forEach((apt) => {
    const pName = apt.patientName || "Patient";
    const pId = apt.patientId || `P-${String(pName).replace(/\s+/g, "")}`;
    const key = String(pId).trim().toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniquePatients.push({
        id: pId,
        name: pName,
        gender: apt.patientGender || "Patient",
        age: apt.patientAge || 30,
        contact: apt.patientContact || "9876543210",
        status: "Active"
      });
    }
  });

  return uniquePatients;
};

// Data Isolation Helpers for Patients
export const getCurrentPatient = () => {
  const user = getCurrentUser();
  const patients = getPatients();

  if (!user) {
    return (
      patients[0] || {
        id: "P1",
        name: "Rahul Sharma",
        contact: "9876543210",
        mobile: "9876543210",
        gender: "Male",
        age: 34,
        status: "Active"
      }
    );
  }

  if (user.role !== "patient") {
    return null;
  }

  const targetId = String(user.refId || user.id || "").trim().toLowerCase();

  // 1. Match by exact ID / refId
  let patient = patients.find(
    (p) => String(p.id || "").trim().toLowerCase() === targetId
  );

  // 2. ID equivalence fallback (P_1 / P1 for default patient)
  if (!patient && (targetId === "p_1" || targetId === "p1")) {
    patient = patients.find(
      (p) => String(p.id || "").trim().toLowerCase() === "p_1" || String(p.id || "").trim().toLowerCase() === "p1"
    );
  }

  // 3. Fallback match by contact/mobile if no ID match
  if (!patient) {
    const targetMobile = String(user.mobile || user.loginId || "").trim().toLowerCase();
    patient = patients.find(
      (p) => String(p.contact || p.mobile || "").trim().toLowerCase() === targetMobile
    );
  }

  if (!patient) {
    return {
      id: user.refId || user.id || "P1",
      name: user.name || "Patient",
      contact: user.mobile || "9876543210",
      mobile: user.mobile || "9876543210",
      gender: user.gender || "Not specified",
      age: user.age || "N/A",
      status: "Active"
    };
  }

  // Ensure patient record uses the logged-in user's name if specified
  if (user.name && user.name !== "Patient") {
    patient = { ...patient, name: user.name };
  }

  return patient;
};

export const getPatientAppointments = (patientIdentifier, sourceAppointments = null) => {
  const p = getCurrentPatient();
  const u = getCurrentUser();

  const appointments = sourceAppointments || getAppointments();
  if (!Array.isArray(appointments)) return [];

  const targetStr = String(patientIdentifier || p?.id || u?.refId || u?.id || "p1").trim().toLowerCase();
  
  // Find matching patient record
  const patients = getPatients();
  const matchedPatient = patients.find(
    (pt) =>
      String(pt.id || "").trim().toLowerCase() === targetStr ||
      String(pt.name || "").trim().toLowerCase() === targetStr ||
      String(pt.contact || pt.mobile || "").trim().toLowerCase() === targetStr
  );

  const targetId = matchedPatient ? String(matchedPatient.id || "").trim().toLowerCase() : targetStr;
  const targetName = matchedPatient ? String(matchedPatient.name || "").trim().toLowerCase() : String(p?.name || u?.name || "").trim().toLowerCase();
  const targetContact = matchedPatient ? String(matchedPatient.contact || matchedPatient.mobile || "").trim().toLowerCase() : String(p?.contact || p?.mobile || u?.mobile || "").trim().toLowerCase();

  return appointments.filter((apt) => {
    if (!apt) return false;
    const aptPatId = String(apt.patientId || "").trim().toLowerCase();
    const aptPatName = String(apt.patientName || apt.patient || "").trim().toLowerCase();
    const aptPatContact = String(apt.patientContact || apt.patientMobile || apt.contact || "").trim().toLowerCase();

    // 1. Direct ID match (including P1 / P_1 equivalence)
    if (aptPatId && (aptPatId === targetId || (targetId === "p1" && aptPatId === "p_1") || (targetId === "p_1" && aptPatId === "p1"))) return true;

    // 2. Name match
    if (aptPatName && targetName && (aptPatName === targetName || aptPatName.includes(targetName) || targetName.includes(aptPatName))) return true;

    // 3. Contact match
    if (aptPatContact && targetContact && (aptPatContact === targetContact || aptPatContact === "9876543210")) return true;

    // 4. Default fallback for existing demo appointments when user is in patient role or demo patient
    if (targetId === "p1" || targetId === "p_1" || targetName.includes("rahul") || targetName.includes("raksha")) {
      if (aptPatId === "p1" || aptPatId === "p_1" || aptPatName === "patient" || !aptPatId) {
        return true;
      }
    }

    return false;
  });
};

// Data Isolation Helpers for Doctors
export const getCurrentDoctor = () => {
  const user = getCurrentUser();
  if (!user || user.role !== "doctor") return null;

  const doctors = getDoctors();
  const userRefId = user.refId !== undefined && user.refId !== null ? String(user.refId).trim().toLowerCase() : "";
  const userId = user.id ? String(user.id).trim().toLowerCase() : "";
  const userLogin = String(user.loginId || user.mobile || "").trim().toLowerCase();
  const userNameClean = String(user.name || "").replace(/^dr\.\s+/i, "").trim().toLowerCase();

  // 1. Exact match by doctor.id === user.refId
  let doctor = null;
  if (userRefId) {
    doctor = doctors.find((d) => String(d.id).trim().toLowerCase() === userRefId);
  }

  // 2. Match by exact loginId
  if (!doctor && userLogin) {
    doctor = doctors.find(
      (d) => String(d.loginId || "").trim().toLowerCase() === userLogin
    );
  }

  // 3. Match by doctor name
  if (!doctor && userNameClean) {
    doctor = doctors.find((d) => {
      const dNameClean = String(d.name || "").replace(/^dr\.\s+/i, "").trim().toLowerCase();
      return dNameClean === userNameClean;
    });
  }

  // 4. Fallback match by userId (e.g. U_DOC_2 -> doctor.id === 2)
  if (!doctor && userId.startsWith("u_doc_")) {
    const rawId = userId.replace("u_doc_", "");
    doctor = doctors.find((d) => String(d.id).trim().toLowerCase() === rawId);
  }

  if (!doctor) {
    const fallbackName = user.name ? (user.name.toLowerCase().startsWith("dr.") ? user.name : `Dr. ${user.name}`) : "Dr. Doctor";
    return {
      id: user.refId || user.id || "D1",
      name: fallbackName,
      specialty: "General Medicine",
      specialization: "General Medicine",
      qualification: "MBBS, MD",
      hospital: "MediCare Hospital",
      experience: 8,
      rating: 4.8,
      consultationFee: 800,
      fee: 800,
      availability: "Available Today",
      status: user.status || "Active",
      email: `${user.loginId || "doctor"}@medibook.com`,
      phone: user.mobile || "9876543210",
      role: "doctor"
    };
  }

  const doctorName = doctor.name ? (doctor.name.toLowerCase().startsWith("dr.") ? doctor.name : `Dr. ${doctor.name}`) : (user.name ? (user.name.toLowerCase().startsWith("dr.") ? user.name : `Dr. ${user.name}`) : "Dr. Doctor");

  return {
    ...doctor,
    name: doctorName,
    role: "doctor"
  };
};



