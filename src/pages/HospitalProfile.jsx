import { useState, useEffect } from "react";
import { Building2, MapPin, Phone, Mail, Edit2, Save, X, CheckCircle2, Shield, BedDouble } from "lucide-react";
import { getCurrentUser } from "../utils/auth";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import "./AdminShared.css";

function HospitalProfile() {
  const [hospital, setHospital] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadHospitalProfile();
  }, []);

  const loadHospitalProfile = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const hospitalId = user.refId || 1; 
      const response = await fetch(`http://localhost:5107/api/Hospitals/${hospitalId}`);
      if (response.ok) {
        const data = await response.json();
        const mappedData = {
          ...data,
          location: data.city, // map back to UI field name
          bedCount: data.bedCapacity
        };
        setHospital(mappedData);
        setFormData(mappedData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!hospital?.id) return;

    try {
      const putBody = {
        ...hospital,
        name: formData.name,
        type: formData.type,
        category: formData.category,
        bedCapacity: Number(formData.bedCount) || 0,
        city: formData.location, // map from UI field name
        address: formData.address,
        phone: formData.contact,
        email: formData.email
      };
      
      const res = await fetch(`http://localhost:5107/api/Hospitals/${hospital.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(putBody)
      });
      
      if (res.ok) {
        setHospital(formData);
        setIsEditing(false);
        setSuccessMessage("Hospital facility profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="patient-dashboard-content">
      <PageHeader
        title="Hospital Profile"
        subtitle="Manage healthcare facility information, location details, and contact numbers"
      />

      {successMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#ecfdf5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Top Facility Card */}
      <Card style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "16px",
                backgroundColor: "var(--primary-soft)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border)",
                flexShrink: 0
              }}
            >
              <Building2 size={36} />
            </div>

            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", margin: "0 0 4px 0", color: "var(--text-heading)" }}>
                {hospital?.name || "MediCare Hospital"}
              </h3>
              <p style={{ margin: "0 0 8px 0", color: "var(--primary)", fontWeight: "600", fontSize: "14px" }}>
                {hospital?.type || "Private"} • {hospital?.category || "Multi Specialty"}
              </p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: "var(--text-muted)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={14} /> {hospital?.location || "Chennai"}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <BedDouble size={14} /> {hospital?.bedCount || 250} beds
                </span>
              </div>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <Button variant="primary" type="button" onClick={() => setIsEditing(true)} style={{ height: "42px", gap: "8px" }}>
                <Edit2 size={16} /> Edit Facility Profile
              </Button>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(hospital);
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

      {/* Form Details Cards */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
            <Building2 size={20} style={{ color: "var(--primary)" }} /> Facility Details
          </h3>

          <div className="form-row">
            <Input
              label="Hospital Name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              required
            />
            <Input
              label="Hospital Type"
              value={formData.type || ""}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="form-row" style={{ marginTop: "16px" }}>
            <Input
              label="Category"
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              label="Bed Capacity"
              type="number"
              value={formData.bedCount || ""}
              onChange={(e) => setFormData({ ...formData, bedCount: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </Card>

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
            <MapPin size={20} style={{ color: "var(--primary)" }} /> Location & Contact
          </h3>

          <div className="form-row">
            <Input
              label="City / Location"
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={!isEditing}
              required
            />
            <Input
              label="Contact Phone"
              value={formData.contact || ""}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-row" style={{ marginTop: "16px" }}>
            <Input
              label="Email Address"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              required
            />
            <Input
              label="Full Street Address"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </Card>

        {isEditing && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(hospital);
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

export default HospitalProfile;
