import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Activity,
  ArrowRight,
  Check,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailValid =
    email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 6
      ? 1
      : password.length < 10
      ? 2
      : 3;

  function handleSubmit(event) {
    event.preventDefault();

    if (!email || !password || !emailValid) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Login successful!");
    }, 1200);
  }

  return (
    <div className="login-page">
      {/* Dynamic Background Glows */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="bg-glow bg-glow-3"></div>

      <div className="login-layout">
        {/* Left branding panel */}
        <div className="login-info">
          {/* Heartbeat path SVG overlay in the background */}
          <div className="info-bg-pattern">
            <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-100,300 L200,300 L230,220 L260,380 L290,280 L310,320 L330,300 L500,300 L530,200 L560,400 L590,260 L610,330 L630,300 L900,300" 
                    stroke="rgba(255, 255, 255, 0.05)" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="heartbeat-line"
              />
            </svg>
          </div>

          <div className="brand-header animate-fade-in">
            <div className="brand-logo-container">
              <div className="brand-logo">
                <Activity size={28} className="pulse-icon" />
              </div>
              <div className="brand-logo-ring"></div>
            </div>

            <div className="brand-titles">
              <h1>MediBook</h1>
              <p className="brand-subtitle">Your healthcare, simplified.</p>
            </div>
          </div>

          {/* Frosted Testimonial Card */}
          <div className="healthcare-message animate-slide-up-1">
            <div className="message-icon-wrapper">
              <div className="message-icon">
                <Sparkles size={16} />
              </div>
            </div>

            <div className="message-text">
              <strong>Care made simple</strong>
              <p>
                Find trusted doctors, book appointments,
                and manage your healthcare in one place.
              </p>
            </div>
          </div>

          <div className="login-features">
            <div className="feature-item animate-slide-up-2">
              <div className="feature-check">
                <Check size={12} strokeWidth={3} />
              </div>
              <p>Find the right doctor</p>
            </div>

            <div className="feature-item animate-slide-up-3">
              <div className="feature-check">
                <Check size={12} strokeWidth={3} />
              </div>
              <p>Book appointments easily</p>
            </div>

            <div className="feature-item animate-slide-up-4">
              <div className="feature-check">
                <Check size={12} strokeWidth={3} />
              </div>
              <p>Manage your appointments</p>
            </div>
          </div>

          <div className="secure-badge animate-fade-in">
            <ShieldCheck size={14} className="secure-icon" />
            <span>Your information is secure</span>
          </div>
        </div>

        {/* Login section */}
        <div className="login-form-section animate-fade-in-right">
          <Card>
            <div className="login-header">
              <div className="welcome-tag">
                <Sparkles size={12} className="tag-icon" />
                <span className="welcome-label">WELCOME BACK</span>
              </div>

              <h2>Sign in to MediBook</h2>
              <p className="login-subtext">
                Enter your details to continue to your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-with-validation">
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    icon={Mail}
                  />
                </div>

                {email && !emailValid && (
                  <span className="field-message error animate-slide-down">
                    Please enter a valid email address
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="password-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-password-link"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="password-wrapper">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                    icon={Lock}
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

                {/* Password strength */}
                {password && (
                  <div className="password-strength-container animate-slide-down">
                    <div className="strength-bar-track">
                      <div 
                        className={`strength-bar-fill strength-level-${passwordStrength}`}
                        style={{ width: `${(passwordStrength / 3) * 100}%` }}
                      />
                    </div>

                    <span className={`strength-label-text strength-text-${passwordStrength}`}>
                      {passwordStrength === 1
                        ? "Weak password"
                        : passwordStrength === 2
                        ? "Good password"
                        : "Strong password"}
                    </span>
                  </div>
                )}
              </div>

              {/* Remember me & Options */}
              <div className="form-options">
                <label className="custom-checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-checkmark"></span>
                  <span className="checkbox-label">Remember me</span>
                </label>
              </div>

              {/* Login button */}
              <Button
                type="submit"
                disabled={
                  loading ||
                  !email ||
                  !password ||
                  !emailValid
                }
              >
                {loading ? (
                  <span className="login-loading">
                    <span className="spinner" />
                    Signing in...
                  </span>
                ) : (
                  <span className="btn-inner-content">
                    <span>Sign in</span>
                    <ArrowRight size={16} className="btn-arrow-icon" />
                  </span>
                )}
              </Button>
            </form>

            {/* Social Login Separator & Button */}
            <div className="social-divider">
              <span>or sign in with</span>
            </div>

            <div className="social-actions">
              <button type="button" className="social-btn google-btn">
                <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="register-link-container">
              <span>New to MediBook?</span>
              <button type="button" className="register-btn">
                Create an account
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Login;