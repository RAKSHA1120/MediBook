import { useState } from "react";
import "./PatientProfile.css";

function PatientProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [patient, setPatient] = useState({
        name: "Priya Sharma",
        mobile: "+91 98765 43210",
        email: "priyasharma@email.com",
        dob: "1998-08-15",
        gender: "Female",
        bloodGroup: "O+",
        address: "12, Park Street, Anna Nagar,\nChennai - 600040, Tamil Nadu, India"
    });

    const handleChange = (e) => {
        setPatient({
            ...patient,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        setIsEditing(false);
        alert("Profile saved successfully!");
    };

    return (
        <div className="profile-page">
            <div className="profile-page-header">
                <h1>Patient Profile</h1>
                <p>View and manage your personal information</p>
            </div>

            {/* Profile Top Card */}
            <div className="profile-top-card">
                <div className="profile-avatar-container">
                    <img src="https://i.pravatar.cc/150?u=priyasharma" alt="Profile" className="profile-avatar-img" />
                    <button className="avatar-cam-btn">📷</button>
                </div>
                <div className="profile-top-info">
                    <h2>
                        {patient.name}
                        <span className="verified-badge">✓ Verified</span>
                    </h2>
                    <div className="profile-contacts">
                        <span className="contact-line">📞 {patient.mobile}</span>
                        <span className="contact-line">✉️ {patient.email}</span>
                    </div>
                </div>
            </div>

            {/* Personal Information Card */}
            <div className="profile-info-card">
                <div className="info-card-header">
                    <h3>👤 Personal Information</h3>
                    {!isEditing && (
                        <button className="edit-btn" onClick={() => setIsEditing(true)}>
                            ✏️ Edit
                        </button>
                    )}
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-with-icon">
                            <span className="input-icon">👤</span>
                            <input
                                type="text"
                                name="name"
                                value={patient.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mobile Number</label>
                        <div className="input-with-icon">
                            <span className="input-icon">📞</span>
                            <input
                                type="text"
                                name="mobile"
                                value={patient.mobile}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <span className="input-icon">✉️</span>
                            <input
                                type="email"
                                name="email"
                                value={patient.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Date of Birth</label>
                        <div className="input-with-icon">
                            <span className="input-icon">📅</span>
                            <input
                                type="date"
                                name="dob"
                                value={patient.dob}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Gender</label>
                        <div className="input-with-icon">
                            <span className="input-icon">👤</span>
                            <select
                                name="gender"
                                value={patient.gender}
                                onChange={handleChange}
                                disabled={!isEditing}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Blood Group</label>
                        <div className="input-with-icon">
                            <span className="input-icon">💧</span>
                            <select
                                name="bloodGroup"
                                value={patient.bloodGroup}
                                onChange={handleChange}
                                disabled={!isEditing}
                            >
                                <option>A+</option>
                                <option>A-</option>
                                <option>B+</option>
                                <option>B-</option>
                                <option>AB+</option>
                                <option>AB-</option>
                                <option>O+</option>
                                <option>O-</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Address</label>
                        <div className="input-with-icon">
                            <span className="input-icon" style={{ top: '14px' }}>📍</span>
                            <textarea
                                name="address"
                                value={patient.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Safe Box */}
            <div className="safe-box">
                <span className="safe-icon">🛡️</span>
                <div className="safe-text">
                    <h4>Your Information is Safe</h4>
                    <p>We keep your personal information secure and confidential.<br/>It is only used to enhance your healthcare experience.</p>
                </div>
            </div>

            {/* Actions */}
            {isEditing && (
                <div className="profile-actions">
                    <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                        Cancel
                    </button>
                    <button className="btn-save" onClick={handleSave}>
                        💾 Save Changes
                    </button>
                </div>
            )}
        </div>
    );
}

export default PatientProfile;