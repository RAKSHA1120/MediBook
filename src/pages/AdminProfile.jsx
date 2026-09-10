import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import ProfileImageUploader from "../components/ProfileImageUploader";
import { getCurrentUser } from "../utils/auth";
import { useState, useEffect } from "react";

function AdminProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);
  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title="Admin Profile" 
        subtitle="Manage your administrative profile"
      />

      <Card style={{ marginTop: "var(--spacing-lg)", maxWidth: "600px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
          <ProfileImageUploader 
            currentImageUrl={user?.profileImageUrl} 
            onImageUpdated={(newImageUrl) => {
              if (user) {
                const updatedUser = { ...user, profileImageUrl: newImageUrl };
                setUser(updatedUser);
                sessionStorage.setItem("medibook_current_user", JSON.stringify(updatedUser));
                window.dispatchEvent(new Event("medibook_current_user_updated"));
              }
            }} 
          />
          <div>
            <h3 style={{ margin: 0 }}>System Admin</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>Administrator Role</p>
          </div>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
           <Input label="Full Name" value="System Admin" readOnly />
           <Input label="Email" value="admin@medibook.com" readOnly />
           <Input label="Phone" value="+1 234 567 8900" readOnly />
           
           <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--spacing-md)" }}>
             <Button variant="primary" type="button">Edit Profile</Button>
           </div>
        </form>
      </Card>
    </div>
  );
}

export default AdminProfile;
