import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Calendar,
  IdCard,
  Search,
  Eye,
  ShieldCheck,
  Printer,
  Info,
  ExternalLink,
  Plus
} from "lucide-react";
import { getCurrentUser, getCurrentPatient } from "../utils/auth";
import { api } from "../utils/api";
import PatientVisitorCard from "../components/PatientVisitorCard";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Input from "../components/Input";
import Toast from "../components/Toast";
import "./PatientVisitorCards.css";

function PatientVisitorCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  const currentUser = getCurrentUser();
  const currentPatient = getCurrentPatient();

  const patientId =
    currentUser?.refId ||
    currentPatient?.id ||
    currentUser?.id ||
    null;

  const fetchCards = useCallback(async () => {
    if (!patientId) {
      setCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/patient-hospitals/patient/${patientId}`);
      if (res.success && Array.isArray(res.data)) {
        setCards(res.data);
      } else {
        setCards([]);
      }
    } catch (err) {
      console.error("Failed to load visitor cards:", err);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleOpenCardModal = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const filteredCards = cards.filter((card) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const hosName = String(card.hospitalName || "").toLowerCase();
    const cardNum = String(card.visitorCardNumber || "").toLowerCase();
    return hosName.includes(q) || cardNum.includes(q);
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "Permanent";
    try {
      const d = new Date(dateStr);
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
    <div className="visitor-cards-page">
      {/* Top Header */}
      <div className="visitor-cards-header-section">
        <div className="visitor-cards-title-wrap">
          <h1>Hospital Visitor Cards</h1>
          <p className="visitor-cards-subtitle">
            Permanent, reusable patient identification cards for your hospital visits.
          </p>
        </div>

        {cards.length > 0 && (
          <div style={{ width: 280 }}>
            <Input
              type="text"
              placeholder="Search hospital or card #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
        )}
      </div>

      {/* Explanatory Banner */}
      <div className="visitor-cards-info-alert">
        <Info size={20} className="visitor-cards-info-icon" />
        <div>
          <strong>How Hospital Visitor Cards Work:</strong> A visitor card is your permanent patient ID for a specific hospital. When you visit a hospital for the first time, a card is issued and reused for all future appointments at that hospital. Separate visitor cards are issued for different hospitals.
        </div>
      </div>

      {/* Card Grid / List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <p style={{ color: "#64748b" }}>Loading your hospital visitor cards...</p>
        </div>
      ) : filteredCards.length > 0 ? (
        <div className="visitor-cards-grid">
          {filteredCards.map((card) => (
            <div key={card.id || card.visitorCardNumber} className="hospital-visitor-card-tile">
              <div>
                <div className="tile-top-bar">
                  <div className="tile-hospital-badge">
                    <Building2 size={20} className="tile-hospital-icon" />
                    <span>{card.hospitalName}</span>
                  </div>
                  <span className="tile-status-tag">{card.status || "Active"}</span>
                </div>

                <div className="tile-card-info">
                  <div className="tile-card-info-row">
                    <span className="tile-card-label">Visitor Card No:</span>
                    <span className="tile-card-number">{card.visitorCardNumber}</span>
                  </div>
                  <div className="tile-card-info-row">
                    <span className="tile-card-label">Issued:</span>
                    <span className="tile-card-date">{formatDate(card.issuedDate)}</span>
                  </div>
                </div>
              </div>

              <div className="tile-actions">
                <button
                  type="button"
                  className="btn-view-card"
                  onClick={() => handleOpenCardModal(card)}
                >
                  <Eye size={16} />
                  <span>View Card</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="visitor-cards-empty">
          <div className="visitor-cards-empty-icon">
            <Building2 size={32} />
          </div>
          <h3>No Visitor Cards Found</h3>
          <p>
            {searchQuery
              ? "No visitor cards match your search criteria."
              : "You do not have any hospital visitor cards yet. When you book an appointment at a hospital, a permanent visitor card will be generated automatically for you."}
          </p>
        </div>
      )}

      {/* Modal to View and Print Full Card */}
      {isModalOpen && selectedCard && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Hospital Patient Visitor Card"
          size="md"
        >
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
            <PatientVisitorCard
              visitorCard={selectedCard}
              patient={{ name: selectedCard.patientName, id: selectedCard.patientId }}
              hospital={{ name: selectedCard.hospitalName }}
              showPrintBtn={true}
            />
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
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
    </div>
  );
}

export default PatientVisitorCards;
