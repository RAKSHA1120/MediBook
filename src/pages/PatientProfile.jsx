import { useState } from "react";
import Card from "../components/Card";

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
        <div>
            <h1>Patient Profile</h1>

            <Card>
                <div>
                    <div>
                        <div>Profile Photo</div>
                    </div>

                    <h2>{patient.name}</h2>
                </div>

                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={patient.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div>
                    <label>Mobile</label>
                    <input
                        type="text"
                        name="mobile"
                        value={patient.mobile}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={patient.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div>
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        name="dob"
                        value={patient.dob}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div>
                    <label>Gender</label>
                    <select
                        name="gender"
                        value={patient.gender}
                        onChange={handleChange}
                        disabled={!isEditing}
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label>Blood Group</label>
                    <select
                        name="bloodGroup"
                        value={patient.bloodGroup}
                        onChange={handleChange}
                        disabled={!isEditing}
                    >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>

                <div>
                    <label>Address</label>
                    <textarea
                        name="address"
                        value={patient.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)}>
                            Edit
                        </button>
                    ) : (
                        <button onClick={handleSave}>
                            Save
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
}

export default PatientProfile;