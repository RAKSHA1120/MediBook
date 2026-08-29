import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import { Headset, HelpCircle, Mail, Phone } from "lucide-react";

function AdminHelpSupport() {
  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title="Help & Support" 
        subtitle="Get assistance with system administration"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginTop: "24px" }}>
        <Card>
           <h3 style={{ margin: "0 0 16px 0", color: "#0f172a", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
             <Headset size={20} color="#0284c7" /> Contact Technical Support
           </h3>
           <p style={{ color: "#64748b", marginBottom: "20px" }}>Our enterprise support team is available 24/7 for critical system issues.</p>
           
           <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155" }}>
               <Mail size={16} color="#64748b" /> <strong>Email:</strong> admin-support@medibook.com
             </div>
             <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155" }}>
               <Phone size={16} color="#64748b" /> <strong>Phone:</strong> 1-800-MED-SYS1
             </div>
           </div>

           <Button variant="primary">Open Support Ticket</Button>
        </Card>

        <Card>
           <h3 style={{ margin: "0 0 16px 0", color: "#0f172a", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
             <HelpCircle size={20} color="#0284c7" /> Administrator FAQ
           </h3>
           <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
             <div>
               <strong style={{ color: "#334155", display: "block", marginBottom: "4px" }}>How do I onboard a new doctor?</strong>
               <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>Navigate to the Doctors section and click 'Add New Doctor'. An ID and Password will be automatically generated.</p>
             </div>
             <div>
               <strong style={{ color: "#334155", display: "block", marginBottom: "4px" }}>How can I reset a user's password?</strong>
               <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>Go to their profile in the management views and select 'Reset Credentials' in the actions menu.</p>
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminHelpSupport;
