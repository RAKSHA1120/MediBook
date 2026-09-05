const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.jsx', 'utf8');

// 1. Fix Imports
content = content.replace(
  /import \{ getUsers, addUser, getPatients, addPatient, setCurrentUser, getDoctors \} from "\.\.\/utils\/storage";/g,
  'import { setCurrentUser } from "../utils/auth";\nimport { api } from "../utils/api";\nimport { Stethoscope } from "lucide-react";'
);

// 2. Fix isAdminMode to loginMode
content = content.replace(
  /const \[isAdminMode, setIsAdminMode\] = useState\(false\);/g,
  `const [loginMode, setLoginMode] = useState("patient");
  const isAdminMode = loginMode === "admin";
  const isDoctorMode = loginMode === "doctor";`
);

// 3. Fix handleSubmit
const submitStart = content.indexOf('const handleSubmit = (e) => {');
const handleForgotStart = content.indexOf('const handleForgotPassword = (e) => {');

const newSubmit = `const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setSuccessMessage("");
    const newErrors = {};

    if (activeTab === "signup" && !isAdminMode && !isDoctorMode) {
      const trimmedName = name.trim();
      if (!trimmedName) newErrors.name = "Please enter your full name.";

      const ageNum = parseInt(age, 10);
      if (!age || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) newErrors.age = "Please enter a valid age (1-120).";

      if (!gender) newErrors.gender = "Please select your gender.";

      const trimmedMobile = mobile.trim();
      if (!trimmedMobile || !/^\\d{10}$/.test(trimmedMobile)) {
        newErrors.mobile = "Please enter a valid 10-digit mobile number.";
      }

      if (!password) newErrors.password = "Password is required.";
      if (!confirmPassword) newErrors.confirmPassword = "Confirm Password is required.";
      else if (password && password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

      if (!termsAccepted) newErrors.terms = "You must agree to the Terms of Service and Privacy Policy.";
    } else {
      if (!mobile.trim()) newErrors.mobile = "Login ID is required.";
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
        response = await api.post("/api/Auth/register", {
          name: name.trim(),
          mobile: mobile.trim(),
          password,
          gender,
          age: parseInt(age, 10),
        });
      } else {
        response = await api.post("/api/Auth/login", {
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
        } else if (isDoctorMode) {
          if (user.role.toLowerCase() === "doctor") {
            setCurrentUser(user);
            navigate("/doctor/dashboard");
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

  `;

content = content.substring(0, submitStart) + newSubmit + content.substring(handleForgotStart);

// 4. Update UI toggles
content = content.replace(
  /onClick=\{\(\) => setIsAdminMode\(\!isAdminMode\)\}/g,
  `onClick={() => {
                setLoginMode(prev => prev === "patient" ? "admin" : prev === "admin" ? "doctor" : "patient");
                setErrors({});
                setMobile("");
                setPassword("");
              }}`
);
content = content.replace(
  /<HeartPulse size=\{16\} \/>/g,
  `{isDoctorMode ? <Stethoscope size={16} /> : <HeartPulse size={16} />}`
);

// 5. Update titles
content = content.replace(
  /\{activeTab === "signup" \? "Create your MediBook account" : isAdminMode \? "Admin Login" : "Welcome to MediBook"\}/g,
  `{activeTab === "signup" ? "Create your MediBook account" : isDoctorMode ? "Doctor Login" : isAdminMode ? "Admin Login" : "Welcome to MediBook"}`
);
content = content.replace(
  /\{activeTab === "signup" \? "Register as a patient to find doctors and book appointments\." : isAdminMode \? "Sign in to access the system administration panel\." : "Sign in to access your healthcare management dashboard\."\}/g,
  `{activeTab === "signup" ? "Register as a patient to find doctors and book appointments." : isDoctorMode ? "Sign in with your doctor email and password." : isAdminMode ? "Sign in to access the system administration panel." : "Sign in to access your healthcare management dashboard."}`
);

// 6. Fix "Admin ID" logic in form
content = content.replace(
  /label=\{isAdminMode \? "Admin ID" : "Mobile Number"\}/g,
  `label={isDoctorMode ? "Doctor Email" : isAdminMode ? "Admin ID" : "Mobile Number"}`
);
content = content.replace(
  /placeholder=\{isAdminMode \? "Enter admin ID" : "Enter 10-digit mobile number"\}/g,
  `placeholder={isDoctorMode ? "e.g. sarah@medibook.com" : isAdminMode ? "Enter admin ID" : "Enter 10-digit mobile number"}`
);

fs.writeFileSync('src/pages/Login.jsx', content);
console.log('Login.jsx migration complete.');
