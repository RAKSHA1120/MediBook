import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  CreditCard,
  Printer,
  Eye,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import Button from "../components/Button";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import AppointmentSlip from "../components/AppointmentSlip";
import PatientVisitorCard from "../components/PatientVisitorCard";
import { useAppointments } from "../context/AppointmentContext";
import { getStoredPatientProfile } from "../data/patientProfile";
import { getCurrentUser, getCurrentPatient } from "../utils/auth";
import { api } from "../utils/api";
import "./BookingSuccess.css";

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointments } = useAppointments();

  // Toast State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });
  const [showVisitorCardModal, setShowVisitorCardModal] = useState(false);
  const [visitorCardData, setVisitorCardData] = useState(null);

  // Retrieve booking state passed from AppointmentBooking
  const bookingState = location.state;

  // Patient profile data
  const patientData = useMemo(() => getStoredPatientProfile(), []);
  const currentUser = getCurrentUser();
  const currentPatient = getCurrentPatient();

  // Extract appointment parameters safely
  const appointmentId = bookingState?.appointmentId;
  const doctor = bookingState?.doctor;
  const specialty = bookingState?.specialty || doctor?.specialty;
  const hospital = bookingState?.hospital || doctor?.hospital || "MediCare Hospital";
  const displayDate = bookingState?.formattedDate || bookingState?.date;
  const displayTime = bookingState?.time;
  const fee = bookingState?.fee ?? doctor?.consultationFee ?? 800;

  const patientId = bookingState?.patientId || currentUser?.refId || currentPatient?.id || currentUser?.id || 1;
  const hospitalId = bookingState?.hospitalId || doctor?.hospitalId || 1;
  const patientName = bookingState?.patientName || patientData?.name || currentUser?.name || "Patient";

  // Initial visitor card state from navigation
  const passedCardNumber = bookingState?.visitorCardNumber;
  const isFirstVisit = Boolean(bookingState?.isFirstVisit);
  const issuedDate = bookingState?.visitorCardIssuedDate || new Date().toISOString();

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
      hospital: hospital,
      location: doctor?.location || "Chennai",
      date: bookingState?.date || "2026-08-26",
      formattedDate: displayDate || "August 26, 2026",
      time: displayTime || "10:30 AM",
      consultationFee: fee,
      status: "confirmed"
    };
  }, [appointments, appointmentId, bookingState, doctor, specialty, hospital, displayDate, displayTime, fee]);

  // Load latest visitor card data from API
  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await api.get(`/patient-hospitals/patient/${patientId}/hospital/${hospitalId}`);
        if (res.success && res.data) {
          setVisitorCardData(res.data);
        } else if (passedCardNumber) {
          setVisitorCardData({
            patientId,
            patientName,
            hospitalId,
            hospitalName: hospital,
            visitorCardNumber: passedCardNumber,
            issuedDate,
            status: "Active"
          });
        }
      } catch (e) {
        if (passedCardNumber) {
          setVisitorCardData({
            patientId,
            patientName,
            hospitalId,
            hospitalName: hospital,
            visitorCardNumber: passedCardNumber,
            issuedDate,
            status: "Active"
          });
        }
      }
    };

    fetchCard();
  }, [patientId, hospitalId, hospital, passedCardNumber, patientName, issuedDate]);

  const activeVisitorCard = visitorCardData || (passedCardNumber ? {
    patientId,
    patientName,
    hospitalId,
    hospitalName: hospital,
    visitorCardNumber: passedCardNumber,
    issuedDate,
    status: "Active"
  } : null);

  const handleViewAppointment = () => {
    navigate("/my-appointments");
  };

  const handleGoToDashboard = () => {
    navigate("/patient-dashboard");
  };

  const formatDateDisplay = (dStr) => {
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return "Permanent";
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "Permanent";
    }
  };

  return (
    <>
      <main className="doctors-content booking-success-wrapper">
        {appointmentObj ? (
          /* Standard Booking Confirmation View with Appointment Slip & Visitor Card Section */
          <div className="booking-success-card">
            {/* Header Icon & Title (Hidden on Print) */}
            <div className="success-header no-print">
              <div className="success-icon-badge">
                <CheckCircle2 size={54} className="success-check-icon" />
              </div>
              <h2 className="success-title">Appointment Confirmed!</h2>
              <p className="success-subtitle">
                Your appointment has been successfully booked. Please present your hospital visitor card and appointment slip upon arrival.
              </p>
            </div>

            {/* HOSPITAL-SPECIFIC PATIENT VISITOR CARD BANNER */}
            {activeVisitorCard && (
              <div
                className={`visitor-card-booking-banner no-print ${
                  isFirstVisit ? "first-visit" : "returning-visit"
                }`}
              >
                <div className="vc-banner-badge-row">
                  <span className="vc-banner-pill">
                    {isFirstVisit ? "First Visit" : "Existing Visitor Card"}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "#64748b" }}>
                    <ShieldCheck size={14} color="#059669" />
                    <span>Permanent Reusable ID</span>
                  </div>
                </div>

                {isFirstVisit ? (
                  <>
                    <h3 className="vc-banner-title">First Visit to this Hospital</h3>
                    <div className="vc-banner-subtitle">
                      Visitor Card Generated Successfully
                    </div>

                    <div className="vc-banner-grid">
                      <div className="vc-grid-item">
                        <span className="vc-grid-label">Visitor Card Number</span>
                        <span className="vc-grid-val card-number">
                          {activeVisitorCard.visitorCardNumber}
                        </span>
                      </div>
                      <div className="vc-grid-item">
                        <span className="vc-grid-label">Hospital Name</span>
                        <span className="vc-grid-val">
                          {activeVisitorCard.hospitalName || hospital}
                        </span>
                      </div>
                      <div className="vc-grid-item">
                        <span className="vc-grid-label">Patient Name</span>
                        <span className="vc-grid-val">{patientName}</span>
                      </div>
                      <div className="vc-grid-item">
                        <span className="vc-grid-label">Issued Date</span>
                        <span className="vc-grid-val">
                          {formatDateDisplay(activeVisitorCard.issuedDate)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="vc-banner-title">Existing Visitor Card</h3>
                    <div className="vc-banner-subtitle" style={{ color: "#0284c7", fontSize: "1.05rem", fontFamily: "monospace", margin: "4px 0 10px 0" }}>
                      Visitor Card Number: {activeVisitorCard.visitorCardNumber}
                    </div>
                    <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "#475569", lineHeight: 1.4 }}>
                      This visitor card can be used for all future visits to this hospital.
                    </p>
                  </>
                )}

                <div className="vc-banner-footer">
                  <span className="vc-banner-note">
                    Valid for all current and future visits to {activeVisitorCard.hospitalName || hospital}.
                  </span>
                  <button
                    type="button"
                    className="btn-view-vc-banner"
                    onClick={() => setShowVisitorCardModal(true)}
                  >
                    <Eye size={16} />
                    <span>View / Print Visitor Card</span>
                  </button>
                </div>
              </div>
            )}

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

      {/* Visitor Card Full Modal with Dedicated Print Action */}
      {showVisitorCardModal && activeVisitorCard && (
        <Modal
          isOpen={showVisitorCardModal}
          onClose={() => setShowVisitorCardModal(false)}
          title="Hospital Patient Visitor Card"
          size="md"
        >
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
            <PatientVisitorCard
              visitorCard={activeVisitorCard}
              patient={{ name: patientName, id: patientId }}
              hospital={{ name: activeVisitorCard.hospitalName || hospital }}
              showPrintBtn={true}
            />
          </div>
        </Modal>
      )}

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
