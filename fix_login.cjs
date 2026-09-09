const fs = require('fs');
const filepath = 'C:\\Users\\hp\\MediBook\\src\\pages\\Login.jsx';
let content = fs.readFileSync(filepath, 'utf8');

// We need to completely replace the handleSubmit logic to just use the API and not fallback to getUsers()
const newHandleSubmit = `  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setSuccessMessage("");
    const newErrors = {};

    if (activeTab === "signup") {
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

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});
      setLoading(true);

      try {
        const response = await api.post("/Auth/register", {
          name: trimmedName,
          mobile: trimmedMobile,
          password: password,
          gender: gender,
          age: parseInt(age, 10)
        });

        if (response.success) {
          setCurrentUser(response.data);
          navigate("/patient-dashboard");
        } else {
          setErrors({ mobile: response.error || "Failed to register account." });
        }
      } catch (err) {
        setErrors({ mobile: "An unexpected error occurred during registration." });
      } finally {
        setLoading(false);
      }
      return;
    }

    // SIGN IN FLOW
    const rawInput = mobile.trim();
    if (!rawInput) newErrors.mobile = "Mobile number or Login ID is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await api.post("/Auth/login", { loginId: rawInput, password });
      
      if (response.success) {
        const user = response.data;
        if (isAdminMode) {
          if (user.role.toLowerCase() === "admin") {
            setCurrentUser(user);
            navigate("/admin/dashboard");
          } else {
            setErrors({ mobile: "Invalid Admin ID or password" });
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
        setErrors({ mobile: response.error || "Invalid mobile number or password" });
      }
    } catch (err) {
      setErrors({ mobile: "An unexpected error occurred during login." });
    } finally {
      setLoading(false);
    }
  };`;

// Replace the entire handleSubmit block
const startIdx = content.indexOf('const handleSubmit = async (e) => {');
const endIdx = content.indexOf('const handleForgotPassword = (e) => {');

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newHandleSubmit + '\n\n  ' + content.substring(endIdx);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log("Replaced handleSubmit successfully");
} else {
    console.log("Could not find handleSubmit or handleForgotPassword markers");
}
