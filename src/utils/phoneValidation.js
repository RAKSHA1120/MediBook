/**
 * MediBook Centralized Phone Number Validation & Input Helpers
 * Strict requirement: exactly 10 numeric digits only (/^[0-9]{10}$/)
 */

export const PHONE_REGEX = /^[0-9]{10}$/;
export const PHONE_ERROR_MESSAGE = "Phone number must be exactly 10 digits.";

/**
 * Validates whether the given value is strictly a 10-digit phone number.
 * @param {string|number|null|undefined} value
 * @returns {boolean}
 */
export function isValidPhoneNumber(value) {
  if (value === null || value === undefined) return false;
  const str = String(value).trim();
  return PHONE_REGEX.test(str);
}

/**
 * Filters input values during typing or paste events:
 * - Only numeric digits (0-9) are accepted.
 * - Caps maximum length at 10 digits.
 * - Does NOT auto-convert +91 prefix or non-numeric formats into a valid number.
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
export function filterPhoneInput(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);

  // If the input explicitly includes '+', do not auto-convert (+91 must remain invalid/rejected)
  if (str.includes("+")) {
    return "";
  }

  // Remove non-numeric characters and cap at 10 digits
  return str.replace(/\D/g, "").slice(0, 10);
}

/**
 * KeyDown handler to restrict normal typing to digits only (0-9).
 * Preserves navigation, editing keys, and keyboard shortcuts (Ctrl/Cmd).
 * @param {React.KeyboardEvent} e
 */
export function handlePhoneKeyDown(e) {
  if (
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key === "Tab" ||
    e.key === "Enter" ||
    e.key === "Escape" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown" ||
    e.key === "Home" ||
    e.key === "End" ||
    e.ctrlKey ||
    e.metaKey
  ) {
    return;
  }

  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

/**
 * Common HTML input attributes for phone/mobile/contact number fields
 */
export const phoneInputProps = {
  type: "tel",
  inputMode: "numeric",
  maxLength: 10,
};
