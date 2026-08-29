import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import SearchBox from "../components/SearchBox";
import Modal from "../components/Modal";
import Input from "../components/Input";
import StatusBadge from "../components/StatusBadge";
import { getDoctors, addDoctor, updateDoctor, addUser, deleteDoctor } from "../utils/storage";
import { generateLoginId, generatePassword } from "../utils/idGenerator";
import "./AdminDoctors.css";
import "./AdminShared.css";

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setDoctors(getDoctors());
  }, []);

  // New Doctor Form State
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    specialization: "",
    hospital: "",
    experience: "",
    email: "",
    phone: ""
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddDoctor = (e) => {
    e.preventDefault();
    
    const dobYear = formData.dob ? formData.dob.split("-")[0] : new Date().getFullYear();
    const loginId = generateLoginId(formData.name, dobYear, doctors);
    const password = generatePassword(formData.name, dobYear);

    const newDoc = {
      id: `D_${Date.now()}`,
      name: formData.name,
      dob: formData.dob,
      specialization: formData.specialization,
      hospital: formData.hospital,
      experience: formData.experience,
      email: formData.email,
      contact: formData.phone,
      phone: formData.phone,
      status: "Active",
      loginId: loginId
    };

    addDoctor(newDoc);
    addUser({
       id: `U_DOC_${newDoc.id}`,
       mobile: loginId,
       password,
       role: "doctor",
       name: formData.name,
       refId: newDoc.id
    });

    setDoctors(getDoctors());
    setNewCredentials({ name: formData.name, loginId, password });
    
    setIsAddModalOpen(false);
    setIsSuccessModalOpen(true);
    setFormData({ name: "", dob: "", specialization: "", hospital: "", experience: "", email: "", phone: "" });
  };

  const filteredDoctors = doctors.filter(doc => 
    (doc.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (doc.specialization?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (doc.loginId?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleViewDoctor = (doc) => {
    setSelectedDoctor(doc);
    setIsEditing(false);
    setIsViewModalOpen(true);
  };

  const handleUpdateDoctor = (e) => {
    e.preventDefault();
    updateDoctor(selectedDoctor.id, selectedDoctor);
    setDoctors(getDoctors());
    setIsEditing(false);
  };

  const handleStatusChange = (doc, newStatus) => {
    updateDoctor(doc.id, { status: newStatus });
    setDoctors(getDoctors());
    if (selectedDoctor && selectedDoctor.id === doc.id) {
       setSelectedDoctor({ ...selectedDoctor, status: newStatus });
    }
  };

  const handleDeleteDoctor = (doc) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${doc.name.replace(/^(dr\.|dr\s)/i, '')}? This action cannot be undone.`)) {
      deleteDoctor(doc.id);
      setDoctors(getDoctors());
      if (selectedDoctor && selectedDoctor.id === doc.id) {
        setIsViewModalOpen(false);
        setSelectedDoctor(null);
      }
    }
  };

  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title="Doctor Management" 
        subtitle="Manage doctors and their credentials in the system"
      >
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          Add New Doctor
        </Button>
      </PageHeader>

      <div className="admin-table-card">
        <div className="admin-toolbar">
          <SearchBox 
            placeholder="Search doctors by name, specialty or login ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Login ID</th>
                <th>Specialization</th>
                <th>Hospital</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">{doc.name.charAt(0)}</div>
                      <div className="user-details">
                        <span className="user-name">Dr. {doc.name.replace(/^(dr\.|dr\s)/i, '')}</span>
                        <span className="user-subtext">{doc.contact}</span>
                      </div>
                    </div>
                  </td>
                  <td>{doc.loginId || "N/A"}</td>
                  <td>{doc.specialization}</td>
                  <td>{doc.hospital}</td>
                  <td>{doc.experience}</td>
                  <td className="nowrap">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="nowrap">
                    <div className="action-buttons">
                      <Button variant="outline" size="sm" onClick={() => handleViewDoctor(doc)}>View</Button>
                      <Button variant="outline" size="sm" style={{ color: "#ef4444", borderColor: "#fca5a5", backgroundColor: "#fff" }} onClick={() => handleDeleteDoctor(doc)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-xl text-gray">
                    No doctors found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Doctor Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Doctor"
      >
        <form onSubmit={handleAddDoctor} className="add-doctor-form">
          <div className="form-row">
            <Input label="Doctor Name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Arun Kumar" />
            <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} required />
          </div>
          <div className="form-row">
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="e.g. doctor@example.com" />
            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="e.g. 9876543210" />
          </div>
          <div className="form-row">
            <Input label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} required placeholder="e.g. Cardiology" />
            <Input label="Hospital/Clinic" name="hospital" value={formData.hospital} onChange={handleInputChange} required placeholder="e.g. City Hospital" />
          </div>
          <div className="form-row">
            <Input label="Experience" name="experience" value={formData.experience} onChange={handleInputChange} required placeholder="e.g. 10 years" />
            <div style={{flex: 1}}></div>
          </div>
          
          <div className="modal-actions">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Doctor Account</Button>
          </div>
        </form>
      </Modal>

      {/* View / Edit Doctor Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)}
        title={isEditing ? "Edit Doctor" : "Doctor Details"}
      >
        {selectedDoctor && (
          <form onSubmit={handleUpdateDoctor} className="add-doctor-form">
            <div className="form-row">
              <Input label="Doctor Name" name="name" value={selectedDoctor.name || (isEditing ? "" : "N/A")} onChange={(e) => setSelectedDoctor({...selectedDoctor, name: e.target.value})} disabled={!isEditing} />
              <Input label="Specialization" name="specialization" value={selectedDoctor.specialization || (isEditing ? "" : "N/A")} onChange={(e) => setSelectedDoctor({...selectedDoctor, specialization: e.target.value})} disabled={!isEditing} />
            </div>
            <div className="form-row">
              <Input label="Hospital/Clinic" name="hospital" value={selectedDoctor.hospital || (isEditing ? "" : "N/A")} onChange={(e) => setSelectedDoctor({...selectedDoctor, hospital: e.target.value})} disabled={!isEditing} />
              <Input label="Experience" name="experience" value={selectedDoctor.experience || (isEditing ? "" : "N/A")} onChange={(e) => setSelectedDoctor({...selectedDoctor, experience: e.target.value})} disabled={!isEditing} />
            </div>
            <div className="form-row">
              <Input label="Email" name="email" value={selectedDoctor.email || (isEditing ? "" : "N/A")} onChange={(e) => setSelectedDoctor({...selectedDoctor, email: e.target.value})} disabled={!isEditing} />
              <Input label="Phone" name="contact" value={selectedDoctor.contact || selectedDoctor.phone || (isEditing ? "" : "N/A")} onChange={(e) => setSelectedDoctor({...selectedDoctor, contact: e.target.value})} disabled={!isEditing} />
            </div>
            <div className="form-row">
              <Input label="Date of Birth" name="dob" value={selectedDoctor.dob || selectedDoctor.dobYear || (isEditing ? "" : "N/A")} onChange={(e) => setSelectedDoctor({...selectedDoctor, dob: e.target.value})} disabled={!isEditing} />
              <Input label="Login ID" name="loginId" value={selectedDoctor.loginId || "N/A"} disabled={true} />
            </div>
            <div className="form-row">
              <div className="input-group" style={{ position: "relative" }}>
                <Input 
                  label="Password" 
                  name="password" 
                  type={showPassword ? "text" : "password"}
                  value={selectedDoctor.password || "N/A"} 
                  disabled={true} 
                  style={{ paddingRight: "40px" }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "34px", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="input-group">
                <label className="input-label">Status</label>
                <div style={{ padding: "8px 0" }}>
                  <StatusBadge status={selectedDoctor.status || "N/A"} />
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: "space-between" }}>
              <div>
                 {!isEditing && selectedDoctor.status === "Active" && (
                    <Button variant="outline" type="button" onClick={() => handleStatusChange(selectedDoctor, "Inactive")}>Deactivate</Button>
                 )}
                 {!isEditing && selectedDoctor.status !== "Active" && (
                    <Button variant="primary" type="button" onClick={() => handleStatusChange(selectedDoctor, "Active")}>Activate</Button>
                 )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                 {!isEditing ? (
                   <Button variant="primary" type="button" onClick={() => setIsEditing(true)}>Edit Details</Button>
                 ) : (
                   <>
                     <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                     <Button variant="primary" type="submit">Save Changes</Button>
                   </>
                 )}
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Success & Credentials Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Doctor Account Created Successfully"
      >
        {newCredentials && (
          <div className="credentials-container">
            <p className="success-message">
              The account for <strong>{newCredentials.name}</strong> has been created. Please share these credentials securely.
            </p>
            
            <div className="credential-box">
              <div className="credential-row">
                <span className="credential-label">Login ID:</span>
                <span className="credential-value">{newCredentials.loginId}</span>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(newCredentials.loginId)}>
                  Copy ID
                </Button>
              </div>
              <div className="credential-row">
                <span className="credential-label">Temporary Password:</span>
                <span className="credential-value password-value">{newCredentials.password}</span>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(newCredentials.password)}>
                  Copy Password
                </Button>
              </div>
            </div>

            <div className="modal-actions">
              <Button variant="primary" onClick={() => setIsSuccessModalOpen(false)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminDoctors;
