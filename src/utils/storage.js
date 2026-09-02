import { initialDoctorsData, initialPatientsData, adminRecentAppointments } from "../data/adminMockData";
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

export const initializeDemoData = () => {
  // One-time wipe of old dummy appointments and notifications
  if (localStorage.getItem("medibook_wiped_dummy_v1") !== "true") {
    localStorage.removeItem(KEYS.APPOINTMENTS);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    localStorage.removeItem(KEYS.INIT);
    localStorage.setItem("medibook_wiped_dummy_v1", "true");
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
  const mergedDoctors = [...initialDoctorsData];

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
  const appointments = [];

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

// Users API (For Authentication)
export const getUsers = () => {
  ensureHospitalUsers();
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

    return {
      ...doc,
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

  return appointments.map((apt) => {
    let docId = apt.doctorId;
    let docName = apt.doctorName;
    let hosId = apt.hospitalId;
    let hosName = apt.hospital;
    let patientId = apt.patientId;
    let patientName = apt.patientName || "Patient";

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
      patientName: patientName
    };
  });
};

// Doctors API
export const getDoctors = () => {
  const doctors = getStorage(KEYS.DOCTORS, []);
  return enrichDoctors(doctors);
};
export const addDoctor = (doctor) => {
  const doctors = getDoctors();
  doctors.push(doctor);
  setStorage(KEYS.DOCTORS, doctors);
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
  const appointments = getStorage(KEYS.APPOINTMENTS, []);
  return enrichAppointments(appointments);
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
export const getNotifications = () => getStorage(KEYS.NOTIFICATIONS, []);
export const addNotification = (notif) => {
  const current = getStorage(KEYS.NOTIFICATIONS, []);
  const newNotif = {
    id: `notif-${Date.now()}`,
    createdAt: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
    timestamp: Date.now(),
    read: false,
    ...notif
  };
  const updated = [newNotif, ...current];
  setStorage(KEYS.NOTIFICATIONS, updated);
  window.dispatchEvent(new Event("medibook_notifications_updated"));
  return updated;
};

export const markNotificationAsRead = (id) => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    setStorage(KEYS.NOTIFICATIONS, notifications);
    window.dispatchEvent(new Event("medibook_notifications_updated"));
  }
};

export const markAllNotificationsAsRead = () => {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  setStorage(KEYS.NOTIFICATIONS, updated);
  window.dispatchEvent(new Event("medibook_notifications_updated"));
  return updated;
};

export const clearAllNotifications = () => {
  setStorage(KEYS.NOTIFICATIONS, []);
  window.dispatchEvent(new Event("medibook_notifications_updated"));
  return [];
};

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
  if (!user || user.role !== "patient") return null;
  const patients = getPatients();

  let patient = patients.find(
    (p) =>
      String(p.id || "").trim().toLowerCase() === String(user.refId || user.id || "").trim().toLowerCase()
  );
  if (!patient) {
    patient = patients.find(
      (p) =>
        String(p.contact || p.mobile || "").trim().toLowerCase() ===
        String(user.mobile || user.loginId || "").trim().toLowerCase()
    );
  }

  if (!patient) {
    return {
      id: user.refId || user.id || `P-${Date.now()}`,
      name: user.name || "Patient",
      contact: user.mobile || "",
      mobile: user.mobile || "",
      gender: user.gender || "Not specified",
      age: user.age || "N/A",
      status: "Active"
    };
  }
  return patient;
};

export const getPatientAppointments = (patientIdentifier) => {
  if (!patientIdentifier) {
    const p = getCurrentPatient();
    if (!p) return [];
    patientIdentifier = p.id;
  }

  const appointments = getAppointments();
  const targetStr = String(patientIdentifier || "").trim().toLowerCase();
  
  // Find matching patient record
  const patients = getPatients();
  const matchedPatient = patients.find(
    (p) =>
      String(p.id || "").trim().toLowerCase() === targetStr ||
      String(p.name || "").trim().toLowerCase() === targetStr ||
      String(p.contact || p.mobile || "").trim().toLowerCase() === targetStr
  );

  const targetId = matchedPatient ? String(matchedPatient.id || "").trim().toLowerCase() : targetStr;
  const targetName = matchedPatient ? String(matchedPatient.name || "").trim().toLowerCase() : targetStr;
  const targetContact = matchedPatient ? String(matchedPatient.contact || matchedPatient.mobile || "").trim().toLowerCase() : targetStr;

  return appointments.filter((apt) => {
    const aptPatId = String(apt.patientId || "").trim().toLowerCase();
    const aptPatName = String(apt.patientName || apt.patient || "").trim().toLowerCase();
    const aptPatContact = String(apt.patientContact || apt.patientMobile || apt.contact || "").trim().toLowerCase();

    if (aptPatId && aptPatId === targetId) return true;
    if (aptPatName && targetName && aptPatName === targetName) return true;
    if (aptPatContact && targetContact && aptPatContact === targetContact) return true;

    return false;
  });
};

export const getPatientNotifications = (patientId, userId) => {
  const notifications = getNotifications();
  if (!patientId && !userId) {
    const p = getCurrentPatient();
    const u = getCurrentUser();
    patientId = p?.id;
    userId = u?.id;
  }
  
  const normPId = String(patientId || "").trim().toLowerCase();
  const normUId = String(userId || "").trim().toLowerCase();

  if (!normPId && !normUId) return [];

  return notifications.filter((n) => {
    const nPId = String(n.patientId || "").trim().toLowerCase();
    const nUId = String(n.userId || "").trim().toLowerCase();

    if (nPId && normPId && nPId === normPId) return true;
    if (nUId && normUId && nUId === normUId) return true;

    return false;
  });
};


