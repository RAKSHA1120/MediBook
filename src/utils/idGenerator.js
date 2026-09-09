// Utility to generate unique Login ID and Password

export function generateLoginId(name, dobYear, existingUsers) {
  // Normalize name: remove titles, spaces, lowercase
  let baseName = name.toLowerCase().replace(/^(dr\.|dr\s|mr\.|mrs\.|ms\.)\s*/i, '').replace(/\s+/g, '');
  // Take whole normalized name
  baseName = baseName.toLowerCase();

  let baseId = `${baseName}${dobYear}`;
  let finalId = baseId;
  let counter = 1;

  // Check against existing users to ensure uniqueness
  while (existingUsers.some(user => user.loginId === finalId)) {
    finalId = `${baseId}${counter}`;
    counter++;
  }

  return finalId;
}

export function generatePassword(name, dobYear) {
  // Example format: Aru@2005#01
  let baseName = name.replace(/^(dr\.|dr\s|mr\.|mrs\.|ms\.)\s*/i, '').replace(/\s+/g, '');
  let prefix = baseName.substring(0, 3);
  // Capitalize first letter
  if (prefix.length > 0) {
    prefix = prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
  }

  // Generate random 2 digit number
  const randomNum = Math.floor(Math.random() * 900) + 1; // 1 to 900
  return `${prefix}@${dobYear}#${randomNum}`;
}
