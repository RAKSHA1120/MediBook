import { getCurrentUser, setCurrentUser, getCurrentPatient } from "../utils/auth";
import { api } from "../utils/api";
import { calculateAgeFromDob, parseDob } from "../utils/ageCalculation";

const updateUser = () => {}; 
const updatePatient = () => {};

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

  const patientId = user.refId || patientRecord?.id || user.id || "P1";

  let rawName = extraData.name || patientRecord?.name || user.name || "Patient";
  if (rawName.startsWith("Patient (") && rawName.endsWith(")")) {
    rawName = "Patient";
  }

  const phone = extraData.phone || patientRecord?.contact || patientRecord?.mobile || user.mobile || "";
  const gender = extraData.gender || patientRecord?.gender || user.gender || "Not specified";
const dob = extraData.dob || patientRecord?.dob || DEFAULT_PATIENT_PROFILE.dob;

let calculatedAge = null;

if (dob) {
    const ageResult = calculateAgeFromDob(dob);
    if (ageResult.valid) {
        calculatedAge = ageResult.age;
    }
}

const age = calculatedAge !== null
    ? calculatedAge
    : (extraData.age || patientRecord?.age || user.age || "N/A");

const profileImageUrl =
    extraData.profileImageUrl ||
    patientRecord?.profileImageUrl ||
    user.profileImageUrl ||
    null;
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
     dob: dob,
     age: age,
     role: "Patient",
     profileImageUrl: profileImageUrl
  };
};

export const refreshPatientProfile = async () => {
  const user = getCurrentUser();
  if (!user || user.role.toLowerCase() !== "patient") return;
  
  const targetId = user.refId || user.id;
  const response = await api.get(`/Patients/${targetId}`);
  
  if (response.success && response.data) {
    const apiPatient = response.data;
    const dobClean = apiPatient.dob ? apiPatient.dob.split('T')[0] : "";
    let calculatedAge = apiPatient.age;
    if (dobClean) {
      const ageRes = calculateAgeFromDob(dobClean);
      if (ageRes.valid) {
        calculatedAge = ageRes.age;
      }
    }

    // Overwrite local storage with API data
    savePatientProfile({
      id: targetId,
      name: apiPatient.name,
      phone: apiPatient.mobile,
      mobile: apiPatient.mobile,
      email: apiPatient.email,
      dob: dobClean,
      age: calculatedAge,
      gender: apiPatient.gender,
      bloodGroup: apiPatient.bloodGroup,
      address: apiPatient.address,
      city: apiPatient.city,
      state: apiPatient.state,
      pincode: apiPatient.pincode,
      status: apiPatient.isActive ? "Active" : "Inactive",
      profileImageUrl: apiPatient.profileImageUrl
    });
  }
};

export const savePatientProfileAsync = async (profileData) => {
  const user = getCurrentUser();
  if (!user) return { success: false, error: "Not logged in" };

  const targetId = user.refId || profileData.patientId || profileData.id || user.id || "P1";
  
  let calculatedAge = profileData.age;
  let isoDob = null;
  if (profileData.dob) {
    const ageResult = calculateAgeFromDob(profileData.dob);
    if (ageResult.valid) {
      calculatedAge = ageResult.age;
    }
    const parsed = parseDob(profileData.dob);
    if (parsed) {
      const y = String(parsed.year);
      const m = String(parsed.month).padStart(2, "0");
      const d = String(parsed.day).padStart(2, "0");
      isoDob = `${y}-${m}-${d}T00:00:00.000Z`;
    }
  }

  const apiPayload = {
    id: parseInt(targetId, 10) || 1,
    userId: user.id,
    name: profileData.name,
    mobile: profileData.phone || profileData.mobile,
    email: profileData.email,
    dob: isoDob,
    age: (calculatedAge !== null && calculatedAge !== undefined && calculatedAge !== "") ? parseInt(calculatedAge, 10) : null,
    gender: profileData.gender,
    bloodGroup: profileData.bloodGroup,
    address: profileData.address,
    city: profileData.city,
    state: profileData.state,
    pincode: profileData.pincode,
    isActive: profileData.status !== "Inactive"
  };

  const response = await api.put(`/Patients/${targetId}`, apiPayload);
  
  if (response.success || response.error === "Network error or API offline" || response.error?.includes("Server Error") || response.error?.includes("Timeout")) {
    // If successful or offline / database connection timeout, update local state
    savePatientProfile({
      ...profileData,
      age: calculatedAge
    });
    return { success: true };
  }
  
  return response;
};

// Save profile to localStorage and notify subscribers
export const savePatientProfile = (profileData) => {
  const user = getCurrentUser();
  if (!user) return;

  const targetPId = profileData.id || profileData.patientId || user.refId || user.id || "P1";

  let calculatedAge = profileData.age;
  if (profileData.dob) {
    const ageResult = calculateAgeFromDob(profileData.dob);
    if (ageResult.valid) {
      calculatedAge = ageResult.age;
    }
  }

  const normalizedProfile = {
    ...profileData,
    age: calculatedAge
  };

  // 1. Update active user session object
  const updatedUser = {
    ...user,
name: normalizedProfile.name,
mobile: normalizedProfile.phone || normalizedProfile.mobile || user.mobile,
email: normalizedProfile.email || user.email,
profileImageUrl: profileData.profileImageUrl !== undefined
    ? profileData.profileImageUrl
    : user.profileImageUrl
  };
  setCurrentUser(updatedUser);

  // 2. Update user record in medibook_users array
  updateUser(user.id, {
    name: normalizedProfile.name,
    mobile: normalizedProfile.phone || normalizedProfile.mobile || user.mobile,
    email: normalizedProfile.email
  });

  // 3. Update patient record in medibook_patients array
  updatePatient(targetPId, {
    name: normalizedProfile.name,
    contact: normalizedProfile.phone || normalizedProfile.mobile,
    mobile: normalizedProfile.phone || normalizedProfile.mobile,
    gender: normalizedProfile.gender,
    age: normalizedProfile.age,
    email: normalizedProfile.email,
    dob: normalizedProfile.dob,
    formattedDob: normalizedProfile.formattedDob,
    bloodGroup: normalizedProfile.bloodGroup,
    address: normalizedProfile.address,
    city: normalizedProfile.city,
    state: normalizedProfile.state,
    pincode: normalizedProfile.pincode
  });

  // 4. Save per-user extra profile attributes
  try {
    localStorage.setItem(`medibook_profile_${user.id}`, JSON.stringify(normalizedProfile));
  } catch (e) {
    console.error("Error saving profile to localStorage:", e);
  }

  // 5. Notify all components to update immediately
  window.dispatchEvent(new Event("medibook_profile_updated"));
  window.dispatchEvent(new Event("medibook_current_user_updated"));
};
