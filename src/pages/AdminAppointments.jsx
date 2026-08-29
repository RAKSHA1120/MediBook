import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import SearchBox from "../components/SearchBox";
import StatusBadge from "../components/StatusBadge";
import Tabs from "../components/Tabs";
import { useNavigate } from "react-router-dom";
import { getAppointments, updateAppointmentStatus } from "../utils/storage";
import "./AdminShared.css";

function AdminAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    setAppointments(getAppointments());
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const tabs = [
    { id: "All", label: "All" },
    { id: "Upcoming", label: "Upcoming" },
    { id: "Pending", label: "Pending" },
    { id: "Completed", label: "Completed" },
    { id: "Cancelled", label: "Cancelled" }
  ];

  let filteredAppointments = appointments.filter(apt => 
    (apt.patientName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (apt.doctorName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (activeTab !== "All") {
    filteredAppointments = filteredAppointments.filter(apt => {
      const s = String(apt.status || "").toLowerCase();
      const norm = s === 'scheduled' || s === 'confirmed' ? 'upcoming' : s;
      return norm === activeTab.toLowerCase();
    });
  }

  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title="Appointment Management" 
        subtitle="Monitor and manage all system appointments"
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="admin-table-card" style={{ marginTop: "0", borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
        <div className="admin-toolbar">
          <SearchBox 
            placeholder="Search by patient or doctor name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ display: "flex", gap: "10px" }}>
             <Button variant="outline">Filter Date</Button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(apt => (
                <tr key={apt.id}>
                  <td><strong>{apt.id}</strong></td>
                  <td>{apt.patientName}</td>
                  <td>{apt.doctorName}</td>
                  <td>{apt.date}, {apt.time}</td>
                  <td>{apt.type}</td>
                  <td className="nowrap">
                    <StatusBadge status={apt.status} />
                  </td>
                  <td className="nowrap">
                    <div className="action-buttons">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/appointments/${apt.id}`)}>Details</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-xl text-gray">
                    No appointments found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminAppointments;
