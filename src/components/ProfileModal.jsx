import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, X, User, Activity, MapPin, Mail, Phone, Heart, Award, Clock, DollarSign, BookOpen } from "lucide-react";
import { api, BASE_URL } from "../utils/api";
import "./ProfileModal.css";

const profileCache = {
  patient: {},
  doctor: {},
  hospital: {}
};

function ProfileModal({ isOpen, onClose, type, id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && id) {
      fetchProfileData();
    }
  }, [isOpen, id, type]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const fetchProfileData = async () => {
    if (profileCache[type] && profileCache[type][id]) {
      setData(profileCache[type][id]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let endpoint = "";
      if (type === "patient") endpoint = `/Patients/${id}`;
      else if (type === "doctor") endpoint = `/Doctors/${id}`;
      else if (type === "hospital") endpoint = `/Hospitals/${id}`;
      
      if (!endpoint) throw new Error("Invalid profile type");

      const response = await api.get(endpoint);
      if (response.success && response.data) {
        profileCache[type][id] = response.data;
        setData(response.data);
      } else {
        throw new Error(response.error || "Failed to load profile");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="pm-loading">
          <Loader2 size={32} className="pm-spin" />
          <span>Loading profile...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="pm-error">
          <AlertCircle size={32} />
          <span>{error}</span>
        </div>
      );
    }

    if (!data) return null;

    const name = data.name || "Unknown";
    const initials = name.substring(0, 2).toUpperCase();
    const isActive = data.isActive !== false && data.status !== "Inactive";
    const avatarUrl = data.profileImageUrl ? `${BASE_URL.replace('/api', '')}${data.profileImageUrl}` : null;

    const renderAvatar = () => {
      if (avatarUrl) {
        return <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />;
      }
      return initials;
    };

    if (type === "patient") {
      return (
        <>
          <div className="pm-profile-header">
            <div className="pm-avatar">{renderAvatar()}</div>
            <div className="pm-profile-meta">
              <h3 className="pm-profile-name">{name}</h3>
              <div className="pm-badges">
                <span className="pm-type-badge">Patient</span>
                <span className={`pm-status-badge ${isActive ? 'pm-badge-active' : 'pm-badge-inactive'}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          
          <h4 className="pm-section-title">Personal Details</h4>
          <div className="pm-fields-grid">
            <div className="pm-field"><span className="pm-field-label">Age</span><span className="pm-field-value">{data.age || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Gender</span><span className="pm-field-value">{data.gender || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Blood Group</span><span className="pm-field-value">{data.bloodGroup || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Mobile</span><span className="pm-field-value">{data.mobile || data.phone || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Email</span><span className="pm-field-value">{data.email || 'N/A'}</span></div>
          </div>

          <h4 className="pm-section-title">Address</h4>
          <div className="pm-fields-grid">
            <div className="pm-field" style={{ gridColumn: '1 / -1' }}><span className="pm-field-label">Street</span><span className="pm-field-value">{data.address || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">City</span><span className="pm-field-value">{data.city || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">State</span><span className="pm-field-value">{data.state || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Pincode</span><span className="pm-field-value">{data.pincode || 'N/A'}</span></div>
          </div>
        </>
      );
    }

    if (type === "doctor") {
      return (
        <>
          <div className="pm-profile-header">
            <div className="pm-avatar">{renderAvatar()}</div>
            <div className="pm-profile-meta">
              <h3 className="pm-profile-name">{name}</h3>
              <div className="pm-badges">
                <span className="pm-type-badge">Doctor</span>
                <span className={`pm-status-badge ${isActive ? 'pm-badge-active' : 'pm-badge-inactive'}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <h4 className="pm-section-title">Professional Info</h4>
          <div className="pm-fields-grid">
            <div className="pm-field"><span className="pm-field-label">Specialty</span><span className="pm-field-value">{data.specialty || data.specialization || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Qualification</span><span className="pm-field-value">{data.qualification || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Experience</span><span className="pm-field-value">{data.experience ? `${data.experience} Years` : 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Consultation Fee</span><span className="pm-field-value">{data.consultationFee ? `₹${data.consultationFee}` : 'N/A'}</span></div>
            <div className="pm-field" style={{ gridColumn: '1 / -1' }}><span className="pm-field-label">Registration Number</span><span className="pm-field-value">{data.registrationNumber || 'N/A'}</span></div>
            <div className="pm-field" style={{ gridColumn: '1 / -1' }}><span className="pm-field-label">Hospital</span><span className="pm-field-value">{data.hospital?.name || 'N/A'}</span></div>
          </div>

          <h4 className="pm-section-title">Contact Info</h4>
          <div className="pm-fields-grid">
            <div className="pm-field"><span className="pm-field-label">Phone</span><span className="pm-field-value">{data.phone || data.mobile || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Email</span><span className="pm-field-value">{data.email || 'N/A'}</span></div>
          </div>
        </>
      );
    }

    if (type === "hospital") {
      return (
        <>
          <div className="pm-profile-header">
            <div className="pm-avatar">{renderAvatar()}</div>
            <div className="pm-profile-meta">
              <h3 className="pm-profile-name">{name}</h3>
              <div className="pm-badges">
                <span className="pm-type-badge">Hospital</span>
                <span className={`pm-status-badge ${isActive ? 'pm-badge-active' : 'pm-badge-inactive'}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <h4 className="pm-section-title">Hospital Details</h4>
          <div className="pm-fields-grid">
            <div className="pm-field"><span className="pm-field-label">Type</span><span className="pm-field-value">{data.type || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Category</span><span className="pm-field-value">{data.category || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Bed Capacity</span><span className="pm-field-value">{data.bedCapacity || 'N/A'}</span></div>
          </div>

          <h4 className="pm-section-title">Contact & Location</h4>
          <div className="pm-fields-grid">
            <div className="pm-field"><span className="pm-field-label">Phone</span><span className="pm-field-value">{data.phone || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">Email</span><span className="pm-field-value">{data.email || 'N/A'}</span></div>
            <div className="pm-field" style={{ gridColumn: '1 / -1' }}><span className="pm-field-label">Address</span><span className="pm-field-value">{data.address || 'N/A'}</span></div>
            <div className="pm-field"><span className="pm-field-label">City</span><span className="pm-field-value">{data.city || 'N/A'}</span></div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pm-modal-header">
          <div className="pm-header-icon">
            <User size={20} />
          </div>
          <h2 className="pm-modal-title">
            {type === "patient" ? "Patient Profile" : type === "doctor" ? "Doctor Profile" : "Hospital Profile"}
          </h2>
          <button className="pm-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="pm-modal-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
