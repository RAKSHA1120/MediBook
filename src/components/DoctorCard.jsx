import { Star, Building2, MapPin, Briefcase, Calendar } from "lucide-react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import "./DoctorCard.css";

function DoctorCard({ doctor, onViewProfile, onBook, className = "" }) {
  if (!doctor) return null;

  const rawName = doctor.name || "Medical Specialist";
  const name = rawName.toLowerCase().startsWith("dr.") ? rawName : `Dr. ${rawName}`;
  const specialty = doctor.specialty || doctor.specialization || "General Physician";
  const qualification = doctor.qualification || "MBBS, MD";
  const hospital = doctor.hospital || "MediCare Hospital";
  const location = doctor.location || "Chennai";
  const experience = typeof doctor.experience === "number" ? doctor.experience : parseInt(doctor.experience) || 10;
  const rating = doctor.rating !== undefined ? doctor.rating : 4.8;
  const reviewCount = doctor.reviewCount !== undefined ? doctor.reviewCount : 124;
  const consultationFee = doctor.consultationFee !== undefined ? doctor.consultationFee : (doctor.fee !== undefined ? doctor.fee : 800);

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
          <span>{experience} yrs exp.</span>
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
