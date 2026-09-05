const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.jsx', 'utf8');

// 1. Add Doctor ID fetch logic
const loginLogicSearch = `        } else if (isDoctorMode) {
          if (user.role.toLowerCase() === "doctor") {
            setCurrentUser(user);
            navigate("/doctor/dashboard");`;

const loginLogicReplace = `        } else if (isDoctorMode) {
          if (user.role.toLowerCase() === "doctor") {
            try {
              const docRes = await api.get(\`/Doctors/user/\${user.id}\`);
              if (docRes.success && docRes.data) {
                user.doctorId = docRes.data.id;
                setCurrentUser(user);
                navigate("/doctor/dashboard");
              } else {
                setErrors({ mobile: "Doctor profile not found for this user." });
              }
            } catch (e) {
              setErrors({ mobile: "Failed to verify doctor profile." });
            }`;
            
content = content.replace(loginLogicSearch, loginLogicReplace);

// 2. Hide Sign Up for Doctor Mode
const signUpFormSearch = `{activeTab === "signup" && !isAdminMode && (`;
const signUpFormReplace = `{activeTab === "signup" && !isAdminMode && !isDoctorMode && (`;
content = content.replace(signUpFormSearch, signUpFormReplace);

const signUpConfirmSearch = `{activeTab === "signup" && !isAdminMode && (`;
const signUpConfirmReplace = `{activeTab === "signup" && !isAdminMode && !isDoctorMode && (`;
content = content.replace(signUpConfirmSearch, signUpConfirmReplace);

// 3. Add Doctor Login toggle to Admin Login
const adminFormEndSearch = `              </form>`;
const adminFormEndReplace = `                {isAdminMode && (
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
              </form>`;
content = content.replace(adminFormEndSearch, adminFormEndReplace);

fs.writeFileSync('src/pages/Login.jsx', content);
console.log('Login logic patched successfully');
