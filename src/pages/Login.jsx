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
} from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import FormField from "../components/FormField";
import Checkbox from "../components/Checkbox";
import hospitalIllustration from "../assets/hospital_appointment_illustration.png";
import { getUsers, addUser, getPatients, addPatient, setCurrentUser, getDoctors } from "../utils/storage";
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
  const [isAdminMode, setIsAdminMode] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    setSuccessMessage("");
    const newErrors = {};

    if (activeTab === "signup") {
      // 1. Full Name Validation
      const trimmedName = name.trim();
      if (!trimmedName) {
        newErrors.name = "Please enter your full name.";
      }

      // 2. Age Validation
      const ageNum = parseInt(age, 10);
      if (!age || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
        newErrors.age = "Please enter a valid age (1-120).";
      }

      // 3. Gender Validation
      if (!gender) {
        newErrors.gender = "Please select your gender.";
      }

      // 4. Mobile Number Validation (10 digits & numeric)
      const trimmedMobile = mobile.trim();
      if (!trimmedMobile || !/^\d{10}$/.test(trimmedMobile)) {
        newErrors.mobile = "Please enter a valid 10-digit mobile number.";
      } else {
        // Check duplicate mobile number
        const users = getUsers();
        const patients = getPatients();
        const existsInUsers = users.some(
          (u) => String(u.mobile || u.loginId || "").trim() === trimmedMobile
        );
        const existsInPatients = patients.some(
          (p) => String(p.contact || p.mobile || "").trim() === trimmedMobile
        );

        if (existsInUsers || existsInPatients) {
          newErrors.mobile = "This mobile number is already registered. Please sign in.";
        }
      }

      // 5. Password & Confirm Password Validation
      if (!password) {
        newErrors.password = "Password is required.";
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = "Confirm Password is required.";
      } else if (password && password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }

      // 6. Terms & Privacy Checkbox Validation
      if (!termsAccepted) {
        newErrors.terms = "You must agree to the Terms of Service and Privacy Policy.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
        const trimmedMobile = mobile.trim();
        const trimmedName = name.trim();

        // Derive sequential unique Patient ID (e.g. P-101, P-102...)
        const existingPatients = getPatients();
        let maxNum = 100;
        existingPatients.forEach((p) => {
          if (p.id) {
            const match = String(p.id).match(/\d+/);
            if (match) {
              const num = parseInt(match[0], 10);
              if (num > maxNum) maxNum = num;
            }
          }
        });
        const patientId = `P-${maxNum + 1}`;

        // Add Patient Profile Record
        addPatient({
          id: patientId,
          name: trimmedName,
          contact: trimmedMobile,
          mobile: trimmedMobile,
          gender: gender,
          age: parseInt(age, 10),
          status: "Active",
          date: new Date().toISOString().split("T")[0],
          appointments: 0
        });

        // Add User Credential Record
        const newUser = {
          id: `U_${patientId}`,
          mobile: trimmedMobile,
          loginId: trimmedMobile,
          password: password,
          role: "patient",
          name: trimmedName,
          refId: patientId,
          status: "Active",
          createdDate: new Date().toISOString().split("T")[0]
        };
        addUser(newUser);

        // Auto-login and navigate immediately
        setCurrentUser(newUser);
        navigate("/patient-dashboard");
      }, 600);
      return;
    }

    // SIGN IN FLOW
    const rawInput = mobile.trim();
    const digitsOnly = rawInput.replace(/\D/g, "");

    if (!rawInput) {
      newErrors.mobile = "Mobile number or Login ID is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      const users = getUsers();
      const patients = getPatients();
      const doctors = getDoctors();

      // Find user by flexible mobile/loginId & password matching
      let user = users.find((u) => {
        const uMobileDigits = String(u.mobile || "").replace(/\D/g, "");
        const uLoginClean = String(u.loginId || "").trim().toLowerCase();
        const inputClean = rawInput.toLowerCase();

        const matchMobile =
          digitsOnly.length >= 7 &&
          uMobileDigits.length >= 7 &&
          (uMobileDigits === digitsOnly || uMobileDigits.slice(-10) === digitsOnly.slice(-10));
        const matchLogin = uLoginClean === inputClean || String(u.mobile || "").trim().toLowerCase() === inputClean;

        const passMatch = String(u.password || "").trim() === password.trim();
        return (matchMobile || matchLogin) && passMatch;
      });

      // If not matched by exact password, search by mobile/loginId only
      if (!user) {
        const userByMobile = users.find((u) => {
          const uMobileDigits = String(u.mobile || "").replace(/\D/g, "");
          const uLoginClean = String(u.loginId || "").trim().toLowerCase();
          const inputClean = rawInput.toLowerCase();
          return (
            (digitsOnly.length >= 7 && uMobileDigits.slice(-10) === digitsOnly.slice(-10)) ||
            uLoginClean === inputClean
          );
        });

        if (userByMobile) {
          // Found user account but wrong password entered
          setErrors({ mobile: "Invalid mobile number or password" });
          return;
        }
      }

      // If patient record exists in storage but user record was missing, create it
      if (!user && digitsOnly.length >= 7 && !isAdminMode) {
        const matchedPatient = patients.find((p) => {
          const pContactDigits = String(p.contact || p.mobile || "").replace(/\D/g, "");
          return pContactDigits.slice(-10) === digitsOnly.slice(-10);
        });

        if (matchedPatient) {
          user = {
            id: `U_${matchedPatient.id}`,
            mobile: digitsOnly.slice(-10),
            loginId: digitsOnly.slice(-10),
            password: password,
            role: "patient",
            name: matchedPatient.name || "Patient",
            refId: matchedPatient.id,
            status: "Active"
          };
          addUser(user);
        }
      }

      // If no account exists for a 10-digit mobile number, auto-register as new Patient
      if (!user && digitsOnly.length === 10 && !isAdminMode) {
        let maxNum = 100;
        patients.forEach((p) => {
          if (p.id) {
            const match = String(p.id).match(/\d+/);
            if (match) {
              const num = parseInt(match[0], 10);
              if (num > maxNum) maxNum = num;
            }
          }
        });
        const newPatientId = `P-${maxNum + 1}`;
        const patientName = "Patient";

        addPatient({
          id: newPatientId,
          name: patientName,
          contact: digitsOnly,
          mobile: digitsOnly,
          gender: "Not specified",
          age: 25,
          status: "Active",
          date: new Date().toISOString().split("T")[0],
          appointments: 0
        });

        user = {
          id: `U_${newPatientId}`,
          mobile: digitsOnly,
          loginId: digitsOnly,
          password: password,
          role: "patient",
          name: patientName,
          refId: newPatientId,
          status: "Active",
          createdDate: new Date().toISOString().split("T")[0]
        };
        addUser(user);
      }

      if (isAdminMode) {
        if (user && user.role === "admin") {
          if (user.status && user.status !== "Active") {
            setErrors({ mobile: "Your admin account is disabled. Contact administrator." });
            return;
          }
          setCurrentUser(user);
          navigate("/admin/dashboard");
        } else {
          setErrors({ mobile: "Invalid Admin ID or password" });
        }
        return;
      }

      if (user) {
        if (user.status && user.status !== "Active") {
          setErrors({ mobile: "Your account is disabled. Please contact system administrator." });
          return;
        }
        if (user.role === "doctor") {
          const doctorRecord = doctors.find(
            (d) => d.id === user.refId || d.loginId === user.loginId
          );
          if (doctorRecord && doctorRecord.status !== "Active") {
            setErrors({ mobile: "Your doctor account is inactive. Contact administrator." });
            return;
          }
        }

        setCurrentUser(user);
        if (user.role === "admin") navigate("/admin/dashboard");
        else if (user.role === "hospital") navigate("/hospital/dashboard");
        else if (user.role === "doctor") navigate("/doctor/dashboard");
        else navigate("/patient-dashboard");
      } else {
        setErrors({ mobile: "Invalid mobile number or password" });
      }
    }, 600);
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
              onClick={() => setIsAdminMode(!isAdminMode)}
              style={{ cursor: "pointer" }}
              title="Toggle Admin Login"
            >
              <HeartPulse size={16} />
            </div>
            <span className="login-auth-brand">MediBook</span>
          </div>

          <div className="login-auth-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                {activeTab === "signup"
                  ? "Create your MediBook account"
                  : isAdminMode
                  ? "Admin Login"
                  : "Welcome to MediBook"}
              </h1>
              <p className="welcome-desc">
                {activeTab === "signup"
                  ? "Register as a patient to find doctors and book appointments."
                  : isAdminMode
                  ? "Sign in to access the system administration panel."
                  : "Sign in to access your healthcare management dashboard."}
              </p>
            </div>

            {!isAdminMode && (
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
              {activeTab === "signup" && !isAdminMode && (
                <>
                  {/* Full Name */}
                  <FormField
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    required
                  />

                  {/* Age & Gender Row */}
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

              {/* Mobile Number */}
              <FormField
                label={isAdminMode ? "Admin ID" : "Mobile Number"}
                placeholder={isAdminMode ? "Enter admin ID" : "Enter 10-digit mobile number"}
                value={mobile}
                onChange={handleMobileChange}
                error={errors.mobile}
                required
              />

              {/* Password */}
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

              {/* Confirm Password (Sign Up Only) */}
              {activeTab === "signup" && !isAdminMode && (
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

              {/* Options / Terms */}
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
            </form>

            {!isAdminMode && activeTab === "signin" && (
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