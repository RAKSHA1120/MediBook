import { Star, Building2, MapPin, Briefcase, Calendar } from "lucide-react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import "./DoctorCard.css";

function DoctorCard({ doctor, onViewProfile, onBook, className = "" }) {
  if (!doctor) return null;

  const {
    id,
    name = "Dr. Emily Carter",
    specialty = "Cardiology",
    qualification = "MBBS, MD",
    hospital = "MediCare Hospital",
    location = "Chennai",
    experience = 12,
    rating = 4.8,
    reviewCount = 124,
    consultationFee = 800,
    availability = "Available Today"
  } = doctor;

  // Compute initials
  const initials = name
    .split(" ")
    .filter((n) => n.toLowerCase() !== "dr.")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "DR";

  return (
    <div className={`doctor-card-component ${className}`}>
      {/* Header: Avatar, Name, Specialty, Rating */}
      <div className="doctor-card-header">
        <div className="doctor-card-avatar">{initials}</div>

        <div className="doctor-card-info">
          <h3 className="doctor-card-name">{name}</h3>
          <span className="doctor-card-spec">{specialty}</span>
          {qualification && <span className="doctor-card-qual">{qualification}</span>}
        </div>

        <div className="doctor-card-rating-badge">
          <Star size={13} fill="#a16207" />
          <span>{rating}</span>
          <span style={{ fontSize: "11px", opacity: 0.8 }}>({reviewCount})</span>
        </div>
      </div>

      {/* Details Grid: Hospital, Location, Experience, Fee */}
      <div className="doctor-card-details-grid">
        <div className="doctor-detail-item" title={hospital}>
          <Building2 size={14} />
          <span>{hospital}</span>
        </div>

        <div className="doctor-detail-item" title={location}>
          <MapPin size={14} />
          <span>{location}</span>
        </div>

        <div className="doctor-detail-item">
          <Briefcase size={14} />
          <span>{experience} years exp.</span>
        </div>

        <div className="doctor-detail-item">
          <Calendar size={14} />
          <span>
            Fee: <strong>₹{consultationFee}</strong>
          </span>
        </div>
      </div>

      {/* Actions: View Profile & Book */}
      <div className="doctor-card-actions">
        {onViewProfile && (
          <SecondaryButton onClick={() => onViewProfile(doctor)}>
            View Profile
          </SecondaryButton>
        )}

        {onBook && (
          <PrimaryButton onClick={() => onBook(doctor)}>
            Book Appointment
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

export default DoctorCard;
