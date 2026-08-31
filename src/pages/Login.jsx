import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CalendarDays,
  Workflow,
  BarChart3,
  HeartPulse,
} from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import FormField from "../components/FormField";
import Checkbox from "../components/Checkbox";
import hospitalIllustration from "../assets/hospital_appointment_illustration.png";
import { getUsers, addUser, addPatient, setCurrentUser, getDoctors } from "../utils/storage";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("signin");
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleMobileChange = (e) => {
    setMobile(e.target.value);
    if (errors.mobile) {
      setErrors((prev) => ({ ...prev, mobile: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password || errors.mobile === "Invalid mobile number or password") {
      setErrors((prev) => ({
        ...prev,
        password: "",
        mobile: prev.mobile === "Invalid mobile number or password" ? "" : prev.mobile
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    const newErrors = {};

    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number or Login ID is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (activeTab === "signup") {
      if (!name.trim()) newErrors.name = "Name is required";
      if (!age) newErrors.age = "Age is required";
      if (!gender) newErrors.gender = "Gender is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      
      if (activeTab === "signup") {
        const users = getUsers();
        if (users.find(u => u.mobile === mobile.trim())) {
           setErrors({ mobile: "Mobile number already registered" });
           return;
        }

        const newPatientId = `P_${Date.now()}`;
        addPatient({
          id: newPatientId,
          name: name.trim(),
          contact: mobile.trim(),
          gender,
          age: parseInt(age, 10),
          status: "Active",
          date: new Date().toISOString().split("T")[0],
          appointments: 0
        });
        addUser({
          id: `U_${newPatientId}`,
          mobile: mobile.trim(),
          loginId: mobile.trim(),
          password,
          role: "patient",
          name: name.trim(),
          refId: newPatientId,
          status: "Active",
          createdDate: new Date().toISOString().split("T")[0]
        });
        alert("Registration successful! Please login.");
        setActiveTab("signin");
        return;
      }

      // Login Flow
      const users = getUsers();
      const user = users.find(u => (u.mobile === mobile.trim() || u.loginId === mobile.trim()) && u.password === password);
      
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
           const doctors = getDoctors();
           const doctorRecord = doctors.find(d => d.id === user.refId || d.loginId === user.loginId);
           if (doctorRecord && doctorRecord.status !== "Active") {
              setErrors({ mobile: "Your doctor account is inactive. Contact administrator." });
              return;
           }
        }
        
        setCurrentUser(user);
        if (user.role === "admin") navigate("/admin/dashboard");
        else if (user.role === "doctor") navigate("/doctor/dashboard");
        else navigate("/patient-dashboard");
      } else {
        setErrors({ mobile: "Invalid mobile number or password" });
      }
    }, 800);
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
              MediBook helps hospitals streamline operations, improve patient care and make smarter decisions from one connected platform.
            </p>
          </div>
          <div className="showcase-features">
            <div className="showcase-feature-item">
              <ShieldCheck size={16} className="showcase-feature-icon" />
              <span>Secure Data Protection</span>
            </div>
            <div className="showcase-feature-item">
              <Workflow size={16} className="showcase-feature-icon" />
              <span>Integrated Operations</span>
            </div>
            <div className="showcase-feature-item">
              <BarChart3 size={16} className="showcase-feature-icon" />
              <span>Real-time Reports & Analytics</span>
            </div>
          </div>
        </div>

        {/* AUTHENTICATION PANEL */}
        <div className="login-auth-panel">
          <div className="login-auth-header">
            <div 
              className="login-auth-logo-mark" 
              onClick={() => setIsAdminMode(!isAdminMode)}
              style={{cursor: "pointer"}}
              title="Toggle Admin Login"
            >
              <HeartPulse size={16} />
            </div>
            <span className="login-auth-brand">MediBook</span>
          </div>

          <div className="login-auth-content">
            <div className="welcome-section">
              <h1 className="welcome-title">{isAdminMode ? "Admin Login" : "Welcome to MediBook"}</h1>
              <p className="welcome-desc">
                {isAdminMode ? "Sign in to access the system administration panel." : "Sign in to access your healthcare management dashboard."}
              </p>
            </div>

            {!isAdminMode && (
              <div className="auth-toggle">
                <button
                  type="button"
                  className={`auth-toggle-btn ${activeTab === "signin" ? "active" : ""}`}
                  onClick={() => setActiveTab("signin")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-toggle-btn ${activeTab === "signup" ? "active" : ""}`}
                  onClick={() => setActiveTab("signup")}
                >
                  Sign Up
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              
              {activeTab === "signup" && !isAdminMode && (
                <>
                  <FormField
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    required
                  />
                  <div style={{display: "flex", gap: "16px"}}>
                    <FormField
                      label="Age"
                      type="number"
                      placeholder="Age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      error={errors.age}
                      required
                    />
                    <div className="form-field" style={{flex: 1}}>
                      <label className="form-label">Gender <span className="form-required">*</span></label>
                      <select 
                        className="form-input" 
                        value={gender} 
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && <span className="form-error">{errors.gender}</span>}
                    </div>
                  </div>
                </>
              )}

              <FormField
                label={isAdminMode ? "Admin ID" : "Mobile Number"}
                placeholder={isAdminMode ? "Enter admin ID" : "Enter your mobile number"}
                value={mobile}
                onChange={handleMobileChange}
                error={errors.mobile}
                required
              />

              <div className="form-field">
                <div className="password-label-row">
                  <label htmlFor="password" className="form-label">
                    Password <span className="form-required">*</span>
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
                {errors.password && (
                  <span className="form-error">{errors.password}</span>
                )}
              </div>

              {activeTab === "signin" && (
                <div className="form-options">
                  <Checkbox
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                </div>
              )}

              <div className="login-btn-wrapper">
                <Button type="submit" loading={loading} disabled={loading}>
                  {activeTab === "signup" ? "Sign Up" : "Sign In"}
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
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button type="button" className="social-btn" disabled>
                    <svg width="18" height="18" viewBox="0 0 23 23" fill="currentColor">
                      <path d="M0 0h11v11H0z" fill="#F25022"/>
                      <path d="M12 0h11v11H12z" fill="#7FBA00"/>
                      <path d="M0 12h11v11H0z" fill="#00A4EF"/>
                      <path d="M12 12h11v11H12z" fill="#FFB900"/>
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
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Terms of Service..."); }}>Terms of Service</a>
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Privacy Policy..."); }}>Privacy Policy</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;