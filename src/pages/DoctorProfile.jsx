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
import { getCurrentUser, getCurrentDoctor } from "../utils/auth";
import { api } from "../utils/api";
import {
  isValidPhoneNumber,
  filterPhoneInput,
  handlePhoneKeyDown,
  PHONE_ERROR_MESSAGE
} from "../utils/phoneValidation";

import ProfileImageUploader from "../components/ProfileImageUploader";
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
    let phone = "";
    const candidates = [doc?.phone, doc?.mobile, doc?.contact, user?.phone, user?.mobile];
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
    let email = "";
    if (doc?.email && typeof doc.email === "string" && doc.email.includes("@")) {
      email = doc.email.trim();
    } else if (user?.loginId && typeof user.loginId === "string" && user.loginId.includes("@")) {
      email = user.loginId.trim();
    } else if (user?.email && typeof user.email === "string" && user.email.includes("@")) {
      email = user.email.trim();
    }

    const rawName = doc?.name || user?.name || "";
    const name = rawName
      ? (rawName.toLowerCase().startsWith("dr.") ? rawName : `Dr. ${rawName}`)
      : "";

    const hospObj = (typeof doc?.hospital === "object" && doc?.hospital !== null) ? doc.hospital : null;
    const hospName = hospObj ? (hospObj.name || "") : (typeof doc?.hospital === "string" ? doc.hospital : "");

    return {
      id: doc?.id || user?.doctorId || user?.refId || "",
      name: name,
      phone: phone,
      email: email,
      role: "DOCTOR",
      specialty: doc?.specialty || doc?.specialization || "",
      qualification: doc?.qualification || "",
      experience: doc?.experience !== undefined && doc?.experience !== null ? doc.experience : "",
      consultationFee: doc?.consultationFee !== undefined && doc?.consultationFee !== null ? doc.consultationFee : "",
      registrationNumber: doc?.registrationNumber || "",
      hospital: hospName,
      department: doc?.department || doc?.specialty || doc?.specialization || "",
      hospitalAddress: hospObj?.address || doc?.hospitalAddress || "",
      city: hospObj?.city || doc?.city || "",
      state: doc?.state || "",
      hospitalContact: hospObj?.phone || doc?.hospitalContact || "",
      profileImageUrl: doc?.profileImageUrl || user?.profileImageUrl || null
    };
  }

  const showNotification = (title, message, type = "success") => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Fetch real doctor profile from backend on mount
  const fetchDoctorProfile = async () => {
    try {
      const user = getCurrentUser();
      const doc = getCurrentDoctor();
      const doctorId = user?.doctorId || user?.refId || doc?.doctorId || doc?.id;
      const userId = user?.id;

      let doctorData = null;

      if (doctorId) {
        const res = await api.get(`/Doctors/${doctorId}`);
        if (res.success && res.data) {
          doctorData = res.data;
        }
      }

      if (!doctorData && userId) {
        const resUser = await api.get(`/Doctors/user/${userId}`);
        if (resUser.success && resUser.data) {
          doctorData = resUser.data;
        }
      }

      if (doctorData) {
        const hospObj = (typeof doctorData.hospital === "object" && doctorData.hospital !== null) ? doctorData.hospital : null;
        const hospName = hospObj ? (hospObj.name || "") : (typeof doctorData.hospital === "string" ? doctorData.hospital : "");

        const rawName = doctorData.name || user?.name || "";
        const formattedName = rawName
          ? (rawName.toLowerCase().startsWith("dr.") ? rawName : `Dr. ${rawName}`)
          : "";

        const cleanPhone = doctorData.phone || doctorData.mobile || user?.mobile || "";
        const cleanEmail = doctorData.email || user?.loginId || user?.email || "";

        const mapped = {
          id: doctorData.id,
          name: formattedName,
          phone: cleanPhone,
          email: cleanEmail,
          role: "DOCTOR",
          specialty: doctorData.specialty || doctorData.specialization || "",
          qualification: doctorData.qualification || "",
          experience: doctorData.experience !== undefined && doctorData.experience !== null ? doctorData.experience : "",
          consultationFee: doctorData.consultationFee !== undefined && doctorData.consultationFee !== null ? doctorData.consultationFee : "",
          registrationNumber: doctorData.registrationNumber || "",
          hospital: hospName,
          department: doctorData.specialty || doctorData.specialization || "",
          hospitalAddress: hospObj?.address || doctorData.hospitalAddress || "",
          city: hospObj?.city || doctorData.city || "",
          state: doctorData.state || "",
          hospitalContact: hospObj?.phone || doctorData.hospitalContact || "",
          profileImageUrl: doctorData.profileImageUrl || user?.profileImageUrl || null
        };

        setProfile(mapped);
        setFormData(mapped);

        if (user) {
          user.doctorId = doctorData.id;
          user.doctor = doctorData;
          if (doctorData.profileImageUrl) user.profileImageUrl = doctorData.profileImageUrl;
          sessionStorage.setItem("medibook_current_user", JSON.stringify(user));
        }
      }
    } catch (err) {
      console.error("Failed to load doctor profile:", err);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

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
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = PHONE_ERROR_MESSAGE;
    }

    if (formData.hospitalContact && formData.hospitalContact.trim()) {
      if (!isValidPhoneNumber(formData.hospitalContact)) {
        newErrors.hospitalContact = PHONE_ERROR_MESSAGE;
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

    if (formData.experience !== "" && formData.experience !== null && formData.experience !== undefined) {
      if (Number(formData.experience) < 0 || isNaN(Number(formData.experience))) {
        newErrors.experience = "Valid experience in years is required";
      }
    }

    if (formData.consultationFee !== "" && formData.consultationFee !== null && formData.consultationFee !== undefined) {
      if (Number(formData.consultationFee) < 0 || isNaN(Number(formData.consultationFee))) {
        newErrors.consultationFee = "Valid consultation fee is required";
      }
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

  const handleSaveChanges = async () => {
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
      specialty: formData.specialty ? formData.specialty.trim() : "",
      specialization: formData.specialty ? formData.specialty.trim() : "",
      qualification: formData.qualification ? formData.qualification.trim() : "",
      experience: formData.experience !== "" && formData.experience !== null ? Number(formData.experience) : null,
      consultationFee: formData.consultationFee !== "" && formData.consultationFee !== null ? Number(formData.consultationFee) : null,
      fee: formData.consultationFee !== "" && formData.consultationFee !== null ? Number(formData.consultationFee) : null,
      phone: formData.phone.trim(),
      contact: formData.phone.trim(),
      email: formData.email.trim()
    };

    // Persist to SQL Server via API
    try {
      const user = getCurrentUser();
      const doc = getCurrentDoctor();
      const doctorId = user?.doctorId || user?.refId || doc?.id || profile?.id;
      if (doctorId) {
        const getRes = await api.get(`/Doctors/${doctorId}`);
        const existing = getRes.success ? getRes.data : {};
        const putBody = {
          ...existing,
          id: Number(doctorId),
          name: formattedName,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          specialty: formData.specialty ? formData.specialty.trim() : existing.specialty || "",
          experience: formData.experience !== "" && formData.experience !== null ? Number(formData.experience) : existing.experience,
          qualification: formData.qualification ? formData.qualification.trim() : existing.qualification,
          consultationFee: formData.consultationFee !== "" && formData.consultationFee !== null ? Number(formData.consultationFee) : existing.consultationFee,
          registrationNumber: formData.registrationNumber ? formData.registrationNumber.trim() : existing.registrationNumber
        };
        await api.put(`/Doctors/${doctorId}`, putBody);

        if (user) {
          user.name = formattedName;
          user.doctor = { ...user.doctor, ...putBody };
          sessionStorage.setItem("medibook_current_user", JSON.stringify(user));
        }
      }
    } catch (err) {
      console.error("Failed to update doctor profile via API:", err);
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
  const cleanName = (profile.name || "Doctor").replace(/^dr\.\s+/i, "").trim();
  const initials = cleanName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "DR";

  const handleImageUpdated = (newImageUrl) => {
    setProfile(prev => ({ ...prev, profileImageUrl: newImageUrl }));
    // Also dispatch event so navbar updates
    const user = getCurrentUser();
    if (user) {
      user.profileImageUrl = newImageUrl;
      sessionStorage.setItem("medibook_current_user", JSON.stringify(user));
      window.dispatchEvent(new Event("medibook_current_user_updated"));
    }
  };

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
          <ProfileImageUploader 
            currentImageUrl={profile.profileImageUrl} 
            onImageUpdated={handleImageUpdated} 
          />
          <div className="overview-details" style={{ marginLeft: '16px' }}>
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
              <div className="field-value-text">{profile.name || "Not provided"}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Mobile Number</span>
              <div className="field-value-text">{profile.phone || "Not provided"}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Email Address</span>
              <div className="field-value-text">{profile.email || "Not provided"}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Specialization</span>
              <div className="field-value-text">{profile.specialty || profile.specialization || "Not specified"}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Qualification</span>
              <div className="field-value-text">{profile.qualification || "Not provided"}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Years of Experience</span>
              <div className="field-value-text">
                {profile.experience !== "" && profile.experience !== null && profile.experience !== undefined
                  ? `${profile.experience} Years`
                  : "Not provided"}
              </div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Consultation Fee</span>
              <div className="field-value-text">
                {profile.consultationFee !== "" && profile.consultationFee !== null && profile.consultationFee !== undefined
                  ? `₹${profile.consultationFee}`
                  : "Not set"}
              </div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Medical Registration Number</span>
              <div className="field-value-text">{profile.registrationNumber || "Not provided"}</div>
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
                placeholder="e.g. Dr. John Doe"
              />
              {errors.name && <span className="field-error-text">{errors.name}</span>}
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-doc-phone">
                Mobile Number *
              </label>
              <input
                id="input-doc-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className={`field-input ${errors.phone ? "has-error" : ""}`}
                value={formData.phone}
                onKeyDown={handlePhoneKeyDown}
                onChange={(e) => handleInputChange("phone", filterPhoneInput(e.target.value))}
                placeholder="Enter 10-digit mobile number"
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
                placeholder="e.g. General Medicine, Cardiology"
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
                placeholder="e.g. MBBS, MD"
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
                placeholder="e.g. 5"
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
                placeholder="e.g. 500"
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
                placeholder="e.g. REG-12345"
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
              <div className="field-value-text">{profile.hospital || "Not assigned"}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">Department / Specialization</span>
              <div className="field-value-text">{profile.department || profile.specialty || "Not specified"}</div>
            </div>

            <div className="profile-field-group full-width">
              <span className="field-label">Hospital Address</span>
              <div className="field-value-text">{profile.hospitalAddress || "Not provided"}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">City</span>
              <div className="field-value-text">{profile.city || "Not provided"}</div>
            </div>

            <div className="profile-field-group">
              <span className="field-label">State</span>
              <div className="field-value-text">{profile.state || "Not provided"}</div>
            </div>

            <div className="profile-field-group full-width">
              <span className="field-label">Hospital Contact Information</span>
              <div className="field-value-text">{profile.hospitalContact || "Not provided"}</div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="profile-grid-2col">
            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-hosp-name">
                Hospital Name
              </label>
              <input
                id="input-hosp-name"
                type="text"
                className={`field-input ${errors.hospital ? "has-error" : ""}`}
                value={formData.hospital}
                onChange={(e) => handleInputChange("hospital", e.target.value)}
                placeholder="e.g. MediCare Hospital"
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
                placeholder="e.g. General Medicine"
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
                placeholder="e.g. 123 Healthcare Ave"
              />
            </div>

            <div className="profile-field-group">
              <label className="field-label" htmlFor="input-hosp-city">
                City
              </label>
              <input
                id="input-hosp-city"
                type="text"
                className={`field-input ${errors.city ? "has-error" : ""}`}
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="e.g. Chennai"
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
                placeholder="e.g. Tamil Nadu"
              />
            </div>

            <div className="profile-field-group full-width">
              <label className="field-label" htmlFor="input-hosp-contact">
                Hospital Contact Information
              </label>
              <input
                id="input-hosp-contact"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className={`field-input ${errors.hospitalContact ? "has-error" : ""}`}
                value={formData.hospitalContact}
                onKeyDown={handlePhoneKeyDown}
                onChange={(e) => handleInputChange("hospitalContact", filterPhoneInput(e.target.value))}
                placeholder="Enter 10-digit contact number"
              />
              {errors.hospitalContact && <span className="field-error-text">{errors.hospitalContact}</span>}
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
