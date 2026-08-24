// Default Patient Profile Data
export const DEFAULT_PATIENT_PROFILE = {
  name: "Raksha",
  role: "Patient",
  email: "raksha@example.com",
  phone: "+91 98765 43210",
  dob: "2004-05-12",
  formattedDob: "12/05/2004",
  gender: "Female",
  bloodGroup: "O+",
  address: "123 Healthcare Ave, T. Nagar",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "600017"
};

export const PATIENT_PROFILE_STORAGE_KEY = "medibook_patient_profile";

// Helper to compute initials from full name
export const getPatientInitials = (name) => {
  if (!name || typeof name !== "string") return "R";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "R";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Retrieve stored profile or fallback to default
export const getStoredPatientProfile = () => {
  try {
    const stored = localStorage.getItem(PATIENT_PROFILE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PATIENT_PROFILE, ...parsed };
    }
  } catch (e) {
    console.error("Error reading stored patient profile:", e);
  }
  return DEFAULT_PATIENT_PROFILE;
};

// Save profile to localStorage and notify subscribers
export const savePatientProfile = (profileData) => {
  try {
    localStorage.setItem(PATIENT_PROFILE_STORAGE_KEY, JSON.stringify(profileData));
    window.dispatchEvent(new Event("medibook_profile_updated"));
  } catch (e) {
    console.error("Error saving patient profile:", e);
  }
};
