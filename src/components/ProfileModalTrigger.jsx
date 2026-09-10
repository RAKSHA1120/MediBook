import React, { useState } from "react";
import { Info } from "lucide-react";
import ProfileModal from "./ProfileModal";

function ProfileModalTrigger({ type, id, children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      {children}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        style={{
          background: "transparent",
          border: "none",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--primary, #2f6fa3)",
          borderRadius: "50%",
        }}
        title={`View ${type} profile`}
      >
        <Info size={16} />
      </button>

      <ProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={type} 
        id={id} 
      />
    </div>
  );
}

export default ProfileModalTrigger;
