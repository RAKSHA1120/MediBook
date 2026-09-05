const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.jsx', 'utf8');

const targetStr = `{activeTab === "signup" ? "Create your MediBook account" : isDoctorMode ? "Doctor Login" : isAdminMode ? "Admin Login" : "Welcome to MediBook"}
              </h1>
              <p className="welcome-desc">
                {activeTab === "signup" ? "Register as a patient to find doctors and book appointments." : isDoctorMode ? "Sign in with your doctor email and password." : isAdminMode ? "Sign in to access the system administration panel." : "Sign in to access your healthcare management dashboard."}
              </p>`;

const replacementStr = `{activeTab === "signup" ? "Create your MediBook account" : isDoctorMode ? "Doctor Login" : isAdminMode ? "Admin Login" : "Welcome to MediBook"}
              </h1>
              <p className="welcome-desc">
                {activeTab === "signup" ? "Register as a patient to find doctors and book appointments." : isDoctorMode ? "Sign in with your doctor email and password." : isAdminMode ? "Sign in to access the system administration panel." : "Sign in to access your healthcare management dashboard."}
              </p>
              {(isDoctorMode || isAdminMode) && (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={() => { setLoginMode("admin"); setErrors({}); setMobile(""); setPassword(""); }}
                    style={{
                      padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", border: "1.5px solid",
                      cursor: "pointer",
                      background: isAdminMode ? "#7c3aed" : "transparent",
                      color: isAdminMode ? "#fff" : "#7c3aed",
                      borderColor: "#7c3aed"
                    }}
                  >Admin</button>
                  <button
                    type="button"
                    onClick={() => { setLoginMode("doctor"); setErrors({}); setMobile(""); setPassword(""); }}
                    style={{
                      padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", border: "1.5px solid",
                      cursor: "pointer",
                      background: isDoctorMode ? "#059669" : "transparent",
                      color: isDoctorMode ? "#fff" : "#059669",
                      borderColor: "#059669"
                    }}
                  >Doctor</button>
                  <button
                    type="button"
                    onClick={() => { setLoginMode("patient"); setErrors({}); setMobile(""); setPassword(""); }}
                    style={{
                      padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", border: "1.5px solid",
                      cursor: "pointer", background: "transparent", color: "#64748b", borderColor: "#94a3b8"
                    }}
                  >← Patient Login</button>
                </div>
              )}`;

content = content.replace(targetStr, replacementStr);

const hideAuthToggleStr = `{!isAdminMode && (
              <div className="auth-toggle">`;
const hideAuthToggleReplacement = `{!isAdminMode && !isDoctorMode && (
              <div className="auth-toggle">`;

content = content.replace(hideAuthToggleStr, hideAuthToggleReplacement);

fs.writeFileSync('src/pages/Login.jsx', content);
console.log('UI patch complete.');
