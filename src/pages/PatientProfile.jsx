import { useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";

function PatientProfile() {
    const [isEditing, setIsEditing] = useState(false);

    const [patient, setPatient] = useState({
        name: "Santhosh S",
        mobile: "9655983149",
        email: "santhosh323454@gmail.com",
        dob: "2005-06-15",
        gender: "Male",
        bloodGroup: "B+",
        address: "Anthiyur, Tamil Nadu"
    });

    const handleChange = (e) => {
        setPatient({
            ...patient,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        setIsEditing(false);
        alert("Profile saved successfully");
    };

    return (
        <div className="page-container">

            <h1>Patient Profile</h1>

            <Card>

                <div className="profile-header">
                    <div className="profile-photo">
                        👤
                    </div>

                    <div>
                        <h2>{patient.name}</h2>
                        <p>Patient</p>
                    </div>
                </div>

                <div className="profile-grid">

                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={patient.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mobile</label>
                        <input
                            type="text"
                            name="mobile"
                            value={patient.mobile}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={patient.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={patient.dob}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group">
                        <label>Gender</label>
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

                    <div className="form-group">
                        <label>Blood Group</label>
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

                <div className="form-group">
                    <label>Address</label>

                    <textarea
                        name="address"
                        value={patient.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div className="profile-actions">

                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                    ) : (
                        <Button onClick={handleSave}>
                            Save Profile
                        </Button>
                    )}

                </div>

            </Card>

        </div>
    );
}

export default PatientProfile;