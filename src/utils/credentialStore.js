/**
 * Transient In-Memory Store for Newly Provisioned Account Credentials
 * 
 * IMPORTANT SECURITY RULES:
 * 1. Held strictly in JavaScript RAM only.
 * 2. Never persisted to localStorage, sessionStorage, cookies, or disk.
 * 3. Never logged or exposed via console.
 * 4. Consumed once viewed so passwords are only shown once as required.
 */

const transientStore = new Map();

/**
 * Store credentials in transient state
 * @param {string|number} key - Login ID, email, or user ID
 * @param {Object} data - { password, name, role, loginId }
 */
export const setProvisionedCredential = (key, data) => {
  if (!key) return;
  const normalizedKey = String(key).trim().toLowerCase();
  transientStore.set(normalizedKey, {
    ...data,
    timestamp: Date.now()
  });
};

/**
 * Retrieve credentials without consuming
 * @param {string|number} key
 */
export const getProvisionedCredential = (key) => {
  if (!key) return null;
  const normalizedKey = String(key).trim().toLowerCase();
  return transientStore.get(normalizedKey) || null;
};

/**
 * Consume credentials (shown once, then removed from transient state)
 * @param {string|number} key
 */
export const consumeProvisionedCredential = (key) => {
  if (!key) return null;
  const normalizedKey = String(key).trim().toLowerCase();
  const cred = transientStore.get(normalizedKey);
  if (cred) {
    transientStore.delete(normalizedKey);
  }
  return cred || null;
};

/**
 * Generates an initial strong password adhering to all security requirements
 * (uppercase, lowercase, number, special char @, 8+ characters)
 * @param {string} role - 'Doctor' | 'Hospital' | 'Patient' | 'Admin'
 */
export const generateStrongRolePassword = (role = "User") => {
  const r = (role || "").toLowerCase();
  let prefix = "MediBook";
  if (r === "doctor") prefix = "Doctor";
  else if (r === "hospital") prefix = "Hospital";
  else if (r === "patient") prefix = "Patient";
  else if (r === "admin") prefix = "Admin";

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}@${randomDigits}`;
};
