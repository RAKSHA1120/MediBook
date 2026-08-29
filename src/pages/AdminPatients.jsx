import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import SearchBox from "../components/SearchBox";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import Input from "../components/Input";
import { getPatients, updatePatient, deletePatient } from "../utils/storage";
import "./AdminShared.css";

function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    setPatients(getPatients());
  }, []);

  const filteredPatients = patients.filter(p => 
    (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.contact?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.id?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setIsEditing(false);
    setIsViewModalOpen(true);
  };

  const handleUpdatePatient = (e) => {
    e.preventDefault();
    updatePatient(selectedPatient.id, selectedPatient);
    setPatients(getPatients());
    setIsEditing(false);
  };

  const handleStatusChange = (patient, newStatus) => {
    updatePatient(patient.id, { ...patient, status: newStatus });
    setPatients(getPatients());
    if (selectedPatient && selectedPatient.id === patient.id) {
       setSelectedPatient({ ...selectedPatient, status: newStatus });
    }
  };

  const handleDeletePatient = (patient) => {
    if (window.confirm(`Are you sure you want to delete patient ${patient.name}? This action cannot be undone.`)) {
      deletePatient(patient.id);
      setPatients(getPatients());
      if (selectedPatient && selectedPatient.id === patient.id) {
        setIsViewModalOpen(false);
        setSelectedPatient(null);
      }
    }
  };

  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title="Patient Management" 
        subtitle="View and manage patient records across the system"
      />

      <div className="admin-table-card">
        <div className="admin-toolbar">
          <SearchBox 
            placeholder="Search patients by name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ display: "flex", gap: "10px" }}>
             <Button variant="outline">Filter by Status</Button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age & Gender</th>
                <th>Contact</th>
                <th>Registration Date</th>
                <th>Appointments</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar" style={{backgroundColor: "var(--secondary-color)"}}>{p.name.charAt(0)}</div>
                      <div className="user-details">
                        <span className="user-name">{p.name}</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.age} yrs, {p.gender}</td>
                  <td>{p.contact}</td>
                  <td>{p.date}</td>
                  <td>{p.appointments}</td>
                  <td className="nowrap">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="nowrap">
                    <div className="action-buttons">
                      <Button variant="outline" size="sm" onClick={() => handleViewPatient(p)}>View</Button>
                      <Button variant="outline" size="sm" style={{ color: "#ef4444", borderColor: "#fca5a5", backgroundColor: "#fff" }} onClick={() => handleDeletePatient(p)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-xl text-gray">
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View / Edit Patient Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)}
        title={isEditing ? "Edit Patient" : "Patient Details"}
      >
        {selectedPatient && (
          <form onSubmit={handleUpdatePatient} className="add-doctor-form">
            <div className="form-row">
              <Input label="Patient Name" name="name" value={selectedPatient.name} onChange={(e) => setSelectedPatient({...selectedPatient, name: e.target.value})} disabled={!isEditing} />
              <Input label="Contact (Phone)" name="contact" value={selectedPatient.contact} onChange={(e) => setSelectedPatient({...selectedPatient, contact: e.target.value})} disabled={!isEditing} />
            </div>
            <div className="form-row">
              <Input label="Age" name="age" type="number" value={selectedPatient.age || ""} onChange={(e) => setSelectedPatient({...selectedPatient, age: e.target.value})} disabled={!isEditing} />
              <div className="input-group">
                <label className="input-label">Gender</label>
                <select className="field-select" value={selectedPatient.gender || ""} onChange={(e) => setSelectedPatient({...selectedPatient, gender: e.target.value})} disabled={!isEditing}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <Input label="Patient ID" name="id" value={selectedPatient.id} disabled={true} />
              <div className="input-group">
                <label className="input-label">Status</label>
                <div style={{ padding: "8px 0" }}>
                  <StatusBadge status={selectedPatient.status} />
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: "space-between", marginTop: "24px" }}>
              <div>
                 {!isEditing && selectedPatient.status === "Active" && (
                    <Button variant="outline" type="button" onClick={() => handleStatusChange(selectedPatient, "Inactive")}>Deactivate</Button>
                 )}
                 {!isEditing && selectedPatient.status !== "Active" && (
                    <Button variant="primary" type="button" onClick={() => handleStatusChange(selectedPatient, "Active")}>Activate</Button>
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

    </div>
  );
}

export default AdminPatients;
