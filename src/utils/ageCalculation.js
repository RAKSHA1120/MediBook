/**
 * Age Calculation Utility for MediBook
 * 
 * Safely parses Date of Birth strings and calculates completed years of age.
 * Protects against timezone off-by-one errors by operating purely on calendar integers.
 */

/**
 * Parses a DOB string into calendar integers: { year, month, day }
 * Handles:
 * - "YYYY-MM-DD" (HTML <input type="date"> value)
 * - "DD-MM-YYYY" or "DD/MM/YYYY" (Display formats)
 * - ISO strings "YYYY-MM-DDTHH:mm:ss..."
 * 
 * @param {string} dobStr 
 * @returns {{ year: number, month: number, day: number } | null}
 */
export function parseDob(dobStr) {
  if (!dobStr || typeof dobStr !== "string") return null;

  const trimmed = dobStr.trim().split("T")[0];
  const delimiter = trimmed.includes("-") ? "-" : trimmed.includes("/") ? "/" : null;
  if (!delimiter) return null;

  const parts = trimmed.split(delimiter).map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) return null;

  let year, month, day;
  if (parts[0] > 1000) {
    // Format: YYYY-MM-DD
    [year, month, day] = parts;
  } else if (parts[2] > 1000) {
    // Format: DD-MM-YYYY
    [day, month, year] = parts;
  } else {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Validate actual calendar date existence (e.g. leap years, 30-day months)
  const testDate = new Date(year, month - 1, day);
  if (
    testDate.getFullYear() !== year ||
    testDate.getMonth() !== month - 1 ||
    testDate.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

/**
 * Calculates completed years of age based on Date of Birth.
 * 
 * Formula:
 * age = currentYear - birthYear
 * If current date is strictly before the birthday in current year:
 * age = age - 1
 * 
 * @param {string} dobStr - Date of birth string
 * @param {Date} [referenceDate=new Date()] - Optional reference date (defaults to today)
 * @returns {{ valid: boolean, age: number | null, error: string | null }}
 */
export function calculateAgeFromDob(dobStr, referenceDate = new Date()) {
  if (!dobStr || (typeof dobStr === "string" && !dobStr.trim())) {
    return { valid: false, age: null, error: null };
  }

  const parsed = parseDob(dobStr);
  if (!parsed) {
    return { valid: false, age: null, error: "Invalid Date of Birth format." };
  }

  const { year: birthYear, month: birthMonth, day: birthDay } = parsed;

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1; // 1-indexed (1-12)
  const currentDay = referenceDate.getDate(); // 1-indexed (1-31)

  // Check for future date
  if (
    birthYear > currentYear ||
    (birthYear === currentYear && (birthMonth > currentMonth || (birthMonth === currentMonth && birthDay > currentDay)))
  ) {
    return {
      valid: false,
      age: null,
      error: "Date of Birth cannot be in the future."
    };
  }

  let age = currentYear - birthYear;
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age -= 1;
  }

  return {
    valid: true,
    age,
    error: null
  };
}

/**
 * Formats a DOB string as DD-MM-YYYY for display purposes.
 * Preserves existing display behavior.
 * 
 * @param {string} dobStr 
 * @returns {string}
 */
export function formatDobForDisplay(dobStr) {
  if (!dobStr) return "N/A";
  const parsed = parseDob(dobStr);
  if (!parsed) return dobStr;
  const d = String(parsed.day).padStart(2, "0");
  const m = String(parsed.month).padStart(2, "0");
  const y = String(parsed.year);
  return `${d}-${m}-${y}`;
}

/**
 * Validates a Doctor's Date of Birth according to MediBook business rules:
 * 1. DOB is mandatory for new Doctor creation.
 * 2. If empty: "Date of Birth is required."
 * 3. If invalid format: "Invalid Date of Birth format."
 * 4. If future date: "Date of Birth cannot be in the future."
 * 5. Minimum completed age must be at least 23: "Doctor must be at least 23 years old."
 * 
 * @param {string} dobStr 
 * @param {Date} [referenceDate=new Date()] 
 * @returns {{ valid: boolean, age: number | null, error: string | null }}
 */
export function validateDoctorDob(dobStr, referenceDate = new Date()) {
  if (!dobStr || (typeof dobStr === "string" && !dobStr.trim())) {
    return { valid: false, age: null, error: "Date of Birth is required." };
  }

  const result = calculateAgeFromDob(dobStr, referenceDate);
  if (result.error) {
    return { valid: false, age: null, error: result.error };
  }

  if (result.age !== null && result.age < 23) {
    return { valid: false, age: result.age, error: "Doctor must be at least 23 years old." };
  }

  return { valid: true, age: result.age, error: null };
}

/**
 * Returns today's date in local 'YYYY-MM-DD' format for date picker max attribute.
 * @param {Date} [d=new Date()]
 * @returns {string}
 */
export function getTodayDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
