import { useState, useEffect } from "react";
import { Lock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getUsers, clearCurrentUser } from "../utils/storage";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

function DoctorSettings() {
    const navigate = useNavigate();
    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const user = getCurrentUser();
        if (!user) return;

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex === -1) {
            setError("User record not found.");
            return;
        }

        if (users[userIndex].password !== passwordData.current) {
            setError("Current password is incorrect.");
            return;
        }

        if (passwordData.new !== passwordData.confirm) {
            setError("New passwords do not match.");
            return;
        }

        if (passwordData.new.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        // Update password
        users[userIndex].password = passwordData.new;
        localStorage.setItem("medibook_users", JSON.stringify(users));

        setSuccess("Password updated successfully!");
        setPasswordData({ current: "", new: "", confirm: "" });
    };

    const handleLogout = () => {
        clearCurrentUser();
        navigate("/login");
    };

    return (
        <main className="patient-dashboard-content">
            <PageHeader title="Settings" subtitle="Manage your account settings and security." />

            <div className="dashboard-main-info-grid">
                <div className="next-appointment-column">
                    <Card>
                        <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Lock size={20} color="#0284c7" /> Change Password
                        </h3>

                        {error && <div style={{ padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "8px", marginBottom: "16px", border: "1px solid #fca5a5" }}>{error}</div>}
                        {success && <div style={{ padding: "12px", backgroundColor: "#f0fdf4", color: "#22c55e", borderRadius: "8px", marginBottom: "16px", border: "1px solid #86efac" }}>{success}</div>}

                        <form onSubmit={handlePasswordChange} className="add-doctor-form">
                            <Input 
                                label="Current Password" 
                                type="password" 
                                value={passwordData.current} 
                                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} 
                                required 
                            />
                            <div className="form-row">
                                <Input 
                                    label="New Password" 
                                    type="password" 
                                    value={passwordData.new} 
                                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} 
                                    required 
                                />
                                <Input 
                                    label="Confirm New Password" 
                                    type="password" 
                                    value={passwordData.confirm} 
                                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} 
                                    required 
                                />
                            </div>
                            
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                                <Button variant="primary" type="submit">Update Password</Button>
                            </div>
                        </form>
                    </Card>

                    <Card style={{ marginTop: "24px" }}>
                        <h3 style={{ margin: "0 0 16px 0", color: "#0f172a", fontSize: "1.25rem" }}>Session Management</h3>
                        <p style={{ color: "#64748b", marginBottom: "20px" }}>
                            Log out of your account. You will need your Login ID and Password to sign back in.
                        </p>
                        <Button variant="outline" onClick={handleLogout} style={{ color: "#ef4444", borderColor: "#ef4444" }}>
                            <LogOut size={16} style={{marginRight: "8px"}} /> Log Out Securely
                        </Button>
                    </Card>
                </div>
            </div>
        </main>
    );
}

export default DoctorSettings;
