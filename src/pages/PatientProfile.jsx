import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Droplet,
  MapPin,
  Building,
  Navigation,
  Edit2,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import Button from "../components/Button";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import ProfileImageUploader from "../components/ProfileImageUploader";
import {
  getStoredPatientProfile,
  savePatientProfile,
  getPatientInitials,
  refreshPatientProfile,
  savePatientProfileAsync
} from "../data/patientProfile";
import {
  isValidPhoneNumber,
  filterPhoneInput,
  handlePhoneKeyDown,
  PHONE_ERROR_MESSAGE
} from "../utils/phoneValidation";
import {
  calculateAgeFromDob,
  formatDobForDisplay
} from "../utils/ageCalculation";
import "./PatientProfile.css";

const GENDER_OPTIONS = ["Female", "Male", "Other", "Prefer not to say"];
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const getTodayDateString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function PatientProfile() {
  const [profile, setProfile] = useState(() => {
    const stored = getStoredPatientProfile();
    if (stored.dob) {
      const ageRes = calculateAgeFromDob(stored.dob);
      if (ageRes.valid) {
        stored.age = ageRes.age;
      }
    }
    return stored;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [errors, setErrors] = useState({});

  // Toast State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });
  const toastTimerRef = useRef(null);

  const showNotification = (title, message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ show: true, type, title, message });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Sync profile if external update occurs
  useEffect(() => {
    // Initial fetch from API
    refreshPatientProfile();

    const handleUpdate = () => {
      const updated = getStoredPatientProfile();
      if (updated.dob) {
        const ageRes = calculateAgeFromDob(updated.dob);
        if (ageRes.valid) {
          updated.age = ageRes.age;
        }
      }
      setProfile(updated);
      if (!isEditing) {
        setFormData(updated);
      }
    };
    window.addEventListener("medibook_profile_updated", handleUpdate);
    return () => window.removeEventListener("medibook_profile_updated", handleUpdate);
  }, [isEditing]);

  const handleDobChange = (value) => {
    let calculatedAge = "";
    let dobError = null;

    if (value && value.trim()) {
      const ageRes = calculateAgeFromDob(value);
      if (ageRes.valid) {
        calculatedAge = ageRes.age;
        dobError = null;
      } else {
        calculatedAge = "";
        dobError = ageRes.error;
      }
    } else {
      calculatedAge = "";
      dobError = "Date of Birth is required";
    }

    setFormData((prev) => ({
      ...prev,
      dob: value,
      age: calculatedAge
    }));

    setErrors((prev) => ({
      ...prev,
      dob: dobError,
      age: null
    }));
  };

  const handleInputChange = (field, value) => {
    if (field === "dob") {
      handleDobChange(value);
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = "Mobile number is required";
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = PHONE_ERROR_MESSAGE;
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.dob || !formData.dob.trim()) {
      newErrors.dob = "Date of Birth is required";
    } else {
      const ageRes = calculateAgeFromDob(formData.dob);
      if (!ageRes.valid) {
        newErrors.dob = ageRes.error || "Please enter a valid Date of Birth";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.bloodGroup) {
      newErrors.bloodGroup = "Blood group is required";
    }

    if (!formData.address || !formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city || !formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state || !formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode || !formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartEdit = () => {
    let currentAge = profile.age;
    if (profile.dob) {
      const ageRes = calculateAgeFromDob(profile.dob);
      if (ageRes.valid) {
        currentAge = ageRes.age;
      }
    }
    setFormData({
      ...profile,
      age: currentAge !== null && currentAge !== undefined ? currentAge : ""
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setErrors({});
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      showNotification("Validation Error", "Please fill in all required fields correctly.", "error");
      return;
    }

    // Ensure Age is strictly calculated from DOB as single source of truth
    let finalAge = formData.age;
    if (formData.dob) {
      const ageRes = calculateAgeFromDob(formData.dob);
      if (ageRes.valid) {
        finalAge = ageRes.age;
      }
    }

    // Generate formatted DOB for display (DD-MM-YYYY)
    const formattedDob = formatDobForDisplay(formData.dob);

    const updatedProfile = {
      ...formData,
      age: finalAge,
      formattedDob
    };

    const result = await savePatientProfileAsync(updatedProfile);
    
    if (result.success) {
      setProfile(updatedProfile);
      setIsEditing(false);
      showNotification(
        "Profile Updated",
        "Profile updated successfully.",
        "success"
      );
    } else {
      showNotification(
        "Update Failed",
        result.error || "Failed to update profile.",
        "error"
      );
    }
  };

  const handleImageUpdated = (newImageUrl) => {
    const updatedProfile = { ...profile, profileImageUrl: newImageUrl };
    savePatientProfile(updatedProfile);
  };

  const initials = getPatientInitials(profile.name);

  return (
    <div className="patient-profile-page">
      {/* Page Header */}
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and profile details."
      />

      {/* Top Overview Card */}
      <div className="profile-overview-card">
        <div className="overview-left-block">
          <ProfileImageUploader 
            currentImageUrl={profile.profileImageUrl} 
            onImageUpdated={handleImageUpdated} 
          />
          <div className="overview-details" style={{ marginLeft: '16px' }}>
            <div className="overview-name-row">
              <h2 className="overview-name">{profile.name}</h2>
              <span className="role-badge">{profile.role || "Patient"}</span>
            </div>
            <div className="overview-contact-meta">
              <span className="meta-icon-item">
                <Phone size={14} />
                {profile.phone}
              </span>
              <span className="meta-icon-item">
                <Mail size={14} />
                {profile.email}
              </span>
            </div>
          </div>
        </div>

        <div className="overview-actions">
          {!isEditing ? (
            <PrimaryButton onClick={handleStartEdit}>
              <Edit2 size={16} style={{ marginRight: "6px" }} />
              Edit Profile
            </PrimaryButton>
          ) : (
            <>
              <SecondaryButton onClick={handleCancelEdit}>
                <X size={16} style={{ marginRight: "6px" }} />
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleSaveChanges}>
                <Check size={16} style={{ marginRight: "6px" }} />
                Save Changes
              </PrimaryButton>
            </>
          )}
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="profile-section-card">
        <h3 className="section-header-title">
          <User size={18} />
          <span>Personal Information</span>
        </h3>

        {!isEditing ? (
          /* View Mode */
          <div className="profile-grid-2col">
            <div className="profile-field-group">
              <span className="field-label">Full Name</span>
              <div className="field-value-text">{profile.name}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Mobile Number</span>
              <div className="field-value-text">{profile.phone}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Email Address</span>
              <div className="field-value-text">{profile.email}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Date of Birth</span>
              <div className="field-value-text">
                {formatDobForDisplay(profile.dob)}
              </div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Age</span>
              <div className="field-value-text">{profile.age !== undefined && profile.age !== null && profile.age !== "" ? profile.age : "N/A"}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Gender</span>
              <div className="field-value-text">{profile.gender}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Blood Group</span>
              <div className="field-value-text">{profile.bloodGroup}</div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="profile-grid-2col">
            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-name">
                Full Name *
              </label>
              <input
                id="input-name"
                type="text"
                className={`field-input ${errors.name ? "has-error" : ""}`}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter full name"
              />
              {errors.name && <span className="field-error-text">{errors.name}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-phone">
                Mobile Number *
              </label>
              <input
                id="input-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className={`field-input ${errors.phone ? "has-error" : ""}`}
                value={formData.phone}
                onKeyDown={handlePhoneKeyDown}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = (e.clipboardData || window.clipboardData)?.getData("text") || "";
                  handleInputChange("phone", filterPhoneInput(text));
                }}
                onChange={(e) => handleInputChange("phone", filterPhoneInput(e.target.value))}
                placeholder="Enter 10-digit mobile number"
              />
              {errors.phone && <span className="field-error-text">{errors.phone}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-email">
                Email Address *
              </label>
              <input
                id="input-email"
                type="email"
                className={`field-input ${errors.email ? "has-error" : ""}`}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="name@example.com"
              />
              {errors.email && <span className="field-error-text">{errors.email}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-dob">
                Date of Birth *
              </label>
              <input
                id="input-dob"
                type="date"
                max={getTodayDateString()}
                className={`field-input ${errors.dob ? "has-error" : ""}`}
                value={formData.dob || ""}
                onChange={(e) => handleDobChange(e.target.value)}
              />
              {errors.dob && <span className="field-error-text">{errors.dob}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-age">
                Age
              </label>
              <input
                id="input-age"
                type="text"
                readOnly
                disabled
                className="field-input field-input-readonly"
                value={formData.age !== undefined && formData.age !== null && formData.age !== "" ? formData.age : ""}
                placeholder="Auto-calculated from DOB"
                tabIndex={-1}
                aria-readonly="true"
              />
              {errors.age && <span className="field-error-text">{errors.age}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="select-gender">
                Gender *
              </label>
              <select
                id="select-gender"
                className={`field-select ${errors.gender ? "has-error" : ""}`}
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.gender && <span className="field-error-text">{errors.gender}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="select-blood">
                Blood Group *
              </label>
              <select
                id="select-blood"
                className={`field-select ${errors.bloodGroup ? "has-error" : ""}`}
                value={formData.bloodGroup}
                onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUP_OPTIONS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              {errors.bloodGroup && <span className="field-error-text">{errors.bloodGroup}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Address / Contact Section */}
      <div className="profile-section-card">
        <h3 className="section-header-title">
          <MapPin size={18} />
          <span>Contact & Address</span>
        </h3>

        {!isEditing ? (
          /* View Mode */
          <div className="profile-grid-2col">
            <div className="profile-field-group full-width">
              <span className="field-label">Street Address</span>
              <div className="field-value-text">{profile.address}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">City</span>
              <div className="field-value-text">{profile.city}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">State</span>
              <div className="field-value-text">{profile.state}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Pincode</span>
              <div className="field-value-text">{profile.pincode}</div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="profile-grid-2col">
            <div className="profile-field-group full-width">
              <label className="field-label" htmlFor="input-address">
                Street Address *
              </label>
              <input
                id="input-address"
                type="text"
                className={`field-input ${errors.address ? "has-error" : ""}`}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main St, Apartment / Suite"
              />
              {errors.address && <span className="field-error-text">{errors.address}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-city">
                City *
              </label>
              <input
                id="input-city"
                type="text"
                className={`field-input ${errors.city ? "has-error" : ""}`}
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Chennai"
              />
              {errors.city && <span className="field-error-text">{errors.city}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-state">
                State *
              </label>
              <input
                id="input-state"
                type="text"
                className={`field-input ${errors.state ? "has-error" : ""}`}
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Tamil Nadu"
              />
              {errors.state && <span className="field-error-text">{errors.state}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-pincode">
                Pincode *
              </label>
              <input
                id="input-pincode"
                type="text"
                className={`field-input ${errors.pincode ? "has-error" : ""}`}
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                placeholder="600017"
              />
              {errors.pincode && <span className="field-error-text">{errors.pincode}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification Overlay */}
      {toast.show && (
        <div className="toast-container">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          />
        </div>
      )}
    </div>
  );
}

export default PatientProfile;