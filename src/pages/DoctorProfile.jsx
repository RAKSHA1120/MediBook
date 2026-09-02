import { useState, useEffect } from "react";
import { User, Save, Edit2, X, CheckCircle2, AlertCircle, Shield, Briefcase, Mail, Phone, Calendar, Building2, DollarSign } from "lucide-react";
import { getCurrentUser, getDoctors, updateDoctor, getUsers, setCurrentUser as updateStoredCurrentUser } from "../utils/storage";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import "../pages/AdminShared.css";

function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const doctors = getDoctors();
      const myProfile = doctors.find((d) => String(d.id) === String(user.refId)) || doctors.find((d) => String(d.name || "").toLowerCase() === String(user.name || "").toLowerCase());
      if (myProfile) {
        setProfile(myProfile);
        setFormData(myProfile);
      } else {
        // Fallback profile from user record
        const fallback = {
          id: user.refId || "D-101",
          name: user.name || "Dr. Emily Carter",
          specialization: user.specialty || "Cardiology",
          hospital: user.hospital || "MediCare Hospital",
          email: user.email || "emily.carter@medibook.com",
          contact: user.phone || "+91 98765 43210",
          experience: "12 years",
          fee: 800,
          dobYear: "1984",
          loginId: user.loginId || user.email || "DOC-101"
        };
        setProfile(fallback);
        setFormData(fallback);
      }
    }
  }, []);

  const showToastMsg = (msg, type = "success") => {
    setToast({ show: true, type, message: msg });
    setTimeout(() => setToast({ show: false, type: "success", message: "" }), 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!profile) return;

    // Update in doctors store
    updateDoctor(profile.id, formData);

    // Also update currentUser context if name changed
    const user = getCurrentUser();
    if (user) {
      const users = getUsers();
      const userIndex = users.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].name = formData.name;
        localStorage.setItem("medibook_users", JSON.stringify(users));

        user.name = formData.name;
        updateStoredCurrentUser(user);
      }
    }

    setProfile(formData);
    setIsEditing(false);
    showToastMsg("Profile updated successfully!");
  };

  if (!profile) return <div className="patient-dashboard-content">Loading...</div>;

  const initials = (profile.name || "Doctor")
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <main className="patient-dashboard-content">
      {/* 1. Page Header */}
      <section className="greeting-section" style={{ marginBottom: "20px" }}>
        <h2 className="greeting-title">My Profile</h2>
        <p className="greeting-subtitle">Manage your personal and professional information.</p>
      </section>

      {/* Toast Feedback Banner */}
      {toast.show && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: toast.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${toast.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 2. Top Profile Summary Card */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-soft)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-heading)",
                fontSize: "28px",
                fontWeight: "700",
                border: "2px solid var(--border)",
                flexShrink: 0
              }}
            >
              {initials}
            </div>

            <div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: "700", margin: "0 0 4px 0", color: "var(--text-heading)" }}>
                {profile.name}
              </h3>
              <p style={{ margin: "0 0 8px 0", color: "var(--primary)", fontWeight: "600", fontSize: "14.5px" }}>
                {profile.specialization || profile.specialty || "General Medicine"}
              </p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: "var(--text-muted)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Building2 size={14} /> {profile.hospital || "MediCare Hospital"}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Briefcase size={14} /> {profile.experience || "10 years exp."}
                </span>
              </div>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <Button variant="primary" type="button" onClick={() => setIsEditing(true)} style={{ height: "42px", gap: "8px" }}>
                <Edit2 size={16} /> Edit Profile
              </Button>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile);
                  }}
                  style={{ height: "42px", gap: "6px" }}
                >
                  <X size={16} /> Cancel
                </Button>
                <Button variant="primary" type="button" onClick={handleSave} style={{ height: "42px", gap: "6px" }}>
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Form Sections */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Card A: Personal Information */}
        <Card>
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "var(--text-heading)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <User size={20} style={{ color: "var(--primary)" }} /> Personal Information
          </h3>

          <div className="form-row">
            <Input label="Full Name" name="name" value={formData.name || ""} onChange={handleChange} disabled={!isEditing} required />
            <Input
              label="Date of Birth (Year)"
              name="dobYear"
              type="text"
              value={formData.dobYear || formData.dob || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-row" style={{ marginTop: "16px" }}>
            <Input label="Email Address" name="email" value={formData.email || ""} onChange={handleChange} disabled={!isEditing} />
            <Input
              label="Phone Number"
              name="contact"
              value={formData.contact || formData.phone || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </Card>

        {/* Card B: Professional Details */}
        <Card>
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "var(--text-heading)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Briefcase size={20} style={{ color: "var(--primary)" }} /> Professional Details
          </h3>

          <div className="form-row">
            <Input
              label="Specialization"
              name="specialization"
              value={formData.specialization || ""}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
            <Input
              label="Experience (Years)"
              name="experience"
              value={formData.experience || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-row" style={{ marginTop: "16px" }}>
            <Input
              label="Hospital / Clinic"
              name="hospital"
              value={formData.hospital || ""}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
            <Input
              label="Consultation Fee (₹)"
              name="fee"
              type="number"
              value={formData.fee || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </Card>

        {/* Card C: Account Credentials */}
        <Card>
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "var(--text-heading)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Shield size={20} style={{ color: "var(--primary)" }} /> Account Credentials
          </h3>

          <div className="form-row">
            <Input label="Login ID" name="loginId" value={profile.loginId || profile.id || "DOC-101"} disabled={true} />
            <Input label="Account Role" name="role" value="Doctor (Medical Specialist)" disabled={true} />
          </div>
        </Card>

        {/* Bottom Actions if Editing */}
        {isEditing && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(profile);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <Save size={16} style={{ marginRight: "6px" }} /> Save Changes
            </Button>
          </div>
        )}
      </form>
    </main>
  );
}

export default DoctorProfile;
