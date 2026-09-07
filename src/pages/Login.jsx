import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Workflow,
  BarChart3,
  HeartPulse,
  CheckCircle2,
  Stethoscope
} from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import FormField from "../components/FormField";
import Checkbox from "../components/Checkbox";
import hospitalIllustration from "../assets/hospital_appointment_illustration.png";
import { setCurrentUser } from "../utils/auth";
import { api } from "../utils/api";
import "./Login.css";

function Login({ initialTab = "signin" }) {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);

  // Login Modes: "patient", "admin", "doctor", "hospital"
  const [loginMode, setLoginMode] = useState("patient");
  const isAdminMode = loginMode === "admin";
  const isDoctorMode = loginMode === "doctor";
  const isHospitalMode = loginMode === "hospital";

  const handleMobileChange = (e) => {
    const val = e.target.value;
    setMobile(val);
    if (errors.mobile) {
      setErrors((prev) => ({ ...prev, mobile: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password || errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        password: "",
        confirmPassword: prev.confirmPassword === "Passwords do not match." ? "" : prev.confirmPassword
      }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setSuccessMessage("");
    const newErrors = {};

    if (activeTab === "signup" && !isHospitalMode) {
      const trimmedName = name.trim();
      if (!trimmedName) newErrors.name = "Please enter your full name.";

      const ageNum = parseInt(age, 10);
      if (!age || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
        newErrors.age = "Please enter a valid age (1-120).";
      }

      if (!gender) newErrors.gender = "Please select your gender.";

      const trimmedMobile = mobile.trim();
      if (!trimmedMobile || !/^\d{10}$/.test(trimmedMobile)) {
        newErrors.mobile = "Please enter a valid 10-digit mobile number.";
      }
      if (!password) newErrors.password = "Password is required.";
      if (!confirmPassword) newErrors.confirmPassword = "Confirm Password is required.";
      else if (password && password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

      if (!termsAccepted) newErrors.terms = "You must agree to the Terms of Service and Privacy Policy.";
    } else {
      if (!mobile.trim()) newErrors.mobile = "ID / Email / Mobile is required.";
      if (!password) newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      let response;
      if (activeTab === "signup") {
        response = await api.post("/Auth/register", {
          name: name.trim(),
          mobile: mobile.trim(),
          password,
          gender,
          age: parseInt(age, 10),
        });
      } else {
        response = await api.post("/Auth/login", {
          loginId: mobile.trim(),
          password,
        });
      }

      setLoading(false);

      if (response.success) {
        const user = response.data;
        if (isAdminMode) {
          if (user.role.toLowerCase() === "admin") {
            setCurrentUser(user);
            navigate("/admin/dashboard");
          } else {
            setErrors({ mobile: "Invalid Admin ID or password" });
          }
        } else if (isHospitalMode) {
          if (user.role.toLowerCase() === "hospital") {
            setCurrentUser(user);
            navigate("/hospital/dashboard");
          } else {
            setErrors({ mobile: "Invalid Hospital email or password" });
          }
        } else if (isDoctorMode) {
          if (user.role.toLowerCase() === "doctor") {
            try {
              const docRes = await api.get(`/Doctors/user/${user.id}`);
              if (docRes.success && docRes.data) {
                user.doctorId = docRes.data.id;
                setCurrentUser(user);
                navigate("/doctor/dashboard");
              } else {
                setErrors({ mobile: "Doctor profile not found for this user." });
              }
            } catch (err) {
              setErrors({ mobile: "Failed to fetch doctor profile." });
            }
          } else {
            setErrors({ mobile: "Invalid Doctor email or password" });
          }
        } else {
          setCurrentUser(user);
          const role = user.role.toLowerCase();
          if (role === "admin") navigate("/admin/dashboard");
          else if (role === "hospital") navigate("/hospital/dashboard");
          else if (role === "doctor") navigate("/doctor/dashboard");
          else navigate("/patient-dashboard");
        }
      } else {
        setErrors({ mobile: response.error || "Invalid credentials. Please check your login ID and password." });
      }
    } catch (err) {
      setLoading(false);
      setErrors({ mobile: "An unexpected error occurred during login." });
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Forgot password clicked. Redirecting to recovery flow...");
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-outer-container">
        {/* HEALTHCARE SHOWCASE */}
        <div className="login-showcase-panel">
          <img
            src={hospitalIllustration}
            alt="Hospital Background"
            className="login-showcase-bg-image"
          />
          <div className="showcase-message-container">
            <h2 className="showcase-title">
              Manage Healthcare<br />Better, Together
            </h2>
            <p className="showcase-desc">
              MediBook helps patients easily find specialists, book consultations, and manage health records securely.
            </p>
          </div>
          <div className="showcase-features">
            <div className="showcase-feature-item">
              <ShieldCheck size={16} className="showcase-feature-icon" />
              <span>Secure Data Protection</span>
            </div>
            <div className="showcase-feature-item">
              <Workflow size={16} className="showcase-feature-icon" />
              <span>Instant Appointment Booking</span>
            </div>
            <div className="showcase-feature-item">
              <BarChart3 size={16} className="showcase-feature-icon" />
              <span>Connected Care Platform</span>
            </div>
          </div>
        </div>

        {/* AUTHENTICATION PANEL */}
        <div className="login-auth-panel">
          <div className="login-auth-header">
            <div
              className="login-auth-logo-mark"
              onClick={() => {
                setLoginMode(prev =>
                  prev === "patient"
                    ? "admin"
                    : prev === "admin"
                      ? "doctor"
                      : prev === "doctor"
                        ? "hospital"
                        : "patient"
                );
                setErrors({});
                setMobile("");
                setPassword("");
              }}
              style={{ cursor: "pointer" }}
              title="Toggle Login Mode"
            >
              {isDoctorMode ? <Stethoscope size={16} /> : <HeartPulse size={16} />}
            </div>
            <span className="login-auth-brand">MediBook</span>
          </div>

          <div className="login-auth-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                {activeTab === "signup"
                  ? "Create your MediBook account"
                  : isHospitalMode
                    ? "Hospital Login"
                    : isDoctorMode
                      ? "Doctor Login"
                      : isAdminMode
                        ? "Admin Login"
                        : "Welcome to MediBook"}
              </h1>
              <p className="welcome-desc">
                {activeTab === "signup"
                  ? "Register as a patient to find doctors and book appointments."
                  : isHospitalMode
                    ? "Sign in to manage your hospital dashboard."
                    : isDoctorMode
                      ? "Sign in with your doctor email and password."
                      : isAdminMode
                        ? "Sign in to access the system administration panel."
                        : "Sign in to access your healthcare management dashboard."}
              </p>
            </div>

            {!isAdminMode && !isDoctorMode && !isHospitalMode && (
              <div className="auth-toggle">
                <button
                  type="button"
                  className={`auth-toggle-btn ${activeTab === "signin" ? "active" : ""}`}
                  onClick={() => handleTabChange("signin")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-toggle-btn ${activeTab === "signup" ? "active" : ""}`}
                  onClick={() => handleTabChange("signup")}
                >
                  Sign Up
                </button>
              </div>
            )}

            {successMessage && (
              <div className="auth-success-banner">
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              {activeTab === "signup" && !isAdminMode && !isDoctorMode && !isHospitalMode && (
                <>
                  <FormField
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    required
                  />

                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 130px" }}>
                      <FormField
                        label="Age"
                        type="number"
                        placeholder="e.g. 32"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        error={errors.age}
                        required
                      />
                    </div>
                    <div className="form-field" style={{ flex: "1 1 150px" }}>
                      <label className="form-label">
                        Gender <span className="required-mark" style={{ color: "var(--error)" }}>*</span>
                      </label>
                      <select
                        className={`form-input ${errors.gender ? "form-input-error" : ""}`}
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        style={{ height: "42px", borderRadius: "var(--radius-md)" }}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                      {errors.gender && <span className="form-error">{errors.gender}</span>}
                    </div>
                  </div>
                </>
              )}

              <FormField
                label={
                  isHospitalMode
                    ? "Hospital Email"
                    : isDoctorMode
                      ? "Doctor Email"
                      : isAdminMode
                        ? "Admin ID"
                        : "Mobile Number"
                }
                placeholder={
                  isHospitalMode
                    ? "Enter hospital email"
                    : isDoctorMode
                      ? "e.g. sarah@medibook.com"
                      : isAdminMode
                        ? "Enter admin ID"
                        : "Enter 10-digit mobile number"
                }
                value={mobile}
                onChange={handleMobileChange}
                error={errors.mobile}
                required
              />

              <div className="form-field">
                <div className="password-label-row">
                  <label htmlFor="password" className="form-label">
                    Password <span className="required-mark" style={{ color: "var(--error)" }}>*</span>
                  </label>
                  {!isAdminMode && activeTab === "signin" && (
                    <a href="#forgot" className="forgot-password-link" onClick={handleForgotPassword}>
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="password-wrapper">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    icon={Lock}
                    error={!!errors.password}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              {activeTab === "signup" && !isAdminMode && !isDoctorMode && (
                <div className="form-field">
                  <div className="password-label-row">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password <span className="required-mark" style={{ color: "var(--error)" }}>*</span>
                    </label>
                  </div>
                  <div className="password-wrapper">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      icon={Lock}
                      error={!!errors.confirmPassword}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="form-error">{errors.confirmPassword}</span>
                  )}
                </div>
              )}

              {activeTab === "signin" ? (
                <div className="form-options">
                  <Checkbox
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                </div>
              ) : (
                <div className="form-field" style={{ marginTop: "4px" }}>
                  <Checkbox
                    label={
                      <span>
                        I agree to the{" "}
                        <a
                          href="#terms"
                          onClick={(e) => {
                            e.preventDefault();
                            alert("MediBook Terms of Service");
                          }}
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#privacy"
                          onClick={(e) => {
                            e.preventDefault();
                            alert("MediBook Privacy Policy");
                          }}
                        >
                          Privacy Policy
                        </a>
                        .
                      </span>
                    }
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  {errors.terms && (
                    <span className="form-error" style={{ marginTop: "4px", display: "block" }}>
                      {errors.terms}
                    </span>
                  )}
                </div>
              )}

              <div className="login-btn-wrapper">
                <Button type="submit" loading={loading} disabled={loading}>
                  {activeTab === "signup" ? "Create Patient Account" : "Sign In"}
                </Button>
              </div>

              {isAdminMode && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    Are you a doctor?{' '}
                    <button
                      type="button"
                      onClick={() => { setLoginMode("doctor"); setErrors({}); setMobile(""); setPassword(""); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                    >
                      Doctor Login
                    </button>
                  </p>
                </div>
              )}
              {isDoctorMode && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    Not a doctor?{' '}
                    <button
                      type="button"
                      onClick={() => { setLoginMode("patient"); setErrors({}); setMobile(""); setPassword(""); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                    >
                      Patient Login
                    </button>
                  </p>
                </div>
              )}
              {isHospitalMode && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    Not a hospital?{' '}
                    <button
                      type="button"
                      onClick={() => { setLoginMode("patient"); setErrors({}); setMobile(""); setPassword(""); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                    >
                      Patient Login
                    </button>
                  </p>
                </div>
              )}
            </form>

            {!isAdminMode && !isDoctorMode && !isHospitalMode && activeTab === "signin" && (
              <div className="social-login-section">
                <div className="social-divider">
                  <span>Or continue with</span>
                </div>
                <div className="social-buttons">
                  <button type="button" className="social-btn" disabled>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </button>
                  <button type="button" className="social-btn" disabled>
                    <svg width="18" height="18" viewBox="0 0 23 23" fill="currentColor">
                      <path d="M0 0h11v11H0z" fill="#F25022" />
                      <path d="M12 0h11v11H12z" fill="#7FBA00" />
                      <path d="M0 12h11v11H0z" fill="#00A4EF" />
                      <path d="M12 12h11v11H12z" fill="#FFB900" />
                    </svg>
                    Microsoft
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="login-auth-footer">
            <span>© 2026 MediBook. All rights reserved.</span>
            <div className="footer-links">
              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Terms of Service...");
                }}
              >
                Terms of Service
              </a>
              <a
                href="#privacy"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Privacy Policy...");
                }}
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
