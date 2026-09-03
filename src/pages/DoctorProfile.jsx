import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  Award,
  Clock,
  Tag,
  FileText,
  Building,
  MapPin,
  Edit2,
  Check,
  X
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import Toast from "../components/Toast";
import {
  getCurrentDoctor,
  getCurrentUser,
  updateDoctor,
  updateUser
} from "../utils/storage";
import "./DoctorProfile.css";

function DoctorProfile() {
  const [profile, setProfile] = useState(() => loadInitialDoctorProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [errors, setErrors] = useState({});

  // Toast State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  function loadInitialDoctorProfile() {
    const doc = getCurrentDoctor();
    const user = getCurrentUser();

    // Extract clean mobile (ensure NO email address is put into mobile field)
    let phone = "9876543210";
    const candidates = [doc?.phone, doc?.contact, user?.mobile];
    for (const cand of candidates) {
      if (cand && typeof cand === "string" && !cand.includes("@")) {
        const trimmed = cand.trim();
        if (trimmed.length > 0) {
          phone = trimmed;
          break;
        }
      }
    }

    // Extract clean email
    let email = `${user?.loginId || "doctor"}@medibook.com`;
    if (doc?.email && typeof doc.email === "string" && doc.email.includes("@")) {
      email = doc.email.trim();
    } else if (user?.loginId && typeof user.loginId === "string" && user.loginId.includes("@")) {
      email = user.loginId.trim();
    }

    const name = doc?.name
      ? (doc.name.toLowerCase().startsWith("dr.") ? doc.name : `Dr. ${doc.name}`)
      : (user?.name
        ? (user.name.toLowerCase().startsWith("dr.") ? user.name : `Dr. ${user.name}`)
        : "Dr. Sarah Smith");

    return {
      id: doc?.id || user?.refId || "D1",
      name: name,
      phone: phone,
      email: email,
      role: "DOCTOR",
      specialty: doc?.specialty || doc?.specialization || "Cardiology",
      qualification: doc?.qualification || "MD, DM",
      experience: doc?.experience || 12,
      consultationFee: doc?.consultationFee || doc?.fee || 1000,
      registrationNumber: doc?.registrationNumber || "REG-2018-94821",
      hospital: doc?.hospital || "City Heart Center",
      department: doc?.department || doc?.specialty || "Cardiology",
      hospitalAddress: doc?.address || doc?.hospitalAddress || "123 Healthcare Ave, Block B",
      city: doc?.location || doc?.city || "Bangalore",
      state: doc?.state || "Karnataka",
      hospitalContact: doc?.hospitalContact || "+91 80 4123 4567"
    };
  }

  const showNotification = (title, message, type = "success") => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Sync profile if external update occurs
  useEffect(() => {
    const handleUpdate = () => {
      const updated = loadInitialDoctorProfile();
      setProfile(updated);
      if (!isEditing) {
        setFormData(updated);
      }
    };
    window.addEventListener("medibook_profile_updated", handleUpdate);
    window.addEventListener("medibook_current_user_updated", handleUpdate);
    return () => {
      window.removeEventListener("medibook_profile_updated", handleUpdate);
      window.removeEventListener("medibook_current_user_updated", handleUpdate);
    };
  }, [isEditing]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    } else {
      const cleanPhone = formData.phone.replace(/[^0-9]/g, "");
      if (cleanPhone.length < 10) {
        newErrors.phone = "Enter a valid 10-digit mobile number";
      }
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.specialty || !formData.specialty.trim()) {
      newErrors.specialty = "Specialization is required";
    }

    if (!formData.qualification || !formData.qualification.trim()) {
      newErrors.qualification = "Qualification is required";
    }

    if (!formData.experience || Number(formData.experience) < 0) {
      newErrors.experience = "Valid experience in years is required";
    }

    if (!formData.consultationFee || Number(formData.consultationFee) < 0) {
      newErrors.consultationFee = "Valid consultation fee is required";
    }

    if (!formData.hospital || !formData.hospital.trim()) {
      newErrors.hospital = "Hospital name is required";
    }

    if (!formData.city || !formData.city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartEdit = () => {
    setFormData(profile);
    setErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setErrors({});
    setIsEditing(false);
  };

  const handleSaveChanges = () => {
    if (!validateForm()) {
      showNotification("Validation Error", "Please fill in all required fields correctly.", "error");
      return;
    }

    const formattedName = formData.name.trim().toLowerCase().startsWith("dr.")
      ? formData.name.trim()
      : `Dr. ${formData.name.trim()}`;

    const updatedProfile = {
      ...formData,
      name: formattedName,
      specialty: formData.specialty.trim(),
      specialization: formData.specialty.trim(),
      qualification: formData.qualification.trim(),
      experience: Number(formData.experience),
      consultationFee: Number(formData.consultationFee),
      fee: Number(formData.consultationFee),
      location: formData.city.trim(),
      phone: formData.phone.trim(),
      contact: formData.phone.trim(),
      email: formData.email.trim()
    };

    // Save to localStorage storage.js mutators
    const doc = getCurrentDoctor();
    const user = getCurrentUser();
    if (doc?.id) {
      updateDoctor(doc.id, updatedProfile);
    }
    if (user?.id) {
      updateUser(user.id, { name: formattedName, mobile: formData.phone.trim() });
      const updatedUser = { ...user, name: formattedName, mobile: formData.phone.trim() };
      localStorage.setItem("medibook_current_user", JSON.stringify(updatedUser));
    }

    setProfile(updatedProfile);
    setIsEditing(false);

    window.dispatchEvent(new Event("medibook_profile_updated"));
    window.dispatchEvent(new Event("medibook_current_user_updated"));

    showNotification(
      "Profile Updated",
      "Doctor profile updated successfully.",
      "success"
    );
  };

  // Derive initials for doctor avatar
  const cleanName = profile.name.replace(/^dr\.\s+/i, "").trim();
  const initials = cleanName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SS";

  return (
    <div className="patient-profile-page doctor-profile-page">
      {/* Page Header */}
      <PageHeader
        title="My Profile"
        subtitle="Manage your professional information and profile details."
      />

      {/* Top Profile Header Card */}
      <div className="profile-overview-card">
        <div className="overview-left-block">
          <div className="profile-avatar-circle">{initials}</div>
          <div className="overview-details">
            <div className="overview-name-row">
              <h2 className="overview-name">{profile.name}</h2>
              <span className="role-badge">DOCTOR</span>
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

      {/* Professional Information Section */}
      <div className="profile-section-card">
        <h3 className="section-header-title">
          <Stethoscope size={18} />
          <span>Professional Information</span>
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
              <span className="field-label">Specialization</span>
              <div className="field-value-text">{profile.specialty}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Qualification</span>
              <div className="field-value-text">{profile.qualification}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Years of Experience</span>
              <div className="field-value-text">{profile.experience} Years</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Consultation Fee</span>
              <div className="field-value-text">₹{profile.consultationFee}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Medical Registration Number</span>
              <div className="field-value-text">{profile.registrationNumber}</div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="profile-grid-2col">
            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-doc-name">
                Full Name *
              </label>
              <input
                id="input-doc-name"
                type="text"
                className={`field-input ${errors.name ? "has-error" : ""}`}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Dr. Sarah Smith"
              />
              {errors.name && <span className="field-error-text">{errors.name}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-doc-phone">
                Mobile Number *
              </label>
              <input
                id="input-doc-phone"
                type="text"
                className={`field-input ${errors.phone ? "has-error" : ""}`}
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
              />
              {errors.phone && <span className="field-error-text">{errors.phone}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-doc-email">
                Email Address *
              </label>
              <input
                id="input-doc-email"
                type="email"
                className={`field-input ${errors.email ? "has-error" : ""}`}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="doctor@example.com"
              />
              {errors.email && <span className="field-error-text">{errors.email}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-doc-specialty">
                Specialization *
              </label>
              <input
                id="input-doc-specialty"
                type="text"
                className={`field-input ${errors.specialty ? "has-error" : ""}`}
                value={formData.specialty}
                onChange={(e) => handleInputChange("specialty", e.target.value)}
                placeholder="Cardiology"
              />
              {errors.specialty && <span className="field-error-text">{errors.specialty}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-doc-qualification">
                Qualification *
              </label>
              <input
                id="input-doc-qualification"
                type="text"
                className={`field-input ${errors.qualification ? "has-error" : ""}`}
                value={formData.qualification}
                onChange={(e) => handleInputChange("qualification", e.target.value)}
                placeholder="MD, DM"
              />
              {errors.qualification && <span className="field-error-text">{errors.qualification}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-doc-exp">
                Years of Experience *
              </label>
              <input
                id="input-doc-exp"
                type="number"
                className={`field-input ${errors.experience ? "has-error" : ""}`}
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                placeholder="12"
              />
              {errors.experience && <span className="field-error-text">{errors.experience}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-doc-fee">
                Consultation Fee (₹) *
              </label>
              <input
                id="input-doc-fee"
                type="number"
                className={`field-input ${errors.consultationFee ? "has-error" : ""}`}
                value={formData.consultationFee}
                onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                placeholder="1000"
              />
              {errors.consultationFee && <span className="field-error-text">{errors.consultationFee}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-doc-reg">
                Medical Registration Number
              </label>
              <input
                id="input-doc-reg"
                type="text"
                className="field-input"
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                placeholder="REG-2018-94821"
              />
            </div>
          </div>
        )}
      </div>

      {/* Hospital & Address Section */}
      <div className="profile-section-card">
        <h3 className="section-header-title">
          <Building size={18} />
          <span>Hospital & Address</span>
        </h3>

        {!isEditing ? (
          /* View Mode */
          <div className="profile-grid-2col">
            <div className="profile-field-group">
              <span className="field-label">Hospital Name</span>
              <div className="field-value-text">{profile.hospital}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Department / Specialization</span>
              <div className="field-value-text">{profile.department}</div>
            </div>

            <div className="profile-field-group full-width">
              <span className="field-label">Hospital Address</span>
              <div className="field-value-text">{profile.hospitalAddress}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">City</span>
              <div className="field-value-text">{profile.city}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">State</span>
              <div className="field-value-text">{profile.state}</div>
            </div>

            <div className="profile-field-group full-width">
              <span className="field-label">Hospital Contact Information</span>
              <div className="field-value-text">{profile.hospitalContact}</div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="profile-grid-2col">
            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-hosp-name">
                Hospital Name *
              </label>
              <input
                id="input-hosp-name"
                type="text"
                className={`field-input ${errors.hospital ? "has-error" : ""}`}
                value={formData.hospital}
                onChange={(e) => handleInputChange("hospital", e.target.value)}
                placeholder="City Heart Center"
              />
              {errors.hospital && <span className="field-error-text">{errors.hospital}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-hosp-dept">
                Department / Specialization
              </label>
              <input
                id="input-hosp-dept"
                type="text"
                className="field-input"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="Cardiology"
              />
            </div>

            <div className="profile-field-group full-width">
              <label className="field-label" htmlFor="input-hosp-addr">
                Hospital Address
              </label>
              <input
                id="input-hosp-addr"
                type="text"
                className="field-input"
                value={formData.hospitalAddress}
                onChange={(e) => handleInputChange("hospitalAddress", e.target.value)}
                placeholder="123 Healthcare Ave, Block B"
              />
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-hosp-city">
                City *
              </label>
              <input
                id="input-hosp-city"
                type="text"
                className={`field-input ${errors.city ? "has-error" : ""}`}
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Bangalore"
              />
              {errors.city && <span className="field-error-text">{errors.city}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-hosp-state">
                State
              </label>
              <input
                id="input-hosp-state"
                type="text"
                className="field-input"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Karnataka"
              />
            </div>

            <div className="profile-field-group full-width">
              <label className="field-label" htmlFor="input-hosp-contact">
                Hospital Contact Information
              </label>
              <input
                id="input-hosp-contact"
                type="text"
                className="field-input"
                value={formData.hospitalContact}
                onChange={(e) => handleInputChange("hospitalContact", e.target.value)}
                placeholder="+91 80 4123 4567"
              />
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

export default DoctorProfile;
