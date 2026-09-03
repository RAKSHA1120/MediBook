import {
  getCurrentUser,
  setCurrentUser,
  getPatients,
  getCurrentPatient,
  updateUser,
  updatePatient
} from "../utils/storage";

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

  const patientRecord = getCurrentPatient();

  const extraDataStr = localStorage.getItem(`medibook_profile_${user.id}`);
  let extraData = {};
  if (extraDataStr) {
     try {
       extraData = JSON.parse(extraDataStr);
     } catch (e) {}
  }

  const patientId = patientRecord?.id || user.refId || user.id || "P1";

  let rawName = extraData.name || patientRecord?.name || user.name || "Patient";
  if (rawName.startsWith("Patient (") && rawName.endsWith(")")) {
    rawName = "Patient";
  }

  const phone = extraData.phone || patientRecord?.contact || patientRecord?.mobile || user.mobile || "";
  const gender = extraData.gender || patientRecord?.gender || user.gender || "Not specified";
  const age = extraData.age || patientRecord?.age || user.age || "N/A";

  return { 
     ...DEFAULT_PATIENT_PROFILE, 
     ...patientRecord,
     ...extraData,
     id: patientId,
     patientId: patientId,
     name: rawName, 
     phone: phone, 
     mobile: phone,
     email: extraData.email || patientRecord?.email || `${rawName.toLowerCase().replace(/[^a-z0-9]/g, "") || "patient"}@example.com`,
     gender: gender,
     age: age,
     role: "Patient" 
  };
};

// Save profile to localStorage and notify subscribers
export const savePatientProfile = (profileData) => {
  const user = getCurrentUser();
  if (!user) return;

  const targetPId = profileData.id || profileData.patientId || user.refId || user.id || "P1";

  // 1. Update active user session object
  const updatedUser = {
    ...user,
    name: profileData.name,
    mobile: profileData.phone || profileData.mobile || user.mobile,
    email: profileData.email || user.email
  };
  setCurrentUser(updatedUser);

  // 2. Update user record in medibook_users array
  updateUser(user.id, {
    name: profileData.name,
    mobile: profileData.phone || profileData.mobile || user.mobile,
    email: profileData.email
  });

  // 3. Update patient record in medibook_patients array
  updatePatient(targetPId, {
    name: profileData.name,
    contact: profileData.phone || profileData.mobile,
    mobile: profileData.phone || profileData.mobile,
    gender: profileData.gender,
    age: profileData.age,
    email: profileData.email,
    dob: profileData.dob,
    formattedDob: profileData.formattedDob,
    bloodGroup: profileData.bloodGroup,
    address: profileData.address,
    city: profileData.city,
    state: profileData.state,
    pincode: profileData.pincode
  });

  // 4. Save per-user extra profile attributes
  try {
    localStorage.setItem(`medibook_profile_${user.id}`, JSON.stringify(profileData));
  } catch (e) {
    console.error("Error saving profile to localStorage:", e);
  }

  // 5. Notify all components to update immediately
  window.dispatchEvent(new Event("medibook_profile_updated"));
  window.dispatchEvent(new Event("medibook_current_user_updated"));
};
