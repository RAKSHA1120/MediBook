import React from "react";
import { Calendar, Clock, ShieldCheck, CalendarDays } from "lucide-react";
import Button from "./Button";
import "./BookingSummary.css";

function BookingSummary({
  doctor,
  selectedDate,
  formattedDate,
  selectedTime,
  consultationFee,
  onConfirm,
  isConfirmed = false
}) {
  const fee = consultationFee || doctor?.consultationFee || 0;
  const total = fee; // Total = Consultation Fee

  const isSelectionComplete = Boolean(selectedDate && selectedTime);

  return (
    <div className="summary-sticky-card">
      <h3 className="summary-card-title">Booking Summary</h3>

      {isSelectionComplete ? (
        <div className="summary-card-details">
          {/* Doctor Info */}
          <div className="summary-item">
            <span className="summary-item-label">Doctor</span>
            <strong className="summary-item-value">{doctor?.name}</strong>
            <span className="summary-item-sub">{doctor?.specialty}</span>
          </div>

          {/* Hospital */}
          <div className="summary-item">
            <span className="summary-item-label">Hospital</span>
            <strong className="summary-item-value">{doctor?.hospital}</strong>
            {doctor?.location && (
              <span className="summary-item-sub">{doctor.location}</span>
            )}
          </div>

          {/* Date & Time */}
          <div className="summary-item">
            <span className="summary-item-label">Date & Time</span>
            <div className="summary-dt-badges">
              <div className="summary-dt-badge">
                <Calendar size={14} />
                <span>{formattedDate || selectedDate}</span>
              </div>
              <div className="summary-dt-badge slot-badge">
                <Clock size={14} />
                <span>{selectedTime}</span>
              </div>
            </div>
          </div>

          <div className="summary-divider"></div>

          {/* Fee & Total */}
          <div className="summary-fee-row">
            <span>Consultation Fee</span>
            <span>₹{fee}</span>
          </div>

          <div className="summary-fee-row total-row">
            <span>Total</span>
            <strong className="fee-total-amount">₹{total}</strong>
          </div>

          <div className="summary-notice">
            <ShieldCheck size={14} className="notice-icon" />
            <span>No pre-payment required. Pay directly at the hospital counter.</span>
          </div>

          <Button
            variant="primary"
            className="btn-confirm-appointment"
            onClick={onConfirm}
            disabled={isConfirmed}
          >
            Confirm Appointment
          </Button>
        </div>
      ) : (
        /* Empty State */
        <div className="summary-placeholder">
          <CalendarDays size={48} className="placeholder-icon" />
          <p className="placeholder-text">
            Please select an available date and a time slot to view your booking summary and confirm your appointment.
          </p>

          <div className="summary-divider"></div>

          <div className="summary-fee-row">
            <span>Consultation Fee</span>
            <span>₹{fee}</span>
          </div>

          <div className="summary-fee-row total-row">
            <span>Total</span>
            <strong className="fee-total-amount">₹{total}</strong>
          </div>

          <Button
            variant="primary"
            className="btn-confirm-appointment"
            disabled={true}
          >
            Confirm Appointment
          </Button>
        </div>
      )}
    </div>
  );
}

export default BookingSummary;
