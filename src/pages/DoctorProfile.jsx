import { useState, useEffect } from "react";
import { User, Save } from "lucide-react";
import { getCurrentUser, getDoctors, updateDoctor, getUsers, setCurrentUser as updateStoredCurrentUser } from "../utils/storage";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

function DoctorProfile() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            const doctors = getDoctors();
            const myProfile = doctors.find(d => d.id === user.refId);
            if (myProfile) {
                setProfile(myProfile);
                setFormData(myProfile);
            }
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Update in doctors store
        updateDoctor(profile.id, formData);
        
        // Also update currentUser context if name changed
        const user = getCurrentUser();
        if (user) {
            const users = getUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex].name = formData.name;
                localStorage.setItem("medibook_users", JSON.stringify(users));
                
                user.name = formData.name;
                updateStoredCurrentUser(user);
            }
        }
        
        setProfile(formData);
        setIsEditing(false);
        alert("Profile updated successfully!");
    };

    if (!profile) return <div className="patient-dashboard-content">Loading...</div>;

    return (
        <main className="patient-dashboard-content">
            <PageHeader title="My Profile" subtitle="Manage your personal and professional information." />

            <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
                <Card>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
                            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <User size={40} color="#0284c7" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.5rem", margin: "0 0 4px 0", color: "#0f172a" }}>{profile.name}</h3>
                                <p style={{ margin: 0, color: "#64748b", fontSize: "1rem" }}>{profile.specialization}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="add-doctor-form">
                            <h4 style={{ margin: "0 0 16px 0", color: "#334155" }}>Personal Information</h4>
                            <div className="form-row">
                                <Input label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} disabled={!isEditing} required />
                                <Input label="Date of Birth (Year)" name="dobYear" type="text" value={formData.dobYear || formData.dob || ''} onChange={handleChange} disabled={!isEditing} />
                            </div>
                            <div className="form-row">
                                <Input label="Email" name="email" value={formData.email || ''} onChange={handleChange} disabled={!isEditing} />
                                <Input label="Phone Number" name="contact" value={formData.contact || formData.phone || ''} onChange={handleChange} disabled={!isEditing} />
                            </div>
                            
                            <h4 style={{ margin: "24px 0 16px 0", color: "#334155" }}>Professional Details</h4>
                            <div className="form-row">
                                <Input label="Specialization" name="specialization" value={formData.specialization || ''} onChange={handleChange} disabled={!isEditing} required />
                                <Input label="Experience" name="experience" value={formData.experience || ''} onChange={handleChange} disabled={!isEditing} />
                            </div>
                            <div className="form-row">
                                <Input label="Hospital/Clinic" name="hospital" value={formData.hospital || ''} onChange={handleChange} disabled={!isEditing} required />
                                <Input label="Consultation Fee" name="fee" type="number" value={formData.fee || ''} onChange={handleChange} disabled={!isEditing} />
                            </div>

                            <h4 style={{ margin: "24px 0 16px 0", color: "#334155" }}>Account Credentials</h4>
                            <div className="form-row">
                                <Input label="Login ID" name="loginId" value={profile.loginId || "N/A"} disabled={true} />
                                <div style={{flex: 1}}>
                                    {/* Empty div for spacing */}
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
                                {!isEditing ? (
                                    <Button variant="primary" type="button" onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="outline" type="button" onClick={() => { setIsEditing(false); setFormData(profile); }}>
                                            Cancel
                                        </Button>
                                        <Button variant="primary" type="submit">
                                            <Save size={16} style={{marginRight: "6px"}} /> Save Changes
                                        </Button>
                                    </>
                                )}
                            </div>
                        </form>
                </Card>
            </div>
        </main>
    );
}

export default DoctorProfile;
