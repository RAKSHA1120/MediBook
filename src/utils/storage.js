import { initialDoctorsData, initialPatientsData, adminRecentAppointments } from "../data/adminMockData";
import doctorsData from "../data/doctors";
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
  SETTINGS: "medibook_settings"
};

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
    { id: "U_ADMIN", mobile: "admin", password: "admin123", role: "admin", name: "System Admin" }
  ];

  // Merge doctor mock data
  const mergedDoctors = [...doctorsData];
  initialDoctorsData.forEach(d => {
    if (!mergedDoctors.find(md => md.id === d.id)) mergedDoctors.push(d);
  });

  // Assign login IDs and passwords to doctors, and push to users
  mergedDoctors.forEach((doc, idx) => {
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
  initialUsers.push({ id: "U_PAT_1", mobile: "9876543210", password: "123456", role: "patient", name: "Raksha", refId: "P_1" });

  // Appointments
  const appointments = [];

  setStorage(KEYS.USERS, initialUsers);
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

// Users API (For Authentication)
export const getUsers = () => getStorage(KEYS.USERS);
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

// Doctors API
export const getDoctors = () => getStorage(KEYS.DOCTORS);
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
export const getPatients = () => getStorage(KEYS.PATIENTS);
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
export const getAppointments = () => getStorage(KEYS.APPOINTMENTS);

export const addAppointment = (appt) => {
  const current = getStorage(KEYS.APPOINTMENTS);
  const updated = [appt, ...current];
  setStorage(KEYS.APPOINTMENTS, updated);
  
  // also add a notification
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
  const current = getStorage(KEYS.APPOINTMENTS);
  const appt = current.find(a => a.id === id);
  const updated = current.map(a => a.id === id ? { ...a, status: newStatus } : a);
  setStorage(KEYS.APPOINTMENTS, updated);
  
  if (appt) {
    // emit event for UI updates
    window.dispatchEvent(new Event("medibook_appointments_updated"));
    // Add notification
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
export const getNotifications = () => getStorage(KEYS.NOTIFICATIONS);
export const addNotification = (notif) => {
  const current = getStorage(KEYS.NOTIFICATIONS);
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
  }
};
