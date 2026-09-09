import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  Calendar,
  Stethoscope,
  User,
  Bell,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  Plus,
  Minus,
  MessageSquare,
  Send,
  X,
  Check
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import EmptyState from "../components/EmptyState";
import { getStoredPatientProfile } from "../data/patientProfile";
import "./HelpSupport.css";

const FAQ_DATA = [
  {
    id: 1,
    category: "appointments",
    question: "How do I book an appointment?",
    answer:
      "To book an appointment, click on 'Find Doctor' in the sidebar. Select your preferred doctor, click 'Book Appointment', choose an available date, time slot, and consultation type, then click 'Confirm Appointment'.",
    keywords: ["book", "booking", "appointment", "schedule", "doctor"]
  },
  {
    id: 2,
    category: "appointments",
    question: "How can I reschedule my appointment?",
    answer:
      "Go to 'My Appointments' in the sidebar, locate your upcoming appointment, and click the 'Reschedule' button. Choose a new date and time slot, then submit your changes.",
    keywords: ["reschedule", "change", "date", "time", "appointment"]
  },
  {
    id: 3,
    category: "appointments",
    question: "How do I cancel an appointment?",
    answer:
      "Navigate to 'My Appointments', click on the appointment card or details view, and select 'Cancel Appointment'. You can optionally provide a cancellation reason before confirming.",
    keywords: ["cancel", "cancellation", "remove", "appointment"]
  },
  {
    id: 4,
    category: "appointments",
    question: "Where can I view my upcoming appointments?",
    answer:
      "Your upcoming visits are listed on the 'Patient Dashboard' overview cards as well as under the 'Upcoming' tab in the 'My Appointments' section.",
    keywords: ["view", "upcoming", "dashboard", "appointments", "list"]
  },
  {
    id: 5,
    category: "doctors",
    question: "How do I find a doctor?",
    answer:
      "Click 'Find Doctor' in the sidebar menu. You can search by doctor name, filter by medical specialty (e.g., Cardiology, Dermatology), or sort by fee and ratings.",
    keywords: ["find", "search", "doctor", "specialty", "physician", "profile"]
  },
  {
    id: 6,
    category: "account",
    question: "How can I update my profile?",
    answer:
      "Navigate to 'Profile' or 'Settings' in the sidebar. Click 'Edit Profile' to update your name, email, mobile number, address, date of birth, or blood group, then click 'Save Changes'.",
    keywords: ["profile", "account", "update", "edit", "name", "email", "phone"]
  },
  {
    id: 7,
    category: "notifications",
    question: "How do I change my notification preferences?",
    answer:
      "Go to 'Settings' and locate the 'Notification Preferences' section. You can independently toggle reminders, booking confirmations, changes, and system alerts.",
    keywords: ["notification", "preferences", "toggle", "alerts", "reminders", "settings"]
  },
  {
    id: 8,
    category: "appointments",
    question: "Where can I see my appointment details?",
    answer:
      "Click the 'View' or 'View Details' action on any appointment card in 'My Appointments' or 'Patient Dashboard' to see full doctor details, hospital location, status, and fee breakdown.",
    keywords: ["details", "view", "record", "appointment", "hospital"]
  },
  {
    id: 9,
    category: "appointments",
    question: "What happens after I confirm an appointment?",
    answer:
      "Once confirmed, your appointment is saved in your account. You will receive an in-app notification alert, a booking summary screen, and reminders before your scheduled time.",
    keywords: ["confirm", "confirmation", "after", "reminder", "booking"]
  },
  {
    id: 10,
    category: "account",
    question: "How can I contact MediBook support?",
    answer:
      "You can click the 'Contact Support' button below or in the sidebar footer to open a support message form. Our support team operates 24/7 to assist you.",
    keywords: ["contact", "support", "help", "email", "phone", "message"]
  }
];

const HELP_TOPICS = [
  {
    id: "appointments",
    name: "Appointments",
    desc: "Booking, rescheduling and cancelling appointments",
    icon: Calendar
  },
  {
    id: "doctors",
    name: "Find a Doctor",
    desc: "Search doctors and view doctor profiles",
    icon: Stethoscope
  },
  {
    id: "account",
    name: "Account & Profile",
    desc: "Manage your profile and account settings",
    icon: User
  },
  {
    id: "notifications",
    name: "Notifications",
    desc: "Appointment reminders and notification settings",
    icon: Bell
  }
];

function HelpSupport() {
  const location = useLocation();

  // Profile data for pre-filling support modal
  const profile = getStoredPatientProfile();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Accordion Expand State
  const [openFaqIds, setOpenFaqIds] = useState(new Set([1])); // default first item open

  // Contact Support Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supportFormData, setSupportFormData] = useState({
    name: profile?.name || "Raksha",
    email: profile?.email || "raksha@example.com",
    subject: "",
    message: ""
  });
  const [formError, setFormError] = useState("");

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  const showNotification = (title, message, type = "success") => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Open modal if navigated via sidebar "Contact Support" state
  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
    }
  }, [location.state]);

  // Toggle FAQ item open/close
  const toggleFaq = (id) => {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter FAQs based on query & category
  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesTitle = faq.question.toLowerCase().includes(query);
    const matchesAnswer = faq.answer.toLowerCase().includes(query);
    const matchesKeywords = faq.keywords.some((kw) => kw.toLowerCase().includes(query));

    return matchesCategory && (matchesTitle || matchesAnswer || matchesKeywords);
  });

  // Category card click handler
  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory("all");
    } else {
      setSelectedCategory(categoryId);
    }
  };

  // Handle Contact Support Submission
  const handleSendSupportMessage = () => {
    if (!supportFormData.subject.trim()) {
      setFormError("Please enter a subject.");
      return;
    }
    if (!supportFormData.message.trim()) {
      setFormError("Please enter your message.");
      return;
    }

    setFormError("");
    setIsModalOpen(false);
    setSupportFormData({
      name: profile?.name || "Raksha",
      email: profile?.email || "raksha@example.com",
      subject: "",
      message: ""
    });

    showNotification(
      "Support Request Submitted",
      "Your support request has been submitted successfully.",
      "success"
    );
  };

  return (
    <div className="help-support-page">
      {/* Page Header */}
      <PageHeader
        title="Help & Support"
        subtitle="We're here to help you with appointments, your account and other MediBook services."
        action={
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            <MessageSquare size={16} style={{ marginRight: "6px" }} />
            Contact Support
          </PrimaryButton>
        }
      />

      {/* 2. Search Help Hero Card */}
      <div className="help-search-card">
        <h2 className="help-search-title">How can we help you?</h2>
        <p className="help-search-subtitle">Search for answers to your questions.</p>

        <div className="help-search-input-wrapper">
          <Search size={18} className="help-search-icon" />
          <input
            type="text"
            className="help-search-input"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Quick Help Categories Card */}
      <div className="help-card-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="help-card-title">Browse Help Topics</h3>
            <p className="help-card-subtitle" style={{ marginTop: "4px" }}>
              Select a topic to filter relevant articles.
            </p>
          </div>
          {selectedCategory !== "all" && (
            <SecondaryButton onClick={() => setSelectedCategory("all")}>
              Show All Topics
            </SecondaryButton>
          )}
        </div>

        <div className="help-topics-grid">
          {HELP_TOPICS.map((topic) => {
            const Icon = topic.icon;
            const isSelected = selectedCategory === topic.id;
            return (
              <div
                key={topic.id}
                className={`help-topic-card ${isSelected ? "active" : ""}`}
                onClick={() => handleCategoryClick(topic.id)}
              >
                <div className="help-topic-icon">
                  <Icon size={20} />
                </div>
                <h4 className="help-topic-name">{topic.name}</h4>
                <p className="help-topic-desc">{topic.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Frequently Asked Questions Accordion */}
      <div className="help-card-section">
        <h3 className="help-card-title">
          <HelpCircle size={20} />
          <span>Frequently Asked Questions</span>
        </h3>
        <p className="help-card-subtitle">
          {selectedCategory !== "all"
            ? `Showing FAQs for topic: "${selectedCategory}"`
            : "Click a question to view the detailed solution."}
        </p>

        {filteredFaqs.length > 0 ? (
          <div className="faq-list">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqIds.has(faq.id);
              return (
                <div key={faq.id} className={`faq-item ${isOpen ? "expanded" : ""}`}>
                  <button
                    type="button"
                    className="faq-header"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-icon-wrap">
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>

                  {isOpen && <div className="faq-body">{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No help articles found."
            message="No FAQs matched your search or selected topic. Please try searching for another keyword or contact support."
            icon={HelpCircle}
          />
        )}
      </div>

      {/* 5. Contact Support Card */}
      <div className="help-card-section">
        <h3 className="help-card-title">
          <MessageSquare size={20} />
          <span>Still need help?</span>
        </h3>
        <p className="help-card-subtitle">Our support team is available to help you with your questions.</p>

        <div className="contact-info-grid">
          <div className="contact-info-item">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Mail size={16} style={{ color: "var(--primary)" }} />
              <span className="contact-info-label">Email Support</span>
            </div>
            <span className="contact-info-value">support@medibook.com</span>
          </div>

          <div className="contact-info-item">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Phone size={16} style={{ color: "var(--primary)" }} />
              <span className="contact-info-label">Phone Support</span>
            </div>
            <span className="contact-info-value">+91 98765 43210</span>
          </div>

          <div className="contact-info-item">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} style={{ color: "var(--primary)" }} />
              <span className="contact-info-label">Support Hours</span>
            </div>
            <span className="contact-info-value">24/7 Available</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "4px" }}>
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            <MessageSquare size={16} style={{ marginRight: "6px" }} />
            Contact Support
          </PrimaryButton>
        </div>
      </div>

      {/* 6. Contact Support Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Contact Support"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {formError && (
              <div style={{ padding: "10px 12px", background: "#fef2f2", color: "#dc2626", borderRadius: "6px", fontSize: "13.5px" }}>
                {formError}
              </div>
            )}

            <div className="settings-field-group">
              <label className="settings-field-label" htmlFor="support-name">Name</label>
              <input
                id="support-name"
                type="text"
                className="settings-field-input"
                value={supportFormData.name}
                onChange={(e) => setSupportFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="settings-field-group">
              <label className="settings-field-label" htmlFor="support-email">Email</label>
              <input
                id="support-email"
                type="email"
                className="settings-field-input"
                value={supportFormData.email}
                onChange={(e) => setSupportFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="settings-field-group">
              <label className="settings-field-label" htmlFor="support-subject">Subject</label>
              <input
                id="support-subject"
                type="text"
                className="settings-field-input"
                placeholder="e.g. Appointment rescheduling issue"
                value={supportFormData.subject}
                onChange={(e) => setSupportFormData((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div className="settings-field-group">
              <label className="settings-field-label" htmlFor="support-message">Message</label>
              <textarea
                id="support-message"
                className="settings-field-input"
                rows={4}
                placeholder="Describe your issue or question in detail..."
                style={{ resize: "vertical" }}
                value={supportFormData.message}
                onChange={(e) => setSupportFormData((prev) => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
              <SecondaryButton onClick={() => setIsModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleSendSupportMessage}>
                <Send size={15} style={{ marginRight: "6px" }} />
                Send Message
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification Overlay */}
      {toast.show && (
        <div className="toast-container">
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

export default HelpSupport;
