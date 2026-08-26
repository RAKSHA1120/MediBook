import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Button from "../components/Button";
import Toast from "../components/Toast";
import AppointmentSlip from "../components/AppointmentSlip";
import { useAppointments } from "../context/AppointmentContext";
import { getStoredPatientProfile } from "../data/patientProfile";
import "./BookingSuccess.css";

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointments } = useAppointments();

  // Toast State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  // Retrieve booking state passed from AppointmentBooking
  const bookingState = location.state;

  // Patient profile data
  const patientData = useMemo(() => getStoredPatientProfile(), []);

  // Extract appointment parameters safely
  const appointmentId = bookingState?.appointmentId;
  const doctor = bookingState?.doctor;
  const specialty = bookingState?.specialty || doctor?.specialty;
  const hospital = bookingState?.hospital || doctor?.hospital;
  const displayDate = bookingState?.formattedDate || bookingState?.date;
  const displayTime = bookingState?.time;
  const fee = bookingState?.fee ?? doctor?.consultationFee ?? 800;

  // Single Source of Truth: find appointment in context or construct fallback from state
  const appointmentObj = useMemo(() => {
    if (!bookingState) return null;
    const found = appointments.find((a) => String(a.id) === String(appointmentId));
    if (found) return found;

    return {
      id: appointmentId || "MB-APT-20260826-101",
      doctorId: doctor?.id,
      doctorName: doctor?.name || "Dr. Emily Carter",
      specialty: specialty || "Cardiology",
      hospital: hospital || "MediCare Hospital",
      location: doctor?.location || "Chennai",
      date: bookingState?.date || "2026-08-26",
      formattedDate: displayDate || "August 26, 2026",
      time: displayTime || "10:30 AM",
      consultationFee: fee,
      status: "confirmed"
    };
  }, [appointments, appointmentId, bookingState, doctor, specialty, hospital, displayDate, displayTime, fee]);

  const handleViewAppointment = () => {
    navigate("/my-appointments");
  };

  const handleGoToDashboard = () => {
    navigate("/patient-dashboard");
  };

  return (
    <>
      <main className="doctors-content booking-success-wrapper">
        {appointmentObj ? (
          /* Standard Booking Confirmation View with Appointment Slip */
          <div className="booking-success-card">
            {/* Header Icon & Title (Hidden on Print) */}
            <div className="success-header no-print">
              <div className="success-icon-badge">
                <CheckCircle2 size={54} className="success-check-icon" />
              </div>
              <h2 className="success-title">Appointment Confirmed!</h2>
              <p className="success-subtitle">
                Your appointment has been successfully booked. Please print or keep your appointment slip for hospital check-in.
              </p>
            </div>

            {/* Reusable Printable Appointment Slip */}
            <AppointmentSlip appointment={appointmentObj} patient={patientData} />

            {/* Navigation Action Buttons (Hidden on Print) */}
            <div className="success-action-buttons no-print" style={{ marginTop: "24px" }}>
              <Button
                variant="primary"
                className="btn-success-action"
                onClick={handleViewAppointment}
              >
                View My Appointments
              </Button>

              <Button
                variant="outline"
                className="btn-success-action"
                onClick={handleGoToDashboard}
              >
                Go To Dashboard
              </Button>
            </div>
          </div>
        ) : (
          /* Direct Access / Empty State */
          <div className="booking-success-card empty-state-card">
            <div className="empty-icon-badge">
              <AlertCircle size={48} className="empty-alert-icon" />
            </div>
            <h2 className="empty-title">No Appointment Found</h2>
            <p className="empty-subtitle">
              No appointment information is available. Please select a doctor and book an appointment.
            </p>

            <Button
              variant="primary"
              className="btn-success-action"
              onClick={handleGoToDashboard}
            >
              Go To Dashboard
            </Button>
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className="toast-container no-print">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          />
        </div>
      )}
    </>
  );
}

export default BookingSuccess;
