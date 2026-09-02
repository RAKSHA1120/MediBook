import { getCurrentUser, setCurrentUser, getPatients } from "../utils/storage";

// Default Patient Profile Data
export const DEFAULT_PATIENT_PROFILE = {
  name: "Patient",
  role: "Patient",
  email: "patient@example.com",
  phone: "9876543210",
  dob: "1995-01-01",
  formattedDob: "01/01/1995",
  gender: "Not specified",
  bloodGroup: "O+",
  address: "123 Healthcare Ave",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "600017"
};

export const PATIENT_PROFILE_STORAGE_KEY = "medibook_patient_profile";

// Helper to compute initials from full name
export const getPatientInitials = (name) => {
  if (!name || typeof name !== "string") return "P";
  const cleanName = name.replace(/\([^)]*\)/g, "").replace(/[^a-zA-Z\s]/g, "").trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Retrieve stored profile or fallback to authenticated patient data
export const getStoredPatientProfile = () => {
  const user = getCurrentUser();
  if (!user) return DEFAULT_PATIENT_PROFILE;
  
  const patients = getPatients();
  const patientRecord = patients.find(
    (p) =>
      String(p.id || "").trim().toLowerCase() === String(user.refId || user.id || "").trim().toLowerCase() ||
      String(p.contact || p.mobile || "").trim().toLowerCase() === String(user.mobile || user.loginId || "").trim().toLowerCase()
  );

  const extraDataStr = localStorage.getItem(`medibook_profile_${user.id}`);
  let extraData = {};
  if (extraDataStr) {
     try {
       extraData = JSON.parse(extraDataStr);
     } catch (e) {}
  }

  const patientId = patientRecord?.id || user.refId || user.id || "P-101";

  let rawName = extraData.name || patientRecord?.name || user.name || "Patient";
  if (rawName.startsWith("Patient (") && rawName.endsWith(")")) {
    rawName = "Patient";
  }

  const phone = extraData.phone || patientRecord?.contact || patientRecord?.mobile || user.mobile || "";
  const gender = extraData.gender || patientRecord?.gender || user.gender || "Not specified";
  const age = extraData.age || patientRecord?.age || user.age || "N/A";

  return { 
     ...DEFAULT_PATIENT_PROFILE, 
     ...extraData,
     id: patientId,
     patientId: patientId,
     name: rawName, 
     phone: phone, 
     mobile: phone,
     email: extraData.email || `${rawName.toLowerCase().replace(/[^a-z0-9]/g, "") || "patient"}@example.com`,
     gender: gender,
     age: age,
     role: "Patient" 
  };
};

// Save profile to localStorage and notify subscribers
export const savePatientProfile = (profileData) => {
  const user = getCurrentUser();
  if (user) {
    const updatedUser = { ...user, name: profileData.name, mobile: profileData.phone };
    setCurrentUser(updatedUser);

    const patients = getPatients();
    const targetRefId = String(user.refId || user.id || "").trim().toLowerCase();
    const targetMobile = String(user.mobile || "").trim().toLowerCase();

    const pIdx = patients.findIndex(
      (p) =>
        String(p.id || "").trim().toLowerCase() === targetRefId ||
        String(p.contact || p.mobile || "").trim().toLowerCase() === targetMobile
    );

    if (pIdx !== -1) {
      patients[pIdx] = {
        ...patients[pIdx],
        name: profileData.name,
        contact: profileData.phone,
        mobile: profileData.phone,
        gender: profileData.gender,
        age: profileData.age
      };
      setStorage("medibook_patients", patients);
    }

    const users = getUsers();
    const uIdx = users.findIndex((u) => u.id === user.id || u.refId === user.refId);
    if (uIdx !== -1) {
      users[uIdx] = { ...users[uIdx], name: profileData.name, mobile: profileData.phone };
      setStorage("medibook_users", users);
    }
    
    // Save extra data separately
    try {
      localStorage.setItem(`medibook_profile_${user.id}`, JSON.stringify(profileData));
    } catch (e) {}
  }
  window.dispatchEvent(new Event("medibook_profile_updated"));
  window.dispatchEvent(new Event("medibook_current_user_updated"));
};
