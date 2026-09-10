import React, { useState, useRef } from "react";
import { Upload, Trash2, User, Loader2 } from "lucide-react";
import { api, BASE_URL } from "../utils/api";
import "./ProfileImageUploader.css";

function ProfileImageUploader({ currentImageUrl, onImageUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const displayUrl = preview || (currentImageUrl ? `${BASE_URL.replace('/api', '')}${currentImageUrl}` : null);

  const handleFileChange = (e) => {
    setError(null);
    setSuccess(null);
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WEBP formats are allowed.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const response = await api.uploadFile("Profile/upload-image", selectedFile);
    
    if (response.success) {
      setSuccess("Profile image updated successfully.");
      setPreview(null); // Clear preview to rely on the backend URL now
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onImageUpdated) onImageUpdated(response.data.profileImageUrl);
    } else {
      setError(response.error || "Failed to upload image.");
    }
    setLoading(false);
  };

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to remove your profile image?")) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const response = await api.delete("Profile/remove-image");
    
    if (response.success) {
      setSuccess("Profile image removed.");
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onImageUpdated) onImageUpdated(null);
    } else {
      setError(response.error || "Failed to remove image.");
    }
    setLoading(false);
  };

  return (
    <div className="profile-img-uploader">
      <div className="profile-img-preview-wrapper">
        {displayUrl ? (
          <img src={displayUrl} alt="Profile" className="profile-img-preview" />
        ) : (
          <User size={56} className="profile-img-default" />
        )}
      </div>

      <input 
        type="file" 
        accept="image/jpeg, image/png, image/webp" 
        className="profile-img-input" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="profile-img-actions">
        {error && <div className="profile-img-msg msg-error">{error}</div>}
        {success && <div className="profile-img-msg msg-success">{success}</div>}

        {selectedFile ? (
          <div className="profile-img-actions-row">
            <button className="btn-upload" onClick={handleUpload} disabled={loading}>
              {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Save"}
            </button>
            <button className="btn-remove" onClick={() => {
              setSelectedFile(null);
              setPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }} disabled={loading}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="profile-img-actions-row">
            <button className="btn-upload" onClick={() => fileInputRef.current?.click()} disabled={loading}>
              <Upload size={16} /> Change Photo
            </button>
            {currentImageUrl && (
              <button className="btn-remove" onClick={handleRemove} disabled={loading} title="Remove Photo">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileImageUploader;
