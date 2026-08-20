import { useState } from "react";
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
import "./Login.css";

const loginUser = {
  mobile: "9876543210",
  password: "123456"
};

function Login() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("signin");

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
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (mobile.trim() !== loginUser.mobile || password !== loginUser.password) {
      setErrors({ mobile: "Invalid mobile number or password" });
      return;
    }

    setErrors({});
    setLoading(true);

    // Simulate authentication processing
    setTimeout(() => {
      setLoading(false);
      alert("Login successful!");
    }, 1200);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Forgot password clicked. Redirecting to recovery flow...");
  };

  const handleSignUpClick = () => {
    setActiveTab("signup");
    alert("Sign Up flow is currently presentational.");
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-outer-container">
        
        {/* HEALTHCARE SHOWCASE (now on the left on desktop, top on mobile) */}
        <div className="login-showcase-panel">
          
          {/* Background Illustration covering the entire panel */}
          <img
            src={hospitalIllustration}
            alt="Hospital Background"
            className="login-showcase-bg-image"
          />

          {/* Main Showcase Message */}
          <div className="showcase-message-container">
            <h2 className="showcase-title">
              Manage Healthcare<br />Better, Together
            </h2>
            <p className="showcase-desc">
              MediBook helps hospitals streamline operations, improve patient care and make smarter decisions from one connected platform.
            </p>
          </div>

          {/* Bottom Features */}
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

        {/* AUTHENTICATION PANEL (now on the right on desktop, bottom on mobile) */}
        <div className="login-auth-panel">
          <div className="login-auth-header">
            <div className="login-auth-logo-mark">
              <HeartPulse size={16} />
            </div>
            <span className="login-auth-brand">MediBook</span>
          </div>

          <div className="login-auth-content">
            <div className="welcome-section">
              <h1 className="welcome-title">Welcome to MediBook</h1>
              <p className="welcome-desc">
                Sign in to access your healthcare management dashboard.
              </p>
            </div>

            {/* Segmented Auth Toggle Switch */}
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
                onClick={handleSignUpClick}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              {/* Mobile Number Input */}
              <FormField
                label="Mobile Number"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={handleMobileChange}
                error={errors.mobile}
                required
              />

              {/* Password Input with label-row for forgot password link */}
              <div className="form-field">
                <div className="password-label-row">
                  <label htmlFor="password" className="form-label">
                    Password <span className="form-required">*</span>
                  </label>
                  <a
                    href="#forgot"
                    className="forgot-password-link"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </a>
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="form-error">{errors.password}</span>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="form-options">
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              </div>

              {/* Login Button */}
              <div className="login-btn-wrapper">
                <Button type="submit" loading={loading} disabled={loading}>
                  Sign In
                </Button>
              </div>
            </form>

            {/* Social / Alternative Login */}
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