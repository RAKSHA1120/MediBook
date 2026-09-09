const fs = require('fs');
let content = fs.readFileSync('src/pages/DoctorSchedule.jsx', 'utf8');

// Add import
if (!content.includes('getCurrentDoctor')) {
  content = content.replace('import { getCurrentUser } from "../utils/auth";', 'import { getCurrentUser, getCurrentDoctor } from "../utils/auth";');
}

// Update doc ID
const idSearch = `    const rawDocId = doc?.id ?? user?.refId ?? user?.id;`;
const idReplace = `    const rawDocId = user?.doctorId || doc?.id || user?.refId || user?.id;`;
content = content.replace(idSearch, idReplace);

fs.writeFileSync('src/pages/DoctorSchedule.jsx', content);
console.log('DoctorSchedule patched.');
