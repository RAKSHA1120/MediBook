import React, { useState, useEffect } from "react";
import {
  Heart,
  Building2,
  ShieldCheck,
  Printer,
  QrCode,
  User,
  CheckCircle2,
  Phone,
  Mail
} from "lucide-react";
import QRCode from "qrcode";
import "./PatientVisitorCard.css";

// Helper: Deterministic hospital abbreviation (e.g. MediCare Hospital -> MCH, City Care Hospital -> CCH, Apollo Care Hospital -> ACH)
const getHospitalCode = (name) => {
  if (!name) return "HOS";
  const cleanName = String(name)
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^\w\s]/g, "");
  const words = cleanName.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const code = words.map((w) => w[0].toUpperCase()).join("");
    return code.length > 4 ? code.substring(0, 4) : code;
  }
  const letters = cleanName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return letters.length >= 3 ? letters.substring(0, 3) : letters.padEnd(3, "X");
};

function PatientVisitorCard({
  visitorCard,
  patient,
  hospital,
  showPrintBtn = true,
  onPrint
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  const hospitalName =
    visitorCard?.hospitalName ||
    hospital?.name ||
    visitorCard?.hospital ||
    "Hospital";

  // Safely extract card attributes with hospital-specific fallback
  const cardNumber = (() => {
    if (visitorCard?.visitorCardNumber) return visitorCard.visitorCardNumber;
    if (visitorCard?.cardNumber) return visitorCard.cardNumber;
    const code = getHospitalCode(hospitalName);
    return `MB-${code}-00001`;
  })();

  const patientName =
    visitorCard?.patientName ||
    patient?.name ||
    "Patient";

  const patientId =
    visitorCard?.patientId ||
    patient?.id ||
    "1";

  const patientMobile =
    visitorCard?.patientMobile ||
    patient?.mobile ||
    patient?.contact ||
    "";

  const patientEmail =
    visitorCard?.patientEmail ||
    patient?.email ||
    "";

  const rawIssued =
    visitorCard?.issuedDate ||
    visitorCard?.createdAt ||
    new Date().toISOString();

  // Format readable issued date: e.g. "07 Sep 2026"
  const formattedIssuedDate = (() => {
    try {
      const d = new Date(rawIssued);
      if (isNaN(d.getTime())) return "Permanent";
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "Permanent";
    }
  })();

  const status = visitorCard?.status || "Active";

  // Generate QR Code data URL dynamically from Visitor Card Number
  useEffect(() => {
    if (cardNumber) {
      QRCode.toDataURL(
        cardNumber,
        {
          width: 160,
          margin: 1,
          color: {
            dark: "#172033",
            light: "#ffffff"
          }
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [cardNumber]);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="visitor-card-container">
      {/* The Printable Patient Visitor Card Badge */}
      <div className="visitor-card-badge printable-visitor-card" id={`visitor-card-${cardNumber}`}>
        {/* Top Header: Brand & Card Type */}
        <div className="visitor-card-header">
          <div className="visitor-card-brand">
            <Heart size={20} className="visitor-card-brand-icon" fill="var(--primary, #2f6fa3)" />
            <span className="visitor-card-brand-title">MEDIBOOK</span>
          </div>
          <span className="visitor-card-tag">PATIENT VISITOR CARD</span>
        </div>

        {/* Hospital Affiliation Section */}
        <div className="visitor-card-hospital-section">
          <div className="visitor-card-hospital-icon-wrap">
            <Building2 size={20} />
          </div>
          <div className="visitor-card-hospital-meta">
            <span className="visitor-card-hospital-name">{hospitalName}</span>
            <span className="visitor-card-validity-text">
              Valid for visits to {hospitalName}
            </span>
          </div>
        </div>

        {/* Patient Details & QR Code */}
        <div className="visitor-card-body">
          <div className="visitor-card-patient-details">
            <div className="visitor-card-label">Patient Name</div>
            <div className="visitor-card-patient-name">{patientName}</div>

            <div className="visitor-card-patient-id-badge">
              <User size={13} />
              <span>Patient ID: #{patientId}</span>
            </div>

            {patientMobile && (
              <div className="visitor-card-contact-item">
                <Phone size={12} />
                <span>{patientMobile}</span>
              </div>
            )}

            {patientEmail && (
              <div className="visitor-card-contact-item">
                <Mail size={12} />
                <span>{patientEmail}</span>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="visitor-card-qr-section">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR for ${cardNumber}`}
                className="visitor-card-qr-image"
              />
            ) : (
              <div className="visitor-card-qr-placeholder">
                <QrCode size={36} color="var(--text-muted, #94a3b8)" />
              </div>
            )}
            <span className="visitor-card-qr-label">SCAN TO VERIFY</span>
          </div>
        </div>

        {/* Reusable Card Number Banner */}
        <div className="visitor-card-number-section">
          <div className="visitor-card-number-info">
            <span className="visitor-card-label">Visitor Card Number</span>
            <span className="visitor-card-number-code">{cardNumber}</span>
          </div>

          <div className="visitor-card-status-pill">
            <CheckCircle2 size={13} style={{ marginRight: 4 }} />
            <span>{status.toUpperCase()}</span>
          </div>
        </div>

        {/* Footer: Issue Date & Permanent Validity Notice */}
        <div className="visitor-card-footer">
          <div className="visitor-card-issued-date">
            Issued: {formattedIssuedDate}
          </div>
          <div className="visitor-card-security-note">
            <ShieldCheck size={14} />
            <span>Permanent Hospital ID</span>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      {showPrintBtn && (
        <div className="visitor-card-actions no-print">
          <button
            type="button"
            className="btn-print-visitor-card"
            onClick={handlePrint}
          >
            <Printer size={18} />
            <span>Print Visitor Card</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientVisitorCard;
